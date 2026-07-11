const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const seedDataDir = path.join(root, "data");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : seedDataDir;
const dbPath = path.join(dataDir, "idukki-spices.sqlite");
const sqliteBin = process.env.SQLITE_BIN || "sqlite3";

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "0";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function run(sql) {
  ensureDataDir();
  execFileSync(sqliteBin, [dbPath], { input: sql });
}

function all(sql) {
  ensureDataDir();
  const output = execFileSync(sqliteBin, ["-json", dbPath, sql], { encoding: "utf8" });
  return output.trim() ? JSON.parse(output) : [];
}

function one(sql) {
  return all(sql)[0] || null;
}

function loadSeedProducts() {
  const seedFile = path.join(seedDataDir, "products.json");
  if (!fs.existsSync(seedFile)) return [];
  return JSON.parse(fs.readFileSync(seedFile, "utf8"));
}

function productInsertSql(product) {
  return `
    INSERT OR REPLACE INTO products
      (id, name, price, icon, art, category, stock, image, uses, description)
    VALUES
      (${sqlValue(product.id)}, ${sqlValue(product.name)}, ${sqlValue(Number(product.price || 0))},
       ${sqlValue(product.icon)}, ${sqlValue(product.art)}, ${sqlValue(product.category)},
       ${sqlValue(Number(product.stock || 0))}, ${sqlValue(product.image)}, ${sqlValue(product.uses)},
       ${sqlValue(product.description)});
  `;
}

function orderInsertSql(order) {
  const normalized = normalizeOrder(order);
  return `
    INSERT OR REPLACE INTO orders
      (id, created_at, customer_name, customer_email, customer_address, payment_method,
       payment_status, delivery_status, total, items_json, order_json)
    VALUES
      (${sqlValue(normalized.id)}, ${sqlValue(normalized.createdAt)},
       ${sqlValue(normalized.customer.name)}, ${sqlValue(normalized.customer.email)},
       ${sqlValue(normalized.customer.address)}, ${sqlValue(normalized.paymentMethod)},
       ${sqlValue(normalized.paymentStatus)}, ${sqlValue(normalized.deliveryStatus)},
       ${sqlValue(Number(normalized.total || 0))}, ${sqlValue(JSON.stringify(normalized.items || []))},
       ${sqlValue(JSON.stringify(normalized))});
  `;
}

function customerInsertSql(customer) {
  return `
    INSERT OR REPLACE INTO customers
      (id, name, email, phone, address, created_at)
    VALUES
      (${sqlValue(customer.id || `CUS-${Date.now().toString().slice(-6)}`)},
       ${sqlValue(customer.name)}, ${sqlValue(customer.email)}, ${sqlValue(customer.phone)},
       ${sqlValue(customer.address)}, ${sqlValue(customer.createdAt || new Date().toISOString())});
  `;
}

function contactMessageInsertSql(message) {
  return `
    INSERT OR REPLACE INTO contact_messages
      (id, created_at, name, email, phone, message, status, replied_at)
    VALUES
      (${sqlValue(message.id)}, ${sqlValue(message.createdAt)}, ${sqlValue(message.name)},
       ${sqlValue(message.email)}, ${sqlValue(message.phone || "")}, ${sqlValue(message.message)},
       ${sqlValue(message.status || "New")}, ${sqlValue(message.repliedAt || "")});
  `;
}

function normalizeOrder(order) {
  const customerEmail = order.customerEmail || order.customer?.email || "";
  const linkedCustomer = order.customerId ? null : getCustomerByIdentity(customerEmail);
  return {
    ...order,
    id: order.id || `IDK-${Date.now().toString().slice(-6)}`,
    createdAt: order.createdAt || new Date().toISOString(),
    customer: order.customer || { name: "", email: "", address: "" },
    customerEmail,
    customerId: order.customerId || linkedCustomer?.id || "",
    paymentMethod: order.paymentMethod || "card",
    paymentStatus: order.paymentStatus || "Pending",
    deliveryStatus: order.deliveryStatus || "New order",
    items: order.items || [],
    total: Number(order.total || 0)
  };
}

function initDatabase() {
  ensureDataDir();
  run(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      icon TEXT,
      art TEXT,
      category TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      uses TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      customer_address TEXT,
      payment_method TEXT,
      payment_status TEXT,
      delivery_status TEXT,
      total REAL NOT NULL DEFAULT 0,
      items_json TEXT NOT NULL,
      order_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_outbox (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otp_challenges (
      purpose TEXT NOT NULL,
      identity TEXT NOT NULL,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (purpose, identity)
    );

    CREATE TABLE IF NOT EXISTS admin_notifications (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      order_id TEXT,
      customer_email TEXT,
      is_read INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      replied_at TEXT
    );
  `);

  const count = one("SELECT COUNT(*) AS count FROM products;")?.count || 0;
  if (Number(count) === 0) saveProducts(loadSeedProducts());
  else syncProductMarketingFromSeed();
}

function getProducts() {
  return all("SELECT id, name, price, icon, art, category, stock, image, uses, description FROM products ORDER BY rowid;");
}

function saveProducts(products) {
  run(`
    BEGIN;
    DELETE FROM products;
    ${products.map(productInsertSql).join("\n")}
    COMMIT;
  `);
  return getProducts();
}

function syncProductMarketingFromSeed() {
  const products = loadSeedProducts().filter((product) => product.id && product.image);
  if (!products.length) return;
  run(`
    BEGIN;
    ${products.map((product) => `
      UPDATE products
      SET category = ${sqlValue(product.category)},
          uses = ${sqlValue(product.uses)},
          description = ${sqlValue(product.description)}
      WHERE id = ${sqlValue(product.id)};
    `).join("\n")}
    COMMIT;
  `);
}

function getOrders() {
  return all("SELECT order_json FROM orders ORDER BY created_at DESC;")
    .map((row) => JSON.parse(row.order_json));
}

function getOrderById(id) {
  const row = one(`SELECT order_json FROM orders WHERE id = ${sqlValue(id)} LIMIT 1;`);
  return row ? JSON.parse(row.order_json) : null;
}

function deleteOrderById(id) {
  const existing = getOrderById(id);
  if (!existing) return false;
  run(`DELETE FROM orders WHERE id = ${sqlValue(id)};`);
  return true;
}

function updateOrderPaymentStatus(id, paymentStatus, changes = {}) {
  const order = getOrderById(id);
  if (!order) return null;
  const updated = { ...order, ...changes, paymentStatus };
  run(orderInsertSql(updated));
  return updated;
}

function updateOrder(id, changes = {}) {
  const order = getOrderById(id);
  if (!order) return null;
  const updated = { ...order, ...changes };
  run(orderInsertSql(updated));
  return updated;
}

function saveOrders(orders) {
  run(`
    BEGIN;
    DELETE FROM orders;
    ${(orders || []).map(orderInsertSql).join("\n")}
    COMMIT;
  `);
  return getOrders();
}

function getCustomers() {
  return all("SELECT id, name, email, phone, address, created_at AS createdAt FROM customers ORDER BY created_at DESC;");
}

function getCustomerByIdentity(identity) {
  const normalized = String(identity || "").trim().toLowerCase();
  const normalizedPhone = normalized.replace(/[\s().-]/g, "");
  if (!normalized) return null;
  return one(`
    SELECT id, name, email, phone, address, created_at AS createdAt
    FROM customers
    WHERE lower(email) = ${sqlValue(normalized)}
       OR replace(replace(replace(replace(lower(phone), ' ', ''), '-', ''), '(', ''), ')', '') = ${sqlValue(normalizedPhone)}
    LIMIT 1;
  `);
}

function registerCustomer(customer) {
  const existingEmail = getCustomerByIdentity(customer.email);
  const existingPhone = getCustomerByIdentity(customer.phone);
  if (existingEmail || existingPhone) {
    const error = new Error(existingEmail ? "An account already exists with this email address." : "An account already exists with this phone number.");
    error.statusCode = 409;
    throw error;
  }
  const saved = {
    ...customer,
    id: customer.id || `CUS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: customer.createdAt || new Date().toISOString()
  };
  run(customerInsertSql(saved));
  return getCustomerByIdentity(saved.email);
}

function updateCustomerByEmail(email, changes) {
  const existing = getCustomerByIdentity(email);
  if (!existing) return null;
  const updated = {
    ...existing,
    name: changes.name || existing.name,
    phone: changes.phone || existing.phone,
    address: changes.address ?? existing.address,
    createdAt: existing.createdAt
  };
  run(customerInsertSql(updated));
  return getCustomerByIdentity(existing.email);
}

function deleteCustomerByEmail(email) {
  const existing = getCustomerByIdentity(email);
  if (!existing) return false;
  run(`DELETE FROM customers WHERE lower(email) = ${sqlValue(String(existing.email || "").toLowerCase())};`);
  return true;
}

function deleteCustomerById(id) {
  const existing = one(`
    SELECT id, email
    FROM customers
    WHERE id = ${sqlValue(id)}
    LIMIT 1;
  `);
  if (!existing) return false;
  run(`DELETE FROM customers WHERE id = ${sqlValue(existing.id)};`);
  return true;
}

function saveCustomers(customers) {
  run(`
    BEGIN;
    DELETE FROM customers;
    ${(customers || []).map(customerInsertSql).join("\n")}
    COMMIT;
  `);
  return getCustomers();
}

function saveOtpChallenge({ purpose, identity, email, codeHash, expiresAt }) {
  run(`
    INSERT OR REPLACE INTO otp_challenges
      (purpose, identity, email, code_hash, expires_at, created_at)
    VALUES
      (${sqlValue(purpose)}, ${sqlValue(identity)}, ${sqlValue(email)},
       ${sqlValue(codeHash)}, ${sqlValue(Number(expiresAt || 0))},
       ${sqlValue(new Date().toISOString())});
  `);
}

function getOtpChallenge(purpose, identity) {
  return one(`
    SELECT purpose, identity, email, code_hash AS codeHash, expires_at AS expiresAt
    FROM otp_challenges
    WHERE purpose = ${sqlValue(purpose)}
      AND identity = ${sqlValue(identity)}
    LIMIT 1;
  `);
}

function deleteOtpChallenge(purpose, identity) {
  run(`
    DELETE FROM otp_challenges
    WHERE purpose = ${sqlValue(purpose)}
      AND identity = ${sqlValue(identity)};
  `);
}

function createAdminNotification({ type, title, body, orderId = "", customerEmail = "" }) {
  const id = `NOT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  run(`
    INSERT INTO admin_notifications
      (id, created_at, type, title, body, order_id, customer_email, is_read)
    VALUES
      (${sqlValue(id)}, ${sqlValue(new Date().toISOString())}, ${sqlValue(type)},
       ${sqlValue(title)}, ${sqlValue(body)}, ${sqlValue(orderId)}, ${sqlValue(customerEmail)}, 0);
  `);
  return id;
}

function getAdminNotifications(limit = 30) {
  return all(`
    SELECT id, created_at AS createdAt, type, title, body, order_id AS orderId,
           customer_email AS customerEmail, is_read AS isRead
    FROM admin_notifications
    ORDER BY created_at DESC
    LIMIT ${sqlValue(Number(limit || 30))};
  `);
}

function markAdminNotificationsRead() {
  run("UPDATE admin_notifications SET is_read = 1;");
  return getAdminNotifications();
}

function markContactNotificationRead(messageId, customerEmail = "") {
  run(`
    UPDATE admin_notifications
    SET is_read = 1
    WHERE type = 'contact-message'
      AND (
        order_id = ${sqlValue(messageId)}
        OR (order_id = '' AND customer_email = ${sqlValue(String(customerEmail).toLowerCase())})
      );
  `);
  return getAdminNotifications();
}

function clearAdminNotifications() {
  run("DELETE FROM admin_notifications;");
  return [];
}

function createContactMessage(input = {}) {
  const message = {
    id: input.id || `MSG-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: input.createdAt || new Date().toISOString(),
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim().toLowerCase(),
    phone: String(input.phone || "").trim(),
    message: String(input.message || "").trim(),
    status: "New",
    repliedAt: ""
  };
  run(contactMessageInsertSql(message));
  return message;
}

function getContactMessages() {
  return all(`
    SELECT id, created_at AS createdAt, name, email, phone, message, status, replied_at AS repliedAt
    FROM contact_messages
    ORDER BY created_at DESC;
  `);
}

function updateContactMessage(id, changes = {}) {
  const existing = getContactMessages().find((message) => message.id === id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...changes,
    status: changes.status || existing.status,
    repliedAt: changes.status === "Replied" && !existing.repliedAt ? new Date().toISOString() : (changes.repliedAt ?? existing.repliedAt)
  };
  run(contactMessageInsertSql(updated));
  return updated;
}

const frenchProductNames = {
  "green-cardamom-50": "Cardamome verte 7mm 50g",
  "green-cardamom-100": "Cardamome verte 7mm 100g",
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
    "Merci pour votre commande chez Idukki Spices.",
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

function createConfirmation(order) {
  const id = `MAIL-${Date.now().toString().slice(-6)}`;
  run(`
    INSERT INTO email_outbox (id, created_at, recipient, subject, body, status)
    VALUES (
      ${sqlValue(id)},
      ${sqlValue(new Date().toISOString())},
      ${sqlValue(order.customer.email)},
      ${sqlValue(`Facture Idukki Spices ${order.id}`)},
      ${sqlValue(frenchInvoiceEmail(order))},
      'ready-to-send'
    );
  `);
}

function getOutbox() {
  return all(`
    SELECT id, created_at AS createdAt, recipient AS "to", subject, body, status
    FROM email_outbox
    ORDER BY created_at DESC;
  `);
}

function saveOrder(order) {
  const normalized = normalizeOrder(order);
  const products = getProducts();

  run(`
    BEGIN;
    ${orderInsertSql(normalized)}
    ${products.map((product) => {
      const item = normalized.items.find((entry) => entry.id === product.id);
      if (!item) return "";
      return `
        UPDATE products
        SET stock = MAX(0, stock - ${sqlValue(Number(item.qty || 0))})
        WHERE id = ${sqlValue(product.id)};
      `;
    }).join("\n")}
    COMMIT;
  `);

  const customers = getCustomers();
  if (customers.some((customer) => customer.email === normalized.customerEmail)) {
    const updatedCustomers = customers.map((customer) => customer.email === normalized.customerEmail
      ? { ...customer, name: normalized.customer.name, address: normalized.customer.address }
      : customer);
    saveCustomers(updatedCustomers);
  }

  return normalized;
}

module.exports = {
  dbPath,
  initDatabase,
  getProducts,
  saveProducts,
  getOrders,
  getOrderById,
  deleteOrderById,
  updateOrderPaymentStatus,
  updateOrder,
  saveOrders,
  saveOrder,
  getCustomers,
  getCustomerByIdentity,
  registerCustomer,
  updateCustomerByEmail,
  deleteCustomerByEmail,
  deleteCustomerById,
  saveCustomers,
  saveOtpChallenge,
  getOtpChallenge,
  deleteOtpChallenge,
  createAdminNotification,
  getAdminNotifications,
  markAdminNotificationsRead,
  markContactNotificationRead,
  clearAdminNotifications,
  createContactMessage,
  getContactMessages,
  updateContactMessage,
  getOutbox
};
