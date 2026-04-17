import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeedContent } from "./feed-content";

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userCommunities = await prisma.communityMember.findMany({
    where: { userId: session.user.id },
    select: { communityId: true },
  });

  const communityIds = userCommunities.map((c) => c.communityId);

  const posts = await prisma.post.findMany({
    where: {
      status: { in: ["VISIBLE", "HIDDEN"] },
      communities: {
        some: {
          communityId: { in: communityIds },
        },
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
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      likes: {
        select: { userId: true },
      },
      dislikes: {
        select: { userId: true },
      },
      _count: {
        select: {
          likes: true,
          dislikes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <FeedContent posts={posts} currentUserId={session.user.id} />;
}
