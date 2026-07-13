const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "idukki-checkout-test-"));
process.env.DATA_DIR = testDataDir;
const database = require("../database");

database.initDatabase();

function orderFor(product, quantity, suffix) {
  return {
    id: `TEST-${suffix}`,
    customer: { name: "Test Customer", email: "customer@example.com", address: "20 Avenue de Ségur, 75007 Paris" },
    customerEmail: "customer@example.com",
    items: [{ id: product.id, name: product.name, price: product.price, qty: quantity }],
    paymentStatus: "Pending",
    deliveryStatus: "New order",
    total: Number(product.price) * quantity
  };
}

test("inventory reservation decrements stock and release restores it exactly once", () => {
  const product = database.getProducts()[0];
  const initialStock = Number(product.stock);
  const order = database.saveOrder(orderFor(product, 2, "RELEASE"));

  assert.equal(Number(database.getProducts().find((item) => item.id === product.id).stock), initialStock - 2);
  database.releaseOrderReservation(order.id, "test");
  database.releaseOrderReservation(order.id, "test-again");
  assert.equal(Number(database.getProducts().find((item) => item.id === product.id).stock), initialStock);
});

test("inventory reservation rejects overselling without changing stock", () => {
  const product = database.getProducts()[0];
  const initialStock = Number(product.stock);

  assert.throws(
    () => database.saveOrder(orderFor(product, initialStock + 1, "OVERSELL")),
    /enough stock/
  );
  assert.equal(Number(database.getProducts().find((item) => item.id === product.id).stock), initialStock);
});

test("paid orders consume their reservation and are not expired", () => {
  const product = database.getProducts()[0];
  const order = database.saveOrder({
    ...orderFor(product, 1, "PAID"),
    reservationExpiresAt: new Date(Date.now() - 60_000).toISOString()
  });
  const paid = database.updateOrderPaymentStatus(order.id, "Paid");

  assert.equal(paid.reservationStatus, "consumed");
  assert.equal(database.releaseExpiredReservations(), 0);
  assert.equal(database.getOrderById(order.id).paymentStatus, "Paid");
});

test("email jobs persist retry state and are not immediately retried", () => {
  const job = database.queueEmailJob({ id: "order-confirmation-TEST", type: "order-confirmation", orderId: "TEST-PAID" });
  assert.equal(job.status, "pending");
  assert.equal(database.getDueEmailJobs().some((entry) => entry.id === job.id), true);

  database.updateEmailJob(job.id, {
    attempts: 1,
    lastError: "temporary provider failure",
    nextAttemptAt: new Date(Date.now() + 120_000).toISOString()
  });
  assert.equal(database.getDueEmailJobs().some((entry) => entry.id === job.id), false);
});

test.after(() => fs.rmSync(testDataDir, { recursive: true, force: true }));
