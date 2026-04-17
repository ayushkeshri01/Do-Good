import { prisma } from "@/lib/prisma";
import { AdminCommunitiesContent } from "./admin-communities-content";

export default async function AdminCommunitiesPage() {
  const communities = await prisma.community.findMany({
    include: {
      admin: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminCommunitiesContent initialCommunities={communities} />;
}
