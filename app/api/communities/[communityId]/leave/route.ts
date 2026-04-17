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

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (community?.adminId === session.user.id) {
      return NextResponse.json(
        { error: "Admin cannot leave their own community" },
        { status: 400 }
      );
    }

    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Failed to leave community" },
      { status: 500 }
    );
  }
}
