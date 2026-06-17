import { Resend } from "resend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, opportunityType, company, message } =
    req.body as {
      name?: string;
      email?: string;
      opportunityType?: string;
      company?: string;
      message?: string;
    };

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to: "tuyendat2421@gmail.com",
    replyTo: email,
    subject: `[Portfolio] ${opportunityType ? `${opportunityType} · ` : ""}${name}${company ? ` @ ${company}` : ""}`,
    text: [
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Type:    ${opportunityType || "—"}`,
      `Company: ${company || "—"}`,
      ``,
      message || "(no message)",
    ].join("\n"),
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
