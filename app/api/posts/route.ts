import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const content = formData.get("content") as string;
    const communitiesJson = formData.get("communities") as string;
    const images = formData.getAll("images") as File[];

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const communities = JSON.parse(communitiesJson || "[]");
    if (communities.length === 0) {
      return NextResponse.json(
        { error: "Select at least one community" },
        { status: 400 }
      );
    }

    const memberships = await prisma.communityMember.findMany({
      where: {
        userId: session.user.id,
        communityId: { in: communities },
      },
    });

    if (memberships.length !== communities.length) {
      return NextResponse.json(
        { error: "You must be a member of all selected communities" },
        { status: 400 }
      );
    }

    const imageUrls: string[] = [];
    for (const image of images) {
      if (image.size > 0) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const url = await uploadToS3(
          buffer,
          image.name,
          image.type || "image/jpeg"
        );
        imageUrls.push(url);
      }
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images: imageUrls,
        authorId: session.user.id,
        points: 50,
        communities: {
          create: communities.map((communityId: string) => ({
            communityId,
          })),
        },
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: 50 } },
    });

    revalidatePath("/");
    revalidatePath("/feed");
    revalidatePath("/leaderboard");

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const userCommunities = await prisma.communityMember.findMany({
      where: { userId: session.user.id },
      select: { communityId: true },
    });

    const communityIds = communityId
      ? [communityId]
      : userCommunities.map((c: { communityId: string }) => c.communityId);

    const posts = await prisma.post.findMany({
      where: {
        status: { in: ["VISIBLE", "HIDDEN"] },
        communities: {
          some: { communityId: { in: communityIds } },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            points: true,
          },
        },
        communities: {
          include: {
            community: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        likes: { select: { userId: true } },
        dislikes: { select: { userId: true } },
        _count: { select: { likes: true, dislikes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
