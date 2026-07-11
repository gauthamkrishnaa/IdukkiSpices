const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const productNamesFr = {
  "green-cardamom-50": "Cardamome verte 7mm 50g",
  "green-cardamom-100": "Cardamome verte 7mm 100g",
  "mixed-spices-100": "Mélange d'épices 100g",
  "black-pepper": "Poivre noir",
  cloves: "Clous de girofle",
  cinnamon: "Cannelle",
  "star-anise": "Anis étoilé",
  "bay-leaves": "Feuilles de laurier"
};

const money = (value) => `EUR ${Number(value || 0).toFixed(2)}`;
const safeText = (value, fallback = "") => String(value || fallback).replace(/[\r\n]+/g, " ").trim();

function wrapText(text, font, size, maxWidth) {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

async function createBrandedInvoicePdf(order) {
  const document = await PDFDocument.create();
  document.setTitle(`Facture ${order.id || "Idukki Spices"}`);
  document.setAuthor("Idukki Spices");
  document.setSubject("Facture client");
  const page = document.addPage([595.28, 841.89]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.12, 0.31, 0.19);
  const paleGreen = rgb(0.91, 0.95, 0.9);
  const cream = rgb(0.98, 0.96, 0.92);
  const charcoal = rgb(0.14, 0.12, 0.1);
  const muted = rgb(0.38, 0.35, 0.31);
  const lineColor = rgb(0.8, 0.79, 0.75);
  const left = 46;
  const right = 549;
  const pageWidth = right - left;

  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: 784, width: 595.28, height: 58, color: cream });
  page.drawRectangle({ x: 0, y: 780, width: 595.28, height: 4, color: green });

  const logoPath = path.join(__dirname, "assets", "idukki-spices-logo.jpeg");
  if (fs.existsSync(logoPath)) {
    const logo = await document.embedJpg(fs.readFileSync(logoPath));
    const scaled = logo.scaleToFit(88, 62);
    page.drawImage(logo, { x: left, y: 704, width: scaled.width, height: scaled.height });
  }

  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR");
  page.drawText("FACTURE", { x: 430, y: 744, size: 22, font: bold, color: charcoal });
  page.drawText(`N° ${safeText(order.id, "-")}`, { x: 395, y: 721, size: 9, font: bold, color: green });
  page.drawText(`Date : ${invoiceDate}`, { x: 423, y: 705, size: 9, font: regular, color: muted });
  page.drawText("Échéance : immédiate", { x: 411, y: 689, size: 9, font: regular, color: muted });

  page.drawText("VENDEUR", { x: left, y: 654, size: 9, font: bold, color: green });
  page.drawText("FACTURÉ À", { x: 322, y: 654, size: 9, font: bold, color: green });
  page.drawText(process.env.INVOICE_SELLER_NAME || "Idukki Spices", { x: left, y: 633, size: 11, font: bold, color: charcoal });
  const sellerLines = [
    process.env.INVOICE_ADDRESS_LINE_1 || "56 rue Philippe de Girard",
    process.env.INVOICE_ADDRESS_LINE_2 || "75018 Paris, France",
    process.env.COMPANY_EMAIL || "idukkispicesfr@gmail.com",
    process.env.COMPANY_PHONE || "+33 7 82 50 45 14"
  ];
  sellerLines.forEach((line, index) => page.drawText(safeText(line), { x: left, y: 615 - index * 15, size: 9, font: regular, color: muted }));

  page.drawText(safeText(order.customer?.name, "Client"), { x: 322, y: 633, size: 11, font: bold, color: charcoal });
  const customerLines = [
    ...wrapText(order.customer?.address || "Adresse non renseignée", regular, 9, 225),
    safeText(order.customer?.phone, "Téléphone non renseigné"),
    safeText(order.customer?.email || order.customerEmail)
  ].slice(0, 5);
  customerLines.forEach((line, index) => page.drawText(line, { x: 322, y: 615 - index * 15, size: 9, font: regular, color: muted }));

  const tableTop = 520;
  page.drawRectangle({ x: left, y: tableTop, width: pageWidth, height: 30, color: green });
  const headers = [
    ["Description", left + 8], ["Qté", 294], ["Unité", 340], ["Prix unité", 398], ["Total", 505]
  ];
  headers.forEach(([label, x]) => page.drawText(label, { x, y: tableTop + 10, size: 8.5, font: bold, color: rgb(1, 1, 1) }));

  let rowY = tableTop - 28;
  const items = Array.isArray(order.items) ? order.items : [];
  items.slice(0, 12).forEach((item, index) => {
    if (index % 2 === 0) page.drawRectangle({ x: left, y: rowY - 8, width: pageWidth, height: 27, color: rgb(0.985, 0.98, 0.965) });
    const name = productNamesFr[item.id] || safeText(item.name, "Article");
    page.drawText(name.slice(0, 38), { x: left + 8, y: rowY, size: 8.5, font: regular, color: charcoal });
    page.drawText(String(Number(item.qty || 0)), { x: 300, y: rowY, size: 8.5, font: regular, color: charcoal });
    page.drawText("pack", { x: 340, y: rowY, size: 8.5, font: regular, color: charcoal });
    page.drawText(money(item.price), { x: 398, y: rowY, size: 8.5, font: regular, color: charcoal });
    const total = money(Number(item.price || 0) * Number(item.qty || 0));
    page.drawText(total, { x: right - bold.widthOfTextAtSize(total, 8.5), y: rowY, size: 8.5, font: bold, color: charcoal });
    rowY -= 27;
  });

  const shippingFee = Number(order.shippingFee || 0);
  if (shippingFee > 0) {
    page.drawText("Livraison", { x: left + 8, y: rowY, size: 8.5, font: regular, color: charcoal });
    page.drawText("1", { x: 300, y: rowY, size: 8.5, font: regular, color: charcoal });
    page.drawText("service", { x: 340, y: rowY, size: 8.5, font: regular, color: charcoal });
    const shipping = money(shippingFee);
    page.drawText(shipping, { x: right - bold.widthOfTextAtSize(shipping, 8.5), y: rowY, size: 8.5, font: bold, color: charcoal });
    rowY -= 27;
  }
  page.drawLine({ start: { x: left, y: rowY + 13 }, end: { x: right, y: rowY + 13 }, thickness: 0.7, color: lineColor });

  const subtotal = Number(order.subtotal ?? items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0));
  const totalsY = Math.min(rowY - 20, 430);
  const totalRows = [
    ["Sous-total", money(subtotal)],
    ["Livraison", shippingFee ? money(shippingFee) : "Gratuite"],
    ["TVA 0,00%", money(0)]
  ];
  totalRows.forEach(([label, value], index) => {
    const y = totalsY - index * 18;
    page.drawText(label, { x: 385, y, size: 9, font: regular, color: muted });
    page.drawText(value, { x: right - bold.widthOfTextAtSize(value, 9), y, size: 9, font: bold, color: charcoal });
  });
  const grandY = totalsY - 70;
  page.drawRectangle({ x: 374, y: grandY - 10, width: 175, height: 34, color: paleGreen });
  page.drawText("TOTAL À PAYER", { x: 385, y: grandY + 2, size: 10, font: bold, color: green });
  const grandTotal = money(order.total ?? subtotal + shippingFee);
  page.drawText(grandTotal, { x: right - bold.widthOfTextAtSize(grandTotal, 10), y: grandY + 2, size: 10, font: bold, color: green });

  page.drawLine({ start: { x: left, y: 95 }, end: { x: right, y: 95 }, thickness: 0.7, color: lineColor });
  page.drawText("Merci pour votre commande chez Idukki Spices.", { x: left, y: 72, size: 9, font: bold, color: green });
  page.drawText("idukkispicesfr@gmail.com  |  +33 7 82 50 45 14  |  Paris, France", { x: left, y: 55, size: 8, font: regular, color: muted });

  return Buffer.from(await document.save());
}

module.exports = { createBrandedInvoicePdf };
