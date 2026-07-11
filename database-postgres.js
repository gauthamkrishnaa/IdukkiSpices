const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false }
});

const seedFile = path.join(__dirname, "data", "products.json");
const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadSeedProducts() {
  return fs.existsSync(seedFile) ? JSON.parse(fs.readFileSync(seedFile, "utf8")) : [];
}

async function put(collection, key, data, client = pool) {
  await client.query(`
    INSERT INTO app_records (collection, record_key, data, created_at, updated_at)
    VALUES ($1, $2, $3::jsonb, NOW(), NOW())
    ON CONFLICT (collection, record_key)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `, [collection, String(key), JSON.stringify(data)]);
  return data;
}

async function get(collection, key, client = pool) {
  const result = await client.query(
    "SELECT data FROM app_records WHERE collection = $1 AND record_key = $2 LIMIT 1",
    [collection, String(key)]
  );
  return result.rows[0]?.data || null;
}

async function list(collection, client = pool) {
  const result = await client.query(
    "SELECT data FROM app_records WHERE collection = $1 ORDER BY created_at ASC",
    [collection]
  );
  return result.rows.map((row) => row.data);
}

async function remove(collection, key, client = pool) {
  const result = await client.query(
    "DELETE FROM app_records WHERE collection = $1 AND record_key = $2",
    [collection, String(key)]
  );
  return result.rowCount > 0;
}

async function replaceCollection(collection, records, keyOf) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM app_records WHERE collection = $1", [collection]);
    for (const record of records) await put(collection, keyOf(record), record, client);
    await client.query("COMMIT");
    return records;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_records (
      collection TEXT NOT NULL,
      record_key TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (collection, record_key)
    );
    CREATE INDEX IF NOT EXISTS app_records_collection_created_idx
      ON app_records (collection, created_at DESC);
  `);
  const seeds = loadSeedProducts();
  const existing = await list("products");
  if (!existing.length) await replaceCollection("products", seeds, (product) => product.id);
  else {
    const byId = new Map(existing.map((product) => [product.id, product]));
    for (const seed of seeds) {
      const current = byId.get(seed.id);
      if (current) await put("products", seed.id, { ...current, category: seed.category, uses: seed.uses, description: seed.description });
    }
  }
}

const getProducts = () => list("products");
const saveProducts = (products) => replaceCollection("products", products, (product) => product.id);
const getOrders = async () => (await list("orders")).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
const getOrderById = (id) => get("orders", id);
const deleteOrderById = (id) => remove("orders", id);

async function saveOrder(order) {
  const normalized = { ...order, id: order.id || makeId("IDK"), createdAt: order.createdAt || now() };
  return put("orders", normalized.id, normalized);
}

async function updateOrder(id, changes = {}) {
  const order = await getOrderById(id);
  if (!order) return null;
  return put("orders", id, { ...order, ...changes, updatedAt: now() });
}

const updateOrderPaymentStatus = (id, paymentStatus, changes = {}) => updateOrder(id, { ...changes, paymentStatus });
const saveOrders = (orders) => replaceCollection("orders", orders, (order) => order.id);

const getCustomers = () => list("customers");
const getCustomerByIdentity = async (identity) => {
  const needle = String(identity || "").trim().toLowerCase();
  return (await getCustomers()).find((customer) =>
    String(customer.email || "").toLowerCase() === needle || String(customer.phone || "").toLowerCase() === needle
  ) || null;
};

async function registerCustomer(customer) {
  if (await getCustomerByIdentity(customer.email) || await getCustomerByIdentity(customer.phone)) {
    const error = new Error("An account already exists with this email or phone number.");
    error.statusCode = 409;
    throw error;
  }
  const normalized = { ...customer, id: customer.id || makeId("CUS"), createdAt: customer.createdAt || now() };
  return put("customers", normalized.id, normalized);
}

async function updateCustomerByEmail(email, changes) {
  const customer = await getCustomerByIdentity(email);
  if (!customer) return null;
  return put("customers", customer.id, { ...customer, ...changes, email: changes.email || customer.email, updatedAt: now() });
}

async function deleteCustomerByEmail(email) {
  const customer = await getCustomerByIdentity(email);
  return customer ? remove("customers", customer.id) : false;
}

const deleteCustomerById = (id) => remove("customers", id);
const saveCustomers = (customers) => replaceCollection("customers", customers, (customer) => customer.id);

const otpKey = (purpose, identity) => `${purpose}:${String(identity).toLowerCase()}`;
const saveOtpChallenge = (challenge) => put("otp", otpKey(challenge.purpose, challenge.identity), { ...challenge, createdAt: now() });
const getOtpChallenge = (purpose, identity) => get("otp", otpKey(purpose, identity));
const deleteOtpChallenge = (purpose, identity) => remove("otp", otpKey(purpose, identity));

async function createAdminNotification(input) {
  const notification = { id: makeId("NTF"), createdAt: now(), read: false, ...input };
  return put("notifications", notification.id, notification);
}

async function getAdminNotifications(limit = 30) {
  return (await list("notifications")).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, limit);
}

async function markAdminNotificationsRead() {
  const notifications = await list("notifications");
  await Promise.all(notifications.map((item) => put("notifications", item.id, { ...item, read: true })));
  return getAdminNotifications();
}

async function markContactNotificationRead(messageId, customerEmail = "") {
  const notifications = await list("notifications");
  const normalizedEmail = String(customerEmail).toLowerCase();
  await Promise.all(notifications.map((item) => {
    const linked = item.type === "contact-message" && (
      item.orderId === messageId || (!item.orderId && String(item.customerEmail || "").toLowerCase() === normalizedEmail)
    );
    return linked ? put("notifications", item.id, { ...item, read: true, isRead: 1 }) : Promise.resolve(item);
  }));
  return getAdminNotifications();
}

async function clearAdminNotifications() {
  await pool.query("DELETE FROM app_records WHERE collection = 'notifications'");
  return [];
}

async function createContactMessage(input = {}) {
  const message = { id: makeId("MSG"), createdAt: now(), status: "New", ...input };
  return put("contact_messages", message.id, message);
}

async function getContactMessages() {
  return (await list("contact_messages")).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function updateContactMessage(id, changes) {
  const message = await get("contact_messages", id);
  return message ? put("contact_messages", id, { ...message, ...changes, updatedAt: now() }) : null;
}

async function createConfirmation(order) {
  const confirmation = { id: makeId("OUT"), createdAt: now(), orderId: order.id, to: order.customer?.email || order.customerEmail || "", status: "Queued" };
  await put("outbox", confirmation.id, confirmation);
  return confirmation;
}

async function getOutbox() {
  return (await list("outbox")).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

module.exports = {
  initDatabase, getProducts, saveProducts, getOrders, getOrderById, deleteOrderById,
  updateOrderPaymentStatus, updateOrder, saveOrders, getCustomers, getCustomerByIdentity,
  registerCustomer, updateCustomerByEmail, deleteCustomerByEmail, deleteCustomerById,
  saveCustomers, saveOtpChallenge, getOtpChallenge, deleteOtpChallenge,
  createAdminNotification, getAdminNotifications, markAdminNotificationsRead,
  markContactNotificationRead, clearAdminNotifications, createContactMessage, getContactMessages, updateContactMessage,
  createConfirmation, getOutbox, saveOrder
};
