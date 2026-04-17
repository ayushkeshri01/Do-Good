import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicProfileContent } from "./public-profile-content";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      role: true,
      createdAt: true,
      banned: true,
      posts: {
        where: { status: "VISIBLE" },
        include: {
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
      },
      memberships: {
        where: {
          community: {
            members: {
              some: { userId: session.user.id },
            },
          },
        },
        include: {
          community: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!user || user.banned) {
    notFound();
  }

  const stats = {
    totalPosts: user.posts.length,
    totalLikes: user.posts.reduce((acc, post) => acc + post._count.likes, 0),
    totalCommunities: user.memberships.length,
  };

  return (
    <PublicProfileContent
      user={user}
      stats={stats}
      isOwnProfile={user.id === session.user.id}
    />
  );
}
