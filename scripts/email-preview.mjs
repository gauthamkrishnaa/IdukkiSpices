import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { renderBrandedEmail } = require("../email-template");
const output = process.argv[2] || "/tmp/idukki-email-preview.html";
const subject = "Commande expédiée IDK-PREVIEW-2026";
const body = [
  "Bonjour Claire,",
  "",
  "Votre commande IDK-PREVIEW-2026 a été expédiée.",
  "",
  "Total: €33.99",
  "",
  "Vous recevrez votre colis selon les délais du transporteur.",
  "",
  "Merci,",
  "Idukki Spices"
].join("\n");

fs.writeFileSync(output, renderBrandedEmail({ subject, body, baseUrl: "http://localhost:3000" }));
console.log(output);
