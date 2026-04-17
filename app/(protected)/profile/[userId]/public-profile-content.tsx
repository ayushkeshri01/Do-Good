"use client";

import Link from "next/link";
import { Heart, FileText, Users, Trophy, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/posts/post-card";
import { formatDate } from "@/lib/utils";

interface PublicUser {
  id: string;
  name: string | null;
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
    };
  }[];
}

interface PublicProfileContentProps {
  user: PublicUser;
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalCommunities: number;
  };
  isOwnProfile: boolean;
}

export function PublicProfileContent({ user, stats, isOwnProfile }: PublicProfileContentProps) {
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
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
                {user.role === "ADMIN" && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
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
        <h2 className="text-lg font-semibold mb-4">Posts</h2>
        {user.posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No posts yet.
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
                currentUserId={isOwnProfile ? user.id : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
