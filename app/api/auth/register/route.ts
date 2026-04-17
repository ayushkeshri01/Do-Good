import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, code } = await req.json();

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: "Email, password, and code are required" },
        { status: 400 }
      );
    }

    // 1. Verify OTP Code
    const otpRecord = await prisma.oTP.findUnique({
      where: { email },
    });

    if (!otpRecord || otpRecord.code !== code || otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // 2. Extract domain and check / setup AppSettings
    const emailDomain = email.split("@")[1];
    let settings = await prisma.appSettings.findFirst();
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: { id: "default", allowedDomains: [] }
      });
    }

    // 3. Determine Role and System Bootstrap Status
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    
    if (adminCount === 0) {
      // First user out of the box becomes the Admin
      // Append their domain to allowed domains if it doesn't already exist
      if (!settings.allowedDomains.includes(emailDomain)) {
        await prisma.appSettings.update({
          where: { id: "default" },
          data: { allowedDomains: { push: emailDomain } }
        });
      }
    } else {
      // Normal member registration -> enforce domain block
      if (!settings.allowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          { error: `The domain @${emailDomain} is not authorized for registration.` },
          { status: 403 }
        );
      }
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create or Update existing User
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
       if (existingUser.password) {
         return NextResponse.json(
           { error: "User already exists with a password. Please sign in." },
           { status: 400 }
         );
       }
       // If an admin created them with no password, or a script, attach the password
       await prisma.user.update({
         where: { email },
         data: { password: hashedPassword }
       });
    } else {
       await prisma.user.create({
         data: {
           email,
           name: email.split("@")[0],
           password: hashedPassword,
           role: adminCount === 0 ? "ADMIN" : "MEMBER",
         }
       });
    }

    // 6. Delete OTP entry since it's verified
    await prisma.oTP.delete({ where: { email } });

    return NextResponse.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
