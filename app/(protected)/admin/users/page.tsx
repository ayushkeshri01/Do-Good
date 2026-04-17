import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUsersContent } from "./admin-users-content";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await auth();

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          posts: true,
          memberships: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminUsersContent initialUsers={users} currentUserId={session!.user.id} />;
}
