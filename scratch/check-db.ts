import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: "smitkunpara@gmail.com" },
    select: {
        email: true,
        password: true,
        role: true
    }
  });

  console.log("User record in database:", JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

checkUser();
