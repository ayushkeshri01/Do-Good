"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Trash2, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  status: string;
  points: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    points: number;
  };
  communities: {
    community: {
      name: string;
    };
  }[];
  _count: {
    likes: number;
    dislikes: number;
  };
}

interface AdminPostsContentProps {
  initialPosts: Post[];
}

export function AdminPostsContent({ initialPosts: posts }: AdminPostsContentProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "hidden" | "visible">("all");

  const filteredPosts = posts.filter((post) => {
    if (filter === "hidden") return post.status === "HIDDEN";
    if (filter === "visible") return post.status === "VISIBLE";
    return true;
  });

  const handleRestore = async (postId: string) => {
    const res = await fetch(`/api/admin/posts/${postId}/restore`, {
      method: "POST",
    });

    if (res.ok) {
      router.refresh();
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "hidden" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("hidden")}
          >
            Hidden
          </Button>
          <Button
            variant={filter === "visible" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("visible")}
          >
            Visible
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className={cn(
              "overflow-hidden",
              post.status === "HIDDEN" && "border-amber-500/50"
            )}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="font-medium hover:underline"
                      >
                        {post.author.name || "Anonymous"}
                      </Link>
                      <Badge
                        variant={
                          post.status === "VISIBLE" ? "default" : "secondary"
                        }
                        className={cn(
                          post.status === "HIDDEN" && "bg-amber-500"
                        )}
                      >
                        {post.status === "HIDDEN" ? (
                          <EyeOff className="h-3 w-3 mr-1" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        {post.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm line-clamp-2">{post.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post._count.likes} likes</span>
                      <span>{post._count.dislikes} dislikes</span>
                      <span>{post.points > 0 ? `+${post.points}` : post.points} points</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {post.communities.map((cp) => (
                        <Badge key={cp.community.name} variant="outline" className="text-xs">
                          {cp.community.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === "HIDDEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(post.id)}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
