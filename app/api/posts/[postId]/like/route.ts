import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      revalidatePath("/");
      revalidatePath("/feed");
      return NextResponse.json({ liked: false });
    }

    await prisma.dislike.deleteMany({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    revalidatePath("/");
    revalidatePath("/feed");

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
