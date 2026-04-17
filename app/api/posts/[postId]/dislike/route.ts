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

    if (existingDislike) {
      await prisma.dislike.delete({
        where: { id: existingDislike.id },
      });
      return NextResponse.json({ disliked: false });
    }

    await prisma.like.deleteMany({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    await prisma.dislike.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        communities: {
          include: {
            community: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (post) {
      const totalMembers = new Set(
        post.communities.flatMap((cp) =>
          cp.community.members.map((m) => m.id)
        )
      ).size;

      const dislikeCount = await prisma.dislike.count({
        where: { postId },
      });

      const settings = await prisma.appSettings.findFirst();
      const threshold = settings?.dislikeThreshold || 0.15;

      if (totalMembers > 0 && dislikeCount / totalMembers >= threshold) {
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: "HIDDEN",
            points: 0,
          },
        });

        await prisma.user.update({
          where: { id: post.authorId },
          data: { points: { decrement: 50 } },
        });
      }
    }

    return NextResponse.json({ disliked: true });
  } catch (error) {
    console.error("Error toggling dislike:", error);
    return NextResponse.json(
      { error: "Failed to toggle dislike" },
      { status: 500 }
    );
  }
}
