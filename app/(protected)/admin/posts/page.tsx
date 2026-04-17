import { prisma } from "@/lib/prisma";
import { AdminPostsContent } from "./admin-posts-content";

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          points: true,
        },
      },
      communities: {
        include: {
          community: {
            select: { name: true },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          dislikes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminPostsContent initialPosts={posts} />;
}
