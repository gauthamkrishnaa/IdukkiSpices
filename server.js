const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const database = require("./database");

const root = __dirname;
const distRoot = path.join(root, "dist");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator === -1) return;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

loadEnvFile();

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set in the environment`);
  return value;
}

const adminEmail = requiredEnv("ADMIN_EMAIL");
const adminPasswordHash = requiredEnv("ADMIN_PASSWORD_HASH");
const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://${host}:${port}`;
const sessionSecret = requiredEnv("SESSION_SECRET");
const adminSessions = new Set();
const MIN_ORDER_VALUE = 20;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 4.99;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function calculateOrderCharges(items = []) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
  const shippingFee = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    total: Number((subtotal + shippingFee).toFixed(2))
  };
}

const frenchProductNames = {
  "green-cardamom-50": "Cardamome verte 50g",
  "green-cardamom-100": "Cardamome verte 100g",
  "mixed-spices-100": "Mélange d'épices 100g",
  "black-pepper": "Poivre noir",
  cloves: "Clous de girofle",
  cinnamon: "Cannelle",
  "star-anise": "Anis étoilé",
  "bay-leaves": "Feuilles de laurier"
};

function frenchProductName(item) {
  return frenchProductNames[item.id] || item.name || "Article";
}

function frenchInvoiceEmail(order) {
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "Date non disponible";
  const subtotal = Number(order.subtotal ?? (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0));
  const shippingFee = Number(order.shippingFee || 0);
  const lines = [
    "Bonjour,",
    "",
    `Merci pour votre commande chez Idukki Spices.`,
    "",
    `Facture: ${order.id}`,
    `Date: ${created}`,
    "",
    "Facturé à:",
    `${order.customer?.name || "Client"}`,
    `${order.customer?.email || order.customerEmail || ""}`,
    `${order.customer?.phone || "Téléphone non renseigné"}`,
    `${order.customer?.address || "Adresse non renseignée"}`,
    "",
    "Articles:"
  ];
  (order.items || []).forEach((item) => {
    const lineTotal = Number(item.qty || 0) * Number(item.price || 0);
    lines.push(`- ${frenchProductName(item)} | Qté: ${item.qty} | Prix: €${Number(item.price || 0).toFixed(2)} | Total: €${lineTotal.toFixed(2)}`);
  });
  lines.push(
    "",
    `Sous-total: €${subtotal.toFixed(2)}`,
    `Livraison: ${shippingFee ? `€${shippingFee.toFixed(2)}` : "Gratuite"}`,
    `Total: €${Number(order.total || 0).toFixed(2)}`,
    "",
    "Merci pour votre achat chez Idukki Spices."
  );
  return lines.join("\n");
}

function orderNotificationEmail(order, type) {
  const customerName = order.customer?.name || "Client";
  const total = Number(order.total || 0).toFixed(2);
  const messages = {
    cancelled: {
      subject: `Commande annulée Idukki Spices ${order.id}`,
      lines: [
        `Bonjour ${customerName},`,
        "",
        `Votre commande ${order.id} a bien été annulée.`,
        "",
        `Montant de la commande: €${total}`,
        "",
        "Si vous avez déjà payé cette commande, vous pouvez demander un remboursement depuis votre compte.",
        "",
        "Merci,",
        "Idukki Spices"
      ]
    },
    refundRequested: {
      subject: `Demande de remboursement reçue ${order.id}`,
      lines: [
        `Bonjour ${customerName},`,
        "",
        `Nous avons reçu votre demande de remboursement pour la commande ${order.id}.`,
        "",
        `Montant concerné: €${total}`,
        "",
        "Notre équipe va vérifier la commande et approuver le remboursement si les conditions sont remplies.",
        "",
        "Merci,",
        "Idukki Spices"
      ]
    },
    refundCredited: {
      subject: `Remboursement approuvé ${order.id}`,
      lines: [
        `Bonjour ${customerName},`,
        "",
        `Le remboursement de votre commande ${order.id} a été approuvé.`,
        "",
        `Montant remboursé: €${total}`,
        "",
        "Le montant sera crédité sur votre moyen de paiement d'origine selon les délais de votre banque.",
        "",
        "Merci,",
        "Idukki Spices"
      ]
    },
    packed: {
      subject: `Commande préparée ${order.id}`,
      lines: [
        `Bonjour ${customerName},`,
        "",
        `Votre commande ${order.id} est maintenant préparée.`,
        "",
        "Elle sera remise au transporteur prochainement.",
        "",
        "Merci,",
        "Idukki Spices"
      ]
    },
    shipped: {
      subject: `Commande expédiée ${order.id}`,
      lines: [
        `Bonjour ${customerName},`,
        "",
        `Votre commande ${order.id} a été expédiée.`,
        "",
        "Vous recevrez votre colis selon les délais du transporteur.",
        "",
        "Merci,",
        "Idukki Spices"
      ]
    },
    delivered: {
      subject: `Commande livrée ${order.id}`,
      lines: [
        `Bonjour ${customerName},`,
        "",
        `Votre commande ${order.id} est indiquée comme livrée.`,
        "",
        "Nous espérons que vous apprécierez vos épices Idukki Spices.",
        "",
        "Merci,",
        "Idukki Spices"
      ]
    }
  };
  const message = messages[type];
  return {
    subject: message.subject,
    body: message.lines.join("\n")
  };
}

async function sendOrderNotification(order, type) {
  const to = order.customer?.email || order.customerEmail;
  if (!to) return { sent: false, error: "Customer email missing" };
  try {
    const message = orderNotificationEmail(order, type);
    return await sendEmail(to, message.subject, message.body);
  } catch (error) {
    return { sent: false, error: error.message };
  }
}

function companyEmail() {
  return process.env.COMPANY_EMAIL || process.env.ADMIN_EMAIL || adminEmail;
}

function customerActionNotification({ type, title, body, order = null, customer = null }) {
  const orderId = order?.id || "";
  const customerEmail = customer?.email || order?.customer?.email || order?.customerEmail || "";
  database.createAdminNotification({ type, title, body, orderId, customerEmail });
  return sendEmail(companyEmail(), `Idukki Spices admin: ${title}`, [
    title,
    "",
    body,
    orderId ? `Order: ${orderId}` : "",
    customerEmail ? `Customer: ${customerEmail}` : "",
    "",
    "Open the admin dashboard to review this update."
  ].filter(Boolean).join("\n")).catch((error) => ({ sent: false, error: error.message }));
}

function deliveryNotificationType(status) {
  return {
    Packed: "packed",
    Shipped: "shipped",
    Delivered: "delivered"
  }[status] || "";
}

function isConfirmedOrder(order) {
  return order?.paymentStatus && order.paymentStatus !== "Pending";
}

function pdfText(value) {
  return String(value ?? "")
    .replace(/€/g, "EUR")
    .replace(/[^\x09\x0A\x0D\x20-\x7EÀ-ÿ]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createFrenchInvoicePdf(order) {
  const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : "Date non disponible";
  const subtotal = Number(order.subtotal ?? (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0));
  const shippingFee = Number(order.shippingFee || 0);
  const vatAmount = 0;
  const commands = [];
  const text = (value, x, y, size = 10, font = "F1") => {
    commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`);
  };
  const rightText = (value, rightX, y, size = 10, font = "F1") => {
    const approximateWidth = String(value || "").length * size * 0.48;
    text(value, Math.max(40, rightX - approximateWidth), y, size, font);
  };
  const line = (x1, y1, x2, y2, width = 0.6) => {
    commands.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const moneyText = (value) => `EUR ${Number(value || 0).toFixed(2)}`;

  text("FACTURE", 470, 790, 20, "F2");
  rightText(`Date facture: ${createdDate}`, 553, 765, 9);
  rightText("Échéance: Immédiate", 553, 748, 9);
  rightText("Type: Livraison de marchandises", 553, 731, 9);

  text("Idukki Spices", 43, 690, 10, "F2");
  text("56 rue Philippe de Girard", 43, 674, 10);
  text("75018 Paris", 43, 658, 10);
  text("France", 43, 642, 10);

  text(order.customer?.name || "Client", 326, 690, 10, "F2");
  text(order.customer?.address || "Adresse non renseignée", 326, 674, 10);
  text(order.customer?.phone || "Téléphone non renseigné", 326, 658, 10);
  text(order.customer?.email || order.customerEmail || "", 326, 642, 10);

  text("Description", 47, 550, 9, "F2");
  text("Date", 210, 550, 9, "F2");
  text("Qté", 285, 550, 9, "F2");
  text("Unité", 326, 550, 9, "F2");
  text("Prix unité", 383, 550, 9, "F2");
  text("TVA %", 455, 550, 9, "F2");
  rightText("Total", 548, 550, 9, "F2");
  line(47, 540, 548, 540);

  let rowY = 520;
  (order.items || []).forEach((item) => {
    const quantity = Number(item.qty || 0);
    const lineTotal = quantity * Number(item.price || 0);
    text(frenchProductName(item).slice(0, 28), 47, rowY, 9);
    text(createdDate, 202, rowY, 9);
    rightText(quantity.toFixed(2), 300, rowY, 9);
    text("pack", 326, rowY, 9);
    rightText(moneyText(item.price), 426, rowY, 9);
    rightText("0.00%", 482, rowY, 9);
    rightText(moneyText(lineTotal), 548, rowY, 9);
    rowY -= 18;
  });
  if (shippingFee > 0) {
    text("Livraison", 47, rowY, 9);
    text(createdDate, 202, rowY, 9);
    rightText("1.00", 300, rowY, 9);
    text("service", 326, rowY, 9);
    rightText(moneyText(shippingFee), 426, rowY, 9);
    rightText("0.00%", 482, rowY, 9);
    rightText(moneyText(shippingFee), 548, rowY, 9);
    rowY -= 18;
  }
  line(47, rowY + 8, 548, rowY + 8);

  const totalsY = Math.min(rowY - 26, 485);
  text("Total hors TVA", 400, totalsY, 9);
  rightText(moneyText(subtotal + shippingFee), 548, totalsY, 9);
  text("TVA 0.00%", 400, totalsY - 16, 9);
  rightText(moneyText(vatAmount), 548, totalsY - 16, 9);
  text("Total à payer", 400, totalsY - 40, 11, "F2");
  rightText(moneyText(order.total), 548, totalsY - 40, 11, "F2");

  text("Idukki Spices", 268, 68, 10, "F2");
  text("56 rue Philippe de Girard 75018 Paris", 206, 50, 8);

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const stream = commands.join("\n");
  const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
  const pageId = objects.length + 1;
  const pagesId = objects.length + 2;
  addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  addObject(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

function verifyPassword(password, storedHash) {
  const [salt, expected] = String(storedHash || "").split(":");
  if (!salt || !expected) return false;
  const actual = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
  return safeEqual(actual, expected, "hex");
}

function safeEqual(actual, expected, encoding = "utf8") {
  const actualBuffer = Buffer.from(String(actual || ""), encoding);
  const expectedBuffer = Buffer.from(String(expected || ""), encoding);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function otpHash(code) {
  return crypto
    .createHmac("sha256", sessionSecret)
    .update(String(code || "").trim())
    .digest("hex");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").trim().replace(/[\s().-]/g, "");
}

function normalizeAuthIdentity(value, method) {
  return method === "phone" || !String(value || "").includes("@")
    ? normalizePhone(value)
    : normalizeEmail(value);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(value));
}

function phoneError(value) {
  const phone = normalizePhone(value);
  if (!phone) return "Enter your phone number.";
  if (!phone.startsWith("+")) return "Phone number must include country code, for example +33782504514.";
  if (!/^\+\d{8,15}$/.test(phone)) return "Phone number must contain only + and 8 to 15 digits.";
  if (phone.startsWith("+330")) return "For France, remove the 0 after +33. Use +33782504514.";
  return "";
}

function adminToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function requireAdmin(req, res) {
  if (adminSessions.has(bearerToken(req))) return true;
  sendJson(res, 401, { error: "Admin login required" });
  return false;
}

function signCustomerToken(email) {
  const payload = Buffer.from(JSON.stringify({
    email: normalizeEmail(email),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function customerEmailFromToken(req) {
  const token = bearerToken(req);
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.email || data.exp < Date.now()) return null;
    return normalizeEmail(data.email);
  } catch {
    return null;
  }
}

async function postForm(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
    body: new URLSearchParams(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || `Request failed: ${response.status}`);
  }
  return data;
}

async function sendEmail(to, subject, body, attachments = []) {
  if (!process.env.SENDGRID_API_KEY) {
    return { sent: false, setupRequired: "SENDGRID_API_KEY" };
  }
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: parseEmailAddress(process.env.EMAIL_FROM || "Idukki Spices <orders@idukkispices.com>"),
    subject,
    content: [{ type: "text/plain", value: body }]
  };
  if (attachments.length) {
    payload.attachments = attachments.map((attachment) => ({
      filename: attachment.filename,
      content: Buffer.isBuffer(attachment.content)
        ? attachment.content.toString("base64")
        : Buffer.from(String(attachment.content || "")).toString("base64"),
      type: "application/pdf",
      disposition: "attachment"
    }));
  }
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.errors?.[0]?.message || "Email send failed");
  return { sent: true, provider: "sendgrid" };
}

function parseEmailAddress(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(.*?)\s*<([^>]+)>$/);
  if (!match) return { email: text };
  return { name: match[1].trim(), email: match[2].trim() };
}

async function sendSms(to, body) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { sent: false, setupRequired: "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER" };
  }
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: to, Body: body })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "SMS send failed");
  return { sent: true, provider: "twilio", id: data.sid };
}

async function createStripeCheckout(order) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { setupRequired: "STRIPE_SECRET_KEY" };
  }
  const params = {
    mode: "payment",
    success_url: `${publicBaseUrl}/payment-success.html?order=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicBaseUrl}/checkout.html?payment=cancelled&order=${encodeURIComponent(order.id)}`,
    "metadata[order_id]": order.id
  };
  order.items.forEach((item, index) => {
    params[`line_items[${index}][quantity]`] = String(item.qty);
    params[`line_items[${index}][price_data][currency]`] = "eur";
    params[`line_items[${index}][price_data][unit_amount]`] = String(Math.round(Number(item.price) * 100));
    params[`line_items[${index}][price_data][product_data][name]`] = item.name;
  });
  if (Number(order.shippingFee || 0) > 0) {
    const index = order.items.length;
    params[`line_items[${index}][quantity]`] = "1";
    params[`line_items[${index}][price_data][currency]`] = "eur";
    params[`line_items[${index}][price_data][unit_amount]`] = String(Math.round(Number(order.shippingFee) * 100));
    params[`line_items[${index}][price_data][product_data][name]`] = "Shipping";
  }
  return postForm("https://api.stripe.com/v1/checkout/sessions", params, {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
  });
}

async function verifyStripeCheckoutSession(sessionId, orderId) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!sessionId) throw new Error("Payment session is missing");
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Payment verification failed");
  if (data.metadata?.order_id !== orderId) throw new Error("Payment session does not match this order");
  if (data.payment_status !== "paid") throw new Error("Payment has not been confirmed");
  return data;
}

async function createStripeRefund(order) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!order.stripePaymentIntentId) throw new Error("Stripe payment reference is missing for this order.");
  const data = await postForm("https://api.stripe.com/v1/refunds", {
    payment_intent: order.stripePaymentIntentId,
    reason: "requested_by_customer",
    "metadata[order_id]": order.id
  }, {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
  });
  return data;
}

function verifyStripeWebhook(rawBody, signatureHeader) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  const parts = Object.fromEntries(String(signatureHeader || "").split(",").map((part) => part.split("=")));
  if (!parts.t || !parts.v1) throw new Error("Stripe signature is missing");
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  if (!safeEqual(parts.v1, expected, "hex")) throw new Error("Stripe signature is invalid");
  const ageSeconds = Math.abs((Date.now() / 1000) - Number(parts.t));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) throw new Error("Stripe signature is too old");
}

async function confirmPaidOrder(orderId, paymentDetails = {}) {
  const updated = database.updateOrderPaymentStatus(orderId, "Paid", paymentDetails);
  if (!updated) return null;
  if (updated.confirmationEmailSent) {
    return { order: updated, emailResult: { skipped: true, reason: "already-sent" } };
  }
  const invoicePdf = createFrenchInvoicePdf(updated);
  const emailResult = await sendEmail(
    updated.customer.email,
    `Facture Idukki Spices ${updated.id}`,
    frenchInvoiceEmail(updated),
    [{ filename: `facture-${updated.id}.pdf`, content: invoicePdf }]
  );
  await customerActionNotification({
    type: "new-order",
    title: "New paid order received",
    body: `${updated.customer?.name || "Customer"} paid for order ${updated.id} (€${Number(updated.total || 0).toFixed(2)}).`,
    order: updated
  });
  const confirmed = database.updateOrderPaymentStatus(updated.id, "Paid", {
    ...paymentDetails,
    confirmationEmailSent: true,
    confirmationEmailSentAt: new Date().toISOString(),
    confirmationEmailResult: emailResult
  });
  return { order: confirmed, emailResult };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/admin/login" && req.method === "POST") {
    const body = await readBody(req);
    if (body?.email === adminEmail && verifyPassword(body?.password, adminPasswordHash)) {
      const token = crypto.randomBytes(32).toString("hex");
      adminSessions.add(token);
      return sendJson(res, 200, {
        ok: true,
        token,
        email: adminEmail
      });
    }
    return sendJson(res, 401, { ok: false, error: "Invalid admin credentials" });
  }

  if (url.pathname === "/api/admin/notifications") {
    if (!requireAdmin(req, res)) return;
    if (req.method === "GET") {
      return sendJson(res, 200, database.getAdminNotifications(30));
    }
    if (req.method === "PUT") {
      return sendJson(res, 200, database.markAdminNotificationsRead());
    }
    if (req.method === "DELETE") {
      return sendJson(res, 200, database.clearAdminNotifications());
    }
  }

  if (url.pathname === "/api/contact-messages") {
    if (req.method === "POST") {
      const body = await readBody(req);
      const name = String(body?.name || "").trim();
      const email = normalizeEmail(body?.email);
      const phone = String(body?.phone || "").trim();
      const messageText = String(body?.message || "").trim();
      if (!name) return sendJson(res, 400, { error: "Name is required." });
      if (!validEmail(email)) return sendJson(res, 400, { error: "Enter a valid email address." });
      if (messageText.length < 5) return sendJson(res, 400, { error: "Message is too short." });
      const message = database.createContactMessage({ name, email, phone, message: messageText });
      database.createAdminNotification({
        type: "contact-message",
        title: "New contact message",
        body: `${name} sent a message: ${messageText.slice(0, 160)}${messageText.length > 160 ? "..." : ""}`,
        customerEmail: email
      });
      await sendEmail(companyEmail(), `Idukki Spices contact: ${name}`, [
        "New contact message from the website",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : "",
        "",
        messageText,
        "",
        "Reply directly to the customer email above, or mark the message in the admin dashboard."
      ].filter(Boolean).join("\n")).catch((error) => ({ sent: false, error: error.message }));
      return sendJson(res, 201, message);
    }
    if (!requireAdmin(req, res)) return;
    if (req.method === "GET") return sendJson(res, 200, database.getContactMessages());
    if (req.method === "PUT") {
      const body = await readBody(req);
      const id = String(body?.id || "");
      const status = String(body?.status || "");
      if (!id) return sendJson(res, 400, { error: "Message id is required." });
      if (!["New", "Read", "Replied"].includes(status)) return sendJson(res, 400, { error: "Invalid message status." });
      const updated = database.updateContactMessage(id, { status });
      if (!updated) return sendJson(res, 404, { error: "Message not found." });
      return sendJson(res, 200, updated);
    }
  }

  if (url.pathname === "/api/accounts/register" && req.method === "POST") {
    const body = await readBody(req);
    if (!validEmail(body?.email)) return sendJson(res, 400, { error: "Enter a valid email address, for example you@example.com." });
    const invalidPhone = phoneError(body?.phone);
    if (invalidPhone) return sendJson(res, 400, { error: invalidPhone });
    body.email = normalizeEmail(body.email);
    body.phone = normalizePhone(body.phone);
    const account = database.registerCustomer(body);
    await customerActionNotification({
      type: "account-created",
      title: "New customer account",
      body: `${account.name || "Customer"} created an account.`,
      customer: account
    });
    return sendJson(res, 201, account);
  }

  if (url.pathname === "/api/auth/request-otp" && req.method === "POST") {
    const body = await readBody(req);
    const identity = body?.method === "phone" ? normalizePhone(body?.identity) : normalizeEmail(body?.identity);
    if (body?.method === "email" && !validEmail(identity)) {
      return sendJson(res, 400, { error: "Enter a valid email address, for example you@example.com." });
    }
    if (body?.method === "phone") {
      const invalidPhone = phoneError(identity);
      if (invalidPhone) return sendJson(res, 400, { error: invalidPhone });
    }
    const account = database.getCustomerByIdentity(identity);
    if (!account) return sendJson(res, 404, { error: "No account found" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    database.saveOtpChallenge({ purpose: "login", identity, email: account.email, codeHash: otpHash(code), expiresAt });
    const message = `Your Idukki Spices OTP is ${code}. It expires in 5 minutes.`;
    try {
      const result = body.method === "phone"
        ? await sendSms(normalizePhone(account.phone || identity), message)
        : await sendEmail(account.email, "Your Idukki Spices OTP", message);
      if (!result.sent) {
        database.deleteOtpChallenge("login", identity);
        return sendJson(res, 503, { error: "OTP provider is not configured", setupRequired: result.setupRequired });
      }
      return sendJson(res, 200, { ok: true, sent: true, channel: body.method });
    } catch (error) {
      database.deleteOtpChallenge("login", identity);
      return sendJson(res, 502, { error: error.message });
    }
  }

  if (url.pathname === "/api/auth/verify-otp" && req.method === "POST") {
    const body = await readBody(req);
    const identity = normalizeAuthIdentity(body.identity, body.method);
    const challenge = database.getOtpChallenge("login", identity);
    if (!challenge || Number(challenge.expiresAt || 0) < Date.now()) {
      if (challenge) database.deleteOtpChallenge("login", identity);
      return sendJson(res, 400, { error: "OTP expired or missing. Please send a new OTP and try again." });
    }
    if (!safeEqual(otpHash(body.otp), challenge.codeHash, "hex")) return sendJson(res, 401, { error: "OTP is incorrect" });
    database.deleteOtpChallenge("login", identity);
    const token = signCustomerToken(challenge.email);
    return sendJson(res, 200, { ok: true, email: challenge.email, token, account: database.getCustomerByIdentity(challenge.email) });
  }

  if (url.pathname === "/api/account/orders" && req.method === "GET") {
    const email = customerEmailFromToken(req);
    if (!email) return sendJson(res, 401, { error: "Account login required" });
    const account = database.getCustomerByIdentity(email);
    if (!account) return sendJson(res, 404, { error: "Account not found" });
    const accountCreatedAt = Date.parse(account.createdAt || "");
    return sendJson(res, 200, database.getOrders().filter((order) => {
      if (!isConfirmedOrder(order)) return false;
      if (order.customerId) return order.customerId === account.id;
      const orderCreatedAt = Date.parse(order.createdAt || "");
      return order.customerEmail === account.email
        && Number.isFinite(accountCreatedAt)
        && Number.isFinite(orderCreatedAt)
        && orderCreatedAt >= accountCreatedAt;
    }));
  }

  if (url.pathname === "/api/account/orders/action" && req.method === "POST") {
    const email = customerEmailFromToken(req);
    if (!email) return sendJson(res, 401, { error: "Account login required" });
    const account = database.getCustomerByIdentity(email);
    if (!account) return sendJson(res, 404, { error: "Account not found" });
    const body = await readBody(req);
    const order = database.getOrderById(body?.orderId);
    if (!order) return sendJson(res, 404, { error: "Order not found" });
    const accountCreatedAt = Date.parse(account.createdAt || "");
    const orderCreatedAt = Date.parse(order.createdAt || "");
    const ownsOrder = order.customerId
      ? order.customerId === account.id
      : order.customerEmail === account.email
        && Number.isFinite(accountCreatedAt)
        && Number.isFinite(orderCreatedAt)
        && orderCreatedAt >= accountCreatedAt;
    if (!ownsOrder) return sendJson(res, 403, { error: "You cannot change this order" });

    const status = order.deliveryStatus || "New order";
    if (body?.action === "cancel") {
      if (["Packed", "Shipped", "Delivered"].includes(status)) {
        return sendJson(res, 409, { error: "This order is already packed and cannot be cancelled." });
      }
      if (status === "Cancelled") return sendJson(res, 200, order);
      const updated = database.updateOrder(order.id, { deliveryStatus: "Cancelled", cancelledAt: new Date().toISOString() });
      const emailResult = await sendOrderNotification(updated, "cancelled");
      await customerActionNotification({
        type: "order-cancelled",
        title: "Customer cancelled order",
        body: `${updated.customer?.name || "Customer"} cancelled order ${updated.id}.`,
        order: updated
      });
      const notified = database.updateOrder(updated.id, {
        cancellationEmailSentAt: new Date().toISOString(),
        cancellationEmailResult: emailResult
      });
      return sendJson(res, 200, notified);
    }

    if (body?.action === "refund") {
      if (status !== "Cancelled") {
        return sendJson(res, 409, { error: "Refund can be requested only after the order is cancelled." });
      }
      if (order.paymentStatus !== "Paid") {
        return sendJson(res, 409, { error: "Refund is available only for paid orders." });
      }
      const updated = database.updateOrder(order.id, { paymentStatus: "Refund requested", refundRequestedAt: new Date().toISOString() });
      const emailResult = await sendOrderNotification(updated, "refundRequested");
      await customerActionNotification({
        type: "refund-requested",
        title: "Customer requested refund",
        body: `${updated.customer?.name || "Customer"} requested a refund for order ${updated.id}.`,
        order: updated
      });
      const notified = database.updateOrder(updated.id, {
        refundRequestEmailSentAt: new Date().toISOString(),
        refundRequestEmailResult: emailResult
      });
      return sendJson(res, 200, notified);
    }

    return sendJson(res, 400, { error: "Unknown order action" });
  }

  if (url.pathname === "/api/account/profile" && req.method === "GET") {
    const email = customerEmailFromToken(req);
    if (!email) return sendJson(res, 401, { error: "Account login required" });
    const account = database.getCustomerByIdentity(email);
    if (!account) return sendJson(res, 404, { error: "Account not found" });
    return sendJson(res, 200, account);
  }

  if (url.pathname === "/api/account/profile" && req.method === "PUT") {
    const email = customerEmailFromToken(req);
    if (!email) return sendJson(res, 401, { error: "Account login required" });
    const body = await readBody(req);
    const invalidPhone = body?.phone ? phoneError(body.phone) : "";
    if (invalidPhone) return sendJson(res, 400, { error: invalidPhone });
    const updated = database.updateCustomerByEmail(email, {
      name: String(body?.name || "").trim(),
      phone: body?.phone ? normalizePhone(body.phone) : "",
      address: String(body?.address || "").trim()
    });
    if (!updated) return sendJson(res, 404, { error: "Account not found" });
    await customerActionNotification({
      type: "profile-updated",
      title: "Customer profile updated",
      body: `${updated.name || "Customer"} updated saved account details.`,
      customer: updated
    });
    return sendJson(res, 200, updated);
  }

  if (url.pathname === "/api/account/deactivation-otp" && req.method === "POST") {
    const email = customerEmailFromToken(req);
    if (!email) return sendJson(res, 401, { error: "Account login required" });
    const account = database.getCustomerByIdentity(email);
    if (!account) return sendJson(res, 404, { error: "Account not found" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const identity = normalizeEmail(email);
    const expiresAt = Date.now() + 5 * 60 * 1000;
    database.saveOtpChallenge({ purpose: "deactivate", identity, email: identity, codeHash: otpHash(code), expiresAt });
    const message = `Votre code OTP Idukki Spices pour désactiver le compte est ${code}. Il expire dans 5 minutes.`;
    try {
      const result = await sendEmail(account.email, "Code OTP de désactivation Idukki Spices", message);
      if (!result.sent) {
        database.deleteOtpChallenge("deactivate", identity);
        return sendJson(res, 503, { error: "OTP provider is not configured", setupRequired: result.setupRequired });
      }
      return sendJson(res, 200, { ok: true, sent: true });
    } catch (error) {
      database.deleteOtpChallenge("deactivate", identity);
      return sendJson(res, 502, { error: error.message });
    }
  }

  if (url.pathname === "/api/account/profile" && req.method === "DELETE") {
    const email = customerEmailFromToken(req);
    if (!email) return sendJson(res, 401, { error: "Account login required" });
    const body = await readBody(req);
    const identity = normalizeEmail(email);
    const challenge = database.getOtpChallenge("deactivate", identity);
    if (!challenge || Number(challenge.expiresAt || 0) < Date.now()) {
      if (challenge) database.deleteOtpChallenge("deactivate", identity);
      return sendJson(res, 400, { error: "OTP expired or missing. Please send a new OTP and try again." });
    }
    if (!safeEqual(otpHash(body?.otp), challenge.codeHash, "hex")) return sendJson(res, 401, { error: "OTP is incorrect" });
    const deleted = database.deleteCustomerByEmail(email);
    if (!deleted) return sendJson(res, 404, { error: "Account not found" });
    database.deleteOtpChallenge("deactivate", identity);
    await customerActionNotification({
      type: "account-deactivated",
      title: "Customer account deactivated",
      body: `${email} deactivated their customer account.`,
      customer: { email }
    });
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname === "/api/order-status" && req.method === "GET") {
    const order = database.getOrderById(url.searchParams.get("id"));
    if (!order) return sendJson(res, 404, { error: "Order not found" });
    return sendJson(res, 200, {
      id: order.id,
      createdAt: order.createdAt,
      customer: { name: order.customer.name, email: order.customer.email },
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      items: order.items,
      total: order.total
    });
  }

  if (url.pathname === "/api/invoice" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const order = database.getOrderById(url.searchParams.get("id"));
    if (!order) return sendJson(res, 404, { error: "Order not found" });
    return sendJson(res, 200, order);
  }

  if (url.pathname === "/api/payments/confirm" && req.method === "POST") {
    const body = await readBody(req);
    const orderId = String(body?.orderId || "");
    const session = await verifyStripeCheckoutSession(body?.sessionId, orderId);
    try {
      const confirmed = await confirmPaidOrder(orderId, {
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent || ""
      });
      if (!confirmed) return sendJson(res, 404, { error: "Order not found" });
      return sendJson(res, 200, { ok: true, order: confirmed.order, emailResult: confirmed.emailResult });
    } catch (error) {
      const updated = database.updateOrderPaymentStatus(orderId, "Paid");
      return sendJson(res, 200, { ok: true, order: updated, warning: error.message });
    }
  }

  if (url.pathname === "/api/stripe/webhook" && req.method === "POST") {
    const rawBody = await readRawBody(req);
    try {
      verifyStripeWebhook(rawBody, req.headers["stripe-signature"]);
      const event = JSON.parse(rawBody);
      if (event.type === "checkout.session.completed") {
        const session = event.data?.object || {};
        if (session.payment_status === "paid" && session.metadata?.order_id) {
          await confirmPaidOrder(session.metadata.order_id, {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent || ""
          });
        }
      }
      return sendJson(res, 200, { received: true });
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  if (url.pathname === "/api/products") {
    if (req.method === "GET") return sendJson(res, 200, database.getProducts());
    if (req.method === "PUT") {
      if (!requireAdmin(req, res)) return;
      const body = await readBody(req);
      return sendJson(res, 200, database.saveProducts(Array.isArray(body) ? body : []));
    }
  }

  if (url.pathname === "/api/orders") {
    if (req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return sendJson(res, 200, database.getOrders().filter(isConfirmedOrder));
    }
    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const id = String(url.searchParams.get("id") || "");
      if (!id) return sendJson(res, 400, { error: "Order id is required" });
      const deleted = database.deleteOrderById(id);
      if (!deleted) return sendJson(res, 404, { error: "Order not found" });
      return sendJson(res, 200, { ok: true, id });
    }
    if (req.method === "PUT") {
      if (!requireAdmin(req, res)) return;
      const body = await readBody(req);
      const incomingOrders = Array.isArray(body) ? body : [];
      const previousOrders = new Map(database.getOrders().map((order) => [order.id, order]));
      database.saveOrders(incomingOrders);
      for (const order of incomingOrders) {
        const previous = previousOrders.get(order.id);
        const previousStatus = previous?.deliveryStatus || "New order";
        const nextStatus = order.deliveryStatus || "New order";
        const notificationType = previousStatus !== nextStatus ? deliveryNotificationType(nextStatus) : "";
        if (!notificationType) continue;
        const savedOrder = database.getOrderById(order.id);
        const emailResult = await sendOrderNotification(savedOrder, notificationType);
        database.updateOrder(order.id, {
          [`${notificationType}EmailSentAt`]: new Date().toISOString(),
          [`${notificationType}EmailResult`]: emailResult
        });
      }
      return sendJson(res, 200, database.getOrders());
    }
    if (req.method === "POST") {
      const incomingOrder = await readBody(req);
      const charges = calculateOrderCharges(incomingOrder?.items || []);
      if (charges.subtotal < MIN_ORDER_VALUE) {
        return sendJson(res, 400, { error: "Minimum order value is €20." });
      }
      const savedOrder = database.saveOrder({ ...incomingOrder, ...charges });
      try {
        const stripeSession = await createStripeCheckout(savedOrder);
        database.updateOrder(savedOrder.id, { stripeSessionId: stripeSession.id || "" });
        return sendJson(res, 201, { ...savedOrder, stripeSession });
      } catch (error) {
        return sendJson(res, 201, { ...savedOrder, warning: error.message });
      }
    }
  }

  if (url.pathname === "/api/orders/refund" && req.method === "POST") {
    if (!requireAdmin(req, res)) return;
    const body = await readBody(req);
    const order = database.getOrderById(body?.orderId);
    if (!order) return sendJson(res, 404, { error: "Order not found" });
    if (order.deliveryStatus !== "Cancelled") {
      return sendJson(res, 409, { error: "Refund can be approved only after the order is cancelled." });
    }
    if (order.paymentStatus !== "Refund requested") {
      return sendJson(res, 409, { error: "Customer has not requested a refund for this order." });
    }
    try {
      const refund = await createStripeRefund(order);
      const updated = database.updateOrder(order.id, {
        paymentStatus: "Refunded",
        refundApprovedAt: new Date().toISOString(),
        stripeRefundId: refund.id,
        refundResult: refund
      });
      const emailResult = await sendOrderNotification(updated, "refundCredited");
      const notified = database.updateOrder(updated.id, {
        refundCreditedEmailSentAt: new Date().toISOString(),
        refundCreditedEmailResult: emailResult
      });
      return sendJson(res, 200, notified);
    } catch (error) {
      return sendJson(res, 502, { error: error.message });
    }
  }

  if (url.pathname === "/api/customers") {
    if (!requireAdmin(req, res)) return;
    if (req.method === "GET") return sendJson(res, 200, database.getCustomers());
    if (req.method === "DELETE") {
      const id = String(url.searchParams.get("id") || "");
      if (!id) return sendJson(res, 400, { error: "Customer id is required" });
      const deleted = database.deleteCustomerById(id);
      if (!deleted) return sendJson(res, 404, { error: "Customer account not found" });
      return sendJson(res, 200, { ok: true, id });
    }
    if (req.method === "PUT") {
      const body = await readBody(req);
      return sendJson(res, 200, database.saveCustomers(Array.isArray(body) ? body : []));
    }
  }

  if (url.pathname === "/api/email-outbox" && req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    return sendJson(res, 200, database.getOutbox());
  }

  return sendJson(res, 404, { error: "Not found" });
}

function serveStatic(req, res, url) {
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const serveRoot = fs.existsSync(distRoot) ? distRoot : root;
  let filePath = path.normalize(path.join(serveRoot, requested));
  if (!filePath.startsWith(serveRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (fs.existsSync(distRoot)) {
    const rootAssetPath = path.normalize(path.join(root, requested));
    const rootAssetExt = path.extname(rootAssetPath);
    if (!fs.existsSync(filePath) && rootAssetPath.startsWith(root) && fs.existsSync(rootAssetPath) && rootAssetExt && rootAssetExt !== ".html") {
      filePath = rootAssetPath;
    } else if (!fs.existsSync(filePath) || path.extname(filePath) === ".html") {
      filePath = path.join(distRoot, "index.html");
    }
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  });
}

database.initDatabase();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: error.statusCode ? error.message : "Server error", detail: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Idukki Spices running at http://${host}:${port}`);
});
