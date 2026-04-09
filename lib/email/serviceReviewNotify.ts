import { sendHtmlEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layoutKazaro(inner: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kazaro</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#fffefb;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;box-shadow:0 8px 32px rgba(28,25,23,0.06);">
          <tr>
            <td style="padding:28px 28px 8px 28px;">
              <div style="font-size:20px;font-weight:800;letter-spacing:-0.04em;color:#1c1917;">Kazaro</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 32px 28px;color:#44403c;font-size:15px;line-height:1.6;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;border-top:1px solid #f3eee8;">
              <p style="margin:16px 0 0;font-size:12px;color:#78716c;line-height:1.5;">Kazaro · serviços e agendamentos</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function notifyProfessionalOfServiceReview(input: {
  to: string;
  recipientName: string;
  serviceName: string;
  areaLabel: string | null;
  status: "approved" | "rejected";
  note: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const who = escapeHtml(input.recipientName.trim() || "Olá");
  const serviceName = escapeHtml(input.serviceName.trim() || "Seu serviço");
  const area = input.areaLabel ? escapeHtml(input.areaLabel) : null;
  const note = input.note?.trim() ? escapeHtml(input.note.trim()) : null;
  const dashUrl = `${getSiteUrl()}/dashboard/servicos`;

  const isApproved = input.status === "approved";
  const subject = isApproved ? "Seu serviço foi aprovado no Kazaro" : "Atualização sobre seu serviço no Kazaro";

  const headline = isApproved
    ? `<strong style="color:#115e59;font-size:17px;display:block;margin-bottom:12px;">Serviço aprovado</strong>`
    : `<strong style="color:#a33b2f;font-size:17px;display:block;margin-bottom:12px;">Serviço não aprovado</strong>`;

  const lead = isApproved
    ? `Boa notícia: <strong>${serviceName}</strong> foi aprovado na moderação e já pode aparecer no seu perfil público com o preço fixo para agendamento.`
    : `O cadastro <strong>${serviceName}</strong> não foi aprovado nesta revisão. Você pode ajustar e enviar de novo em Meus serviços, se fizer sentido.`;

  const areaBlock = area ? `<p style="margin:16px 0 0;color:#57534e;font-size:14px;">Área: <strong>${area}</strong></p>` : "";

  const noteBlock = note
    ? `<div style="margin:20px 0 0;padding:14px 16px;background:#f3eee8;border-radius:12px;border:1px solid #e7dfd8;">
         <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;margin-bottom:6px;">Nota da equipe</div>
         <div style="font-size:14px;color:#44403c;line-height:1.5;">${note}</div>
       </div>`
    : "";

  const hrefAttr = dashUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const cta = `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 0;">
    <tr>
      <td style="border-radius:999px;background:#0f766e;">
        <a href="${hrefAttr}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">Abrir Meus serviços</a>
      </td>
    </tr>
  </table>
  <p style="margin:14px 0 0;font-size:12px;color:#78716c;">Ou copie o link:<br /><span style="word-break:break-all;color:#57534e;">${escapeHtml(dashUrl)}</span></p>`;

  const html = layoutKazaro(`${headline}<p style="margin:0;">Olá, ${who}.</p><p style="margin:14px 0 0;">${lead}</p>${areaBlock}${noteBlock}${cta}`);

  const text = [
    `${who},`,
    "",
    isApproved
      ? `Seu serviço "${input.serviceName}" foi aprovado no Kazaro.`
      : `Seu serviço "${input.serviceName}" não foi aprovado nesta revisão.`,
    area ? `Área: ${input.areaLabel}.` : "",
    note ? `Nota da equipe: ${input.note}` : "",
    "",
    `Abrir Meus serviços: ${dashUrl}`,
    "",
    "- Kazaro",
  ]
    .filter(Boolean)
    .join("\n");

  return sendHtmlEmail({ to: input.to, subject, html, text });
}
