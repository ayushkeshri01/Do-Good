import { prisma } from "../lib/prisma";

async function check() {
  console.log("Database models check:");
  console.log("- User:", !!prisma.user);
  console.log("- Account:", !!prisma.account);
  console.log("- Session:", !!prisma.session);
  console.log("- VerificationToken:", !!prisma.verificationToken);
  process.exit(0);
}

check();
