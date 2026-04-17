import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        status: "VISIBLE",
        points: 50,
      },
    });

    await prisma.user.update({
      where: { id: post.authorId },
      data: {
        points: { increment: 50 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restoring post:", error);
    return NextResponse.json(
      { error: "Failed to restore post" },
      { status: 500 }
    );
  }
}
