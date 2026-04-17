import { PrismaClient } from "@prisma/client";
import { Role } from "@/types/Role";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================
// IMPORTANT: EDIT THESE VALUES BEFORE RUNNING
// ============================================
// Replace with your actual Google email address
// This email MUST match what you'll use to sign in
const ADMIN_EMAIL: string = "admin@outlook.com";

// Replace with the admin's display name
const ADMIN_NAME = "Admin - Do-Good";
// ============================================

async function createAdmin() {
  console.log("🔧 Do-Good Admin Setup");
  console.log("========================\n");

  // Validate input
  if (ADMIN_EMAIL === "your-email@gmail.com") {
    console.error("❌ Error: Please edit this file and set your ADMIN_EMAIL!");
    console.log("Open scripts/create-admin.ts and change the ADMIN_EMAIL variable.\n");
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists!");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log("\nTo change the admin, manually update the database.\n");
      return;
    }

    console.log("📧 Creating admin user...");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Name: ${ADMIN_NAME}`);

    const password = "admin"; // Default password (you should change this after first login)
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: hashedPassword,
        role: Role.ADMIN,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(ADMIN_NAME)}&background=16a34a&color=fff`,
      },
    });

    // Extract domain from email for allowed domain restriction
    const domain = ADMIN_EMAIL.split("@")[1];

    console.log("\n🔒 Setting up domain restriction...");
    console.log(`   Allowed domain: ${domain}`);

    await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        allowedDomains: [domain],
        dislikeThreshold: 0.15,
      },
      update: {
        allowedDomains: { push: domain },
      },
    });

    console.log("\n✅ Admin created successfully!");
    console.log("========================");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Allowed domain: ${domain}`);
    console.log("\n📋 Next Steps:");
    console.log("   1. Sign in with this email at http://localhost:3000/login");
    console.log("      (Your default password is: admin123)");
    console.log("   2. Go to /admin to create communities");
    console.log(`   3. Users with @${domain} emails can now join!\n`);

  } catch (error) {
    console.error("\n❌ Error creating admin:", error);
    console.log("\nMake sure you have:");
    console.log("   - Run 'npm run db:migrate' to create database tables");
    console.log("   - Started your PostgreSQL database");
    console.log("   - Set DATABASE_URL in .env file\n");
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
