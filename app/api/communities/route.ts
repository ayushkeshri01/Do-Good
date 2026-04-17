import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, image } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.community.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Community with this name already exists" },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image || null,
        adminId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
