"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import { FileQuestion } from "lucide-react";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  admin: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    members: number;
    posts: number;
  };
}

interface Post {
  id: string;
  content: string;
  images: string[];
  points: number;
  status: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    points: number;
  };
  communities: {
    community: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count: {
    likes: number;
    dislikes: number;
  };
  likes: { userId: string }[];
  dislikes: { userId: string }[];
}

interface CommunityPageContentProps {
  community: Community;
  posts: Post[];
  isMember: boolean;
  isAdmin: boolean;
  currentUserId: string;
}

export function CommunityPageContent({
  community,
  posts,
  isMember,
  isAdmin,
  currentUserId,
}: CommunityPageContentProps) {
  const router = useRouter();

  const handleJoin = async () => {
    const res = await fetch(`/api/communities/${community.id}/join`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const handleLeave = async () => {
    const res = await fetch(`/api/communities/${community.id}/leave`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const handleLike = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    }
  };

  const handleDislike = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/dislike`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Community Header */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="aspect-[3/1] bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-background bg-primary/20">
              <AvatarImage src={community.image || ""} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {community.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{community.name}</h1>
              {community.description && (
                <p className="mt-1 text-muted-foreground">
                  {community.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {community._count.members} members
                </span>
                <span>{community._count.posts} posts</span>
              </div>
            </div>
            {isMember ? (
              <div className="flex gap-2">
                <Link href="/create-post">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Post
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLeave}>
                  Leave
                </Button>
              </div>
            ) : (
              <Button onClick={handleJoin}>Join Community</Button>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      {isMember ? (
        posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to share in this community!
            </p>
            <Link href="/create-post" className="mt-4">
              <Button>Create Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Join this community to see posts and participate!
          </p>
        </div>
      )}
    </div>
  );
}
