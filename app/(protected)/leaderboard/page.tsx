import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeaderboardContent } from "./leaderboard-content";

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const leaders = await prisma.user.findMany({
    where: {
      banned: false,
      role: "MEMBER",
    },
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      points: "desc",
    },
    take: 100,
  });

  const currentUserRank = leaders.findIndex((u: { id: string }) => u.id === session.user.id) + 1;

  return (
    <LeaderboardContent
      leaders={leaders}
      currentUserId={session.user.id}
      currentUserRank={currentUserRank}
    />
  );
}
