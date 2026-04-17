"use client";

import {} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Heart, FileText, Users, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/posts/post-card";
import { formatDate } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  points: number;
  role: string;
  createdAt: Date;
  posts: {
    id: string;
    content: string;
    images: string[];
    points: number;
    status: string;
    createdAt: Date;
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
  }[];
  memberships: {
    community: {
      id: string;
      name: string;
      slug: string;
      _count: { members: number };
    };
  }[];
}

interface ProfileContentProps {
  user: ProfileUser;
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalCommunities: number;
  };
}

export function ProfileContent({ user, stats }: ProfileContentProps) {
  const router = useRouter();

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
                {user.role === "ADMIN" && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary">{user.points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Heart className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalLikes}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold">{stats.totalCommunities}</p>
              <p className="text-xs text-muted-foreground">Communities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communities */}
      {user.memberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.memberships.map(({ community }) => (
                <Link key={community.id} href={`/communities/${community.slug}`}>
                  <Badge variant="outline" className="hover:bg-accent">
                    {community.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Posts</h2>
        {user.posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No posts yet. Start sharing your social work!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {user.posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  author: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    points: user.points,
                  },
                }}
                onLike={handleLike}
                onDislike={handleDislike}
                onReport={handleReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
