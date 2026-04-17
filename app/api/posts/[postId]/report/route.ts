import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;

    const existingDislike = await prisma.dislike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (!existingDislike) {
      await prisma.dislike.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting post:", error);
    return NextResponse.json(
      { error: "Failed to report post" },
      { status: 500 }
    );
  }
}
