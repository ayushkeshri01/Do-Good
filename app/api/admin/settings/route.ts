import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowedDomains, dislikeThreshold } = await req.json();

    await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        allowedDomains,
        dislikeThreshold,
      },
      update: {
        allowedDomains,
        dislikeThreshold,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
