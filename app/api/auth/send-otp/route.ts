import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASS || "pass",
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB, expires in 10 minutes
    await prisma.oTP.upsert({
      where: { email },
      create: {
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
      update: {
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    if (process.env.SMTP_HOST) {
       await transporter.sendMail({
          from: `"Do-Good" <${process.env.SMTP_FROM || "noreply@dogood.example.com"}>`,
          to: email,
          subject: "Your Do-Good Login Code",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                @media (prefers-color-scheme: dark) {
                  .body-bg { background-color: #0f172a !important; }
                  .card-bg { background-color: #1e293b !important; border-color: #334155 !important; }
                  .text-primary { color: #22c55e !important; }
                  .text-muted { color: #94a3b8 !important; }
                  .text-main { color: #f1f5f9 !important; }
                  .otp-bg { background-color: #0f172a !important; border-color: #22c55e !important; }
                  .footer-bg { background-color: #1e293b !important; border-top-color: #334155 !important; }
                }
              </style>
            </head>
            <body class="body-bg" style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
              <div class="card-bg" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #16a34a; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Do-Good</h1>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                  <h2 class="text-main" style="margin: 0 0 16px; font-size: 20px; color: #1e293b; font-weight: 600;">Verify your email</h2>
                  <p class="text-muted" style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #475569;">Use the code below to sign in. This code is valid for 10 minutes.</p>
                  
                  <div class="otp-bg" style="display: inline-block; padding: 16px 32px; background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px;">
                    <span class="text-primary" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #16a34a; padding-left: 8px;">${code}</span>
                  </div>
                  
                  <p class="text-muted" style="margin: 32px 0 0; font-size: 14px; color: #94a3b8;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
                <div class="footer-bg" style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p class="text-muted" style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Do-Good. Empowering community impact.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
    } else {
       console.log("-----------------------------------------")
       console.log(`[DEV MODE] OTP generated for ${email}: ${code}`)
       console.log("-----------------------------------------")
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
