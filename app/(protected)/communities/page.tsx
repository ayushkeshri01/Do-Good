import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommunitiesContent } from "./communities-content";

export default async function CommunitiesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
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

  const userMemberships = await prisma.communityMember.findMany({
    where: { userId: session.user.id },
    select: { communityId: true },
  });

  const memberCommunityIds = userMemberships.map((m: { communityId: string }) => m.communityId);

  return (
    <CommunitiesContent
      communities={communities}
      memberCommunityIds={memberCommunityIds}
    />
  );
}
