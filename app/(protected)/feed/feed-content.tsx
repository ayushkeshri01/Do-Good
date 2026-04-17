"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileQuestion } from "lucide-react";

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

interface FeedContentProps {
  posts: Post[];
  currentUserId: string;
}

export function FeedContent({ posts, currentUserId }: FeedContentProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "hidden">("all");

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

  const handleReport = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/report`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    }
  };

  const filteredPosts =
    filter === "all"
      ? posts.filter((p) => p.status === "VISIBLE")
      : posts;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share your social work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onDislike={handleDislike}
              onReport={handleReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
