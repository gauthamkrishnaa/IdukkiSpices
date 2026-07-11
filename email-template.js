function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function emailTheme(subject = "") {
  const value = subject.toLowerCase();
  if (value.includes("remboursement") || value.includes("refund")) return { label: "Remboursement", accent: "#9a5b2f", icon: "↻" };
  if (value.includes("annul") || value.includes("cancel")) return { label: "Commande annulée", accent: "#963e32", icon: "×" };
  if (value.includes("expédi") || value.includes("shipped")) return { label: "En livraison", accent: "#25634a", icon: "→" };
  if (value.includes("livrée") || value.includes("delivered")) return { label: "Livrée", accent: "#2f6f44", icon: "✓" };
  if (value.includes("otp") || value.includes("code")) return { label: "Code de sécurité", accent: "#315b70", icon: "◆" };
  if (value.includes("admin")) return { label: "Mise à jour admin", accent: "#5b4a3c", icon: "!" };
  return { label: "Mise à jour de commande", accent: "#2f6f44", icon: "✓" };
}

function formatBody(body) {
  const lines = String(body || "").split(/\r?\n/);
  const blocks = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) blocks.push("</ul>");
    listOpen = false;
  };
  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      blocks.push('<div style="height:10px;line-height:10px">&nbsp;</div>');
      return;
    }
    if (line.startsWith("- ")) {
      if (!listOpen) {
        blocks.push('<ul style="margin:8px 0 14px;padding-left:20px;color:#4f443b">');
        listOpen = true;
      }
      blocks.push(`<li style="margin:6px 0;line-height:1.55">${escapeHtml(line.slice(2))}</li>`);
      return;
    }
    closeList();
    const isTotal = /^(total|montant remboursé|montant concerné|sous-total|livraison|facture|commande|order)/i.test(line);
    if (isTotal && line.includes(":")) {
      const split = line.indexOf(":");
      blocks.push(`<div style="display:flex;justify-content:space-between;gap:16px;padding:9px 12px;margin:4px 0;border-radius:10px;background:#f5f1e9;color:#30271f"><span>${escapeHtml(line.slice(0, split))}</span><strong>${escapeHtml(line.slice(split + 1).trim())}</strong></div>`);
    } else {
      blocks.push(`<p style="margin:0 0 8px;color:#4f443b;font-size:15px;line-height:1.65">${escapeHtml(line)}</p>`);
    }
  });
  closeList();
  return blocks.join("");
}

function renderBrandedEmail({ subject, body, baseUrl }) {
  const safeBaseUrl = String(baseUrl || "https://idukkispices.com").replace(/\/$/, "");
  const theme = emailTheme(subject);
  const preheader = escapeHtml(String(body || "").split(/\r?\n/).find((line) => line.trim()) || subject);
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3eee5;font-family:Arial,Helvetica,sans-serif;color:#241d17">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3eee5">
    <tr><td align="center" style="padding:30px 14px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#fffdf8;border:1px solid #e5ddcf;border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(36,29,23,.10)">
        <tr><td style="height:7px;background:${theme.accent};font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 34px 20px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="left"><img src="${safeBaseUrl}/assets/idukki-spices-logo.jpeg" width="106" alt="Idukki Spices" style="display:block;width:106px;max-width:100%;height:auto;border:0;border-radius:12px"></td>
              <td align="right" style="vertical-align:middle"><span style="display:inline-block;padding:8px 12px;border-radius:999px;background:${theme.accent}18;color:${theme.accent};font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">${theme.icon}&nbsp; ${theme.label}</span></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:4px 34px 14px">
          <h1 style="margin:0;color:#241d17;font-size:27px;line-height:1.25">${escapeHtml(subject)}</h1>
        </td></tr>
        <tr><td style="padding:10px 34px 28px">
          <div style="padding:22px;border:1px solid #e8e0d3;border-radius:16px;background:#ffffff">
            ${formatBody(body)}
          </div>
          <div style="text-align:center;padding-top:24px">
            <a href="${safeBaseUrl}/account.html" style="display:inline-block;padding:13px 22px;border-radius:999px;background:${theme.accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700">Voir mon compte</a>
          </div>
        </td></tr>
        <tr><td style="padding:22px 34px;background:#1f422b;color:#eef7ec;text-align:center">
          <strong style="display:block;margin-bottom:7px;font-size:15px">Idukki Spices</strong>
          <span style="display:block;color:#cfe2ce;font-size:12px;line-height:1.7">Épices inspirées du Kerala, paiement sécurisé et assistance rapide.</span>
          <span style="display:block;color:#cfe2ce;font-size:12px;line-height:1.7">idukkispicesfr@gmail.com · +33 7 82 50 45 14 · Paris, France</span>
        </td></tr>
      </table>
      <p style="max-width:600px;margin:16px auto 0;color:#83766a;font-size:11px;line-height:1.5;text-align:center">Cet e-mail concerne votre compte, votre commande ou une demande adressée à Idukki Spices.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { renderBrandedEmail };
