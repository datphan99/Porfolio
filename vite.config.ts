import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "api-send-dev",
      configureServer(server) {
        const env = loadEnv("development", process.cwd(), "");
        server.middlewares.use(
          "/api/send",
          async (req: IncomingMessage, res: ServerResponse) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }
            const chunks: Buffer[] = [];
            req.on("data", (c: Buffer) => chunks.push(c));
            req.on("end", async () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString());
                const { name, email, opportunityType, company, message } = body;
                if (!name?.trim() || !email?.trim()) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: "Missing fields" }));
                  return;
                }
                const { Resend } = await import("resend");
                const resend = new Resend(env.RESEND_API_KEY);
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
                res.statusCode = error ? 500 : 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(error ? { error: error.message } : { ok: true }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: String(err) }));
              }
            });
          },
        );
      },
    },
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
