import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePostForm } from "@/components/posts/create-post-form";

export default async function CreatePostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userCommunities = await prisma.communityMember.findMany({
    where: { userId: session.user.id },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const communities = userCommunities.map((m: { community: { id: string; name: string; slug: string } }) => m.community);

  if (communities.length === 0) {
    redirect("/communities");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Create Post</h1>
      <CreatePostForm communities={communities} />
    </div>
  );
}
