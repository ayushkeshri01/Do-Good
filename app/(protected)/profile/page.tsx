import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileContent } from "./profile-content";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
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
        include: {
          community: {
            select: { id: true, name: true, slug: true, _count: { select: { members: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const stats = {
    totalPosts: user.posts.length,
    totalLikes: user.posts.reduce((acc, post) => acc + post._count.likes, 0),
    totalCommunities: user.memberships.length,
  };

  return <ProfileContent user={user} stats={stats} />;
}
