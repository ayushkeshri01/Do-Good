import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId } = await params;

    const existing = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    await prisma.communityMember.create({
      data: {
        userId: session.user.id,
        communityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 }
    );
  }
}
