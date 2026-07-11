import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { renderBrandedEmail } = require("../email-template");
const outputDir = process.argv[2] || "dist/email-samples";
fs.mkdirSync(outputDir, { recursive: true });

const samples = [
  {
    id: "confirmation",
    label: "Order confirmation",
    subject: "Facture Idukki Spices IDK-2026-1042",
    body: ["Bonjour Claire,", "", "Merci pour votre commande chez Idukki Spices.", "", "Facture: IDK-2026-1042", "Date: 11 juil. 2026, 10:30", "", "Sous-total: €29.00", "Livraison: €4.99", "Total: €33.99", "", "Votre facture PDF est jointe à cet e-mail."].join("\n")
  },
  {
    id: "shipped",
    label: "Order shipped",
    subject: "Commande expédiée IDK-2026-1042",
    body: ["Bonjour Claire,", "", "Votre commande IDK-2026-1042 a été expédiée.", "", "Vous recevrez votre colis selon les délais du transporteur.", "", "Merci,", "Idukki Spices"].join("\n")
  },
  {
    id: "refund",
    label: "Refund approved",
    subject: "Remboursement approuvé IDK-2026-1042",
    body: ["Bonjour Claire,", "", "Le remboursement de votre commande IDK-2026-1042 a été approuvé.", "", "Montant remboursé: €33.99", "", "Le montant sera crédité sur votre moyen de paiement d'origine selon les délais de votre banque.", "", "Merci,", "Idukki Spices"].join("\n")
  },
  {
    id: "otp",
    label: "Security code",
    subject: "Your Idukki Spices OTP",
    body: ["Hello Claire,", "", "Use this one-time code to sign in to your Idukki Spices account:", "", "482913", "", "This code expires shortly. If you did not request it, you can ignore this email."].join("\n")
  },
  {
    id: "admin",
    label: "Admin alert",
    subject: "Idukki Spices admin: New paid order received",
    body: ["New paid order received", "", "Claire Martin paid for order IDK-2026-1042 (€33.99).", "Order: IDK-2026-1042", "Customer: claire@example.com", "", "Open the admin dashboard to review this update."].join("\n")
  }
];

for (const sample of samples) {
  fs.writeFileSync(path.join(outputDir, `${sample.id}.html`), renderBrandedEmail({ ...sample, baseUrl: "http://localhost:3000" }));
}

const cards = samples.map((sample) => `<a href="/email-samples/${sample.id}.html"><strong>${sample.label}</strong><span>${sample.subject}</span></a>`).join("");
fs.writeFileSync(path.join(outputDir, "index.html"), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Idukki Spices email samples</title><style>body{margin:0;padding:40px 18px;background:#f3eee5;color:#241d17;font-family:Arial,sans-serif}main{max-width:820px;margin:auto}h1{font-size:42px;margin:0 0 10px}p{color:#75675b;margin:0 0 28px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}a{display:grid;gap:8px;padding:22px;border:1px solid #ded4c5;border-radius:18px;background:#fffdf8;color:#214e31;text-decoration:none;box-shadow:0 14px 36px rgba(36,29,23,.08)}a:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(36,29,23,.13)}span{color:#75675b;font-size:13px;line-height:1.45}</style></head><body><main><h1>Email samples</h1><p>Select an email to preview the exact branded HTML structure.</p><div class="grid">${cards}</div></main></body></html>`);
console.log(path.join(outputDir, "index.html"));
