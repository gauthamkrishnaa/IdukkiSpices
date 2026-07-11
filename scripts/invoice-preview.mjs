import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createBrandedInvoicePdf } = require("../invoice-pdf");
const output = process.argv[2] || "/tmp/idukki-invoice-preview.pdf";
const sampleOrder = {
  id: "IDK-PREVIEW-2026",
  createdAt: new Date().toISOString(),
  customer: {
    name: "Claire Martin",
    address: "19 rue de la République, 69002 Lyon, France",
    phone: "+33 6 12 34 56 78",
    email: "claire@example.com"
  },
  items: [
    { id: "green-cardamom-50", name: "Green Cardamom 7mm 50g", qty: 2, price: 9 },
    { id: "black-pepper", name: "Black Pepper", qty: 1, price: 5 },
    { id: "cinnamon", name: "Cinnamon", qty: 2, price: 3 }
  ],
  subtotal: 29,
  shippingFee: 4.99,
  total: 33.99
};

fs.writeFileSync(output, await createBrandedInvoicePdf(sampleOrder));
console.log(output);
