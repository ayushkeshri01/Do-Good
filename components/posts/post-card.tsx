"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal, Flag, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatTimeAgo } from "@/lib/utils";

interface PostCardProps {
  post: {
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
  };
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onDislike,
  onReport,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like.userId === currentUserId)
  );
  const [isDisliked, setIsDisliked] = useState(
    post.dislikes.some((dislike) => dislike.userId === currentUserId)
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [dislikeCount, setDislikeCount] = useState(post._count.dislikes);

  useEffect(() => {
    setIsLiked(post.likes.some((like) => like.userId === currentUserId));
    setIsDisliked(post.dislikes.some((dislike) => dislike.userId === currentUserId));
    setLikeCount(post._count.likes);
    setDislikeCount(post._count.dislikes);
  }, [post, currentUserId]);

  const handleLike = () => {
    if (!currentUserId) return;
    
    const newIsLiked = !isLiked;
    const newIsDisliked = isDisliked;
    
    if (newIsLiked && newIsDisliked) {
      setIsDisliked(false);
      setDislikeCount((c) => c - 1);
    }
    
    setIsLiked(newIsLiked);
    setLikeCount((c) => (newIsLiked ? c + 1 : c - 1));
    onLike?.(post.id);
  };

  const handleDislike = () => {
    if (!currentUserId) return;
    
    const newIsDisliked = !isDisliked;
    const newIsLiked = isLiked;
    
    if (newIsDisliked && newIsLiked) {
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    }
    
    setIsDisliked(newIsDisliked);
    setDislikeCount((c) => (newIsDisliked ? c + 1 : c - 1));
    onDislike?.(post.id);
  };

  const isHidden = post.status === "HIDDEN";

  return (
    <Card className={cn("overflow-hidden", isHidden && "opacity-60")}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.author.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author.id}`}
                  className="font-medium hover:underline"
                >
                  {post.author.name || "Anonymous"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {post.author.points} pts
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              +{post.points} pts
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onReport?.(post.id)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Communities */}
        <div className="mt-3 flex flex-wrap gap-1">
          {post.communities.map(({ community }) => (
            <Link key={community.id} href={`/communities/${community.slug}`}>
              <Badge variant="outline" className="text-xs hover:bg-accent">
                {community.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        </div>

        {/* Images */}
        {post.images.length > 0 && (
          <div
            className={cn(
              "mt-4 grid gap-2",
              post.images.length === 1 && "grid-cols-1",
              post.images.length === 2 && "grid-cols-2",
              post.images.length >= 3 && "grid-cols-2"
            )}
          >
            {post.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative overflow-hidden rounded-lg bg-muted",
                  post.images.length === 1 && "aspect-video",
                  post.images.length === 2 && "aspect-square",
                  post.images.length >= 3 && index === 0 && "aspect-video col-span-2",
                  post.images.length >= 3 && index > 0 && "aspect-square"
                )}
              >
                <Image
                  src={image}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Status Badge */}
        {isHidden && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-600">
            <EyeOff className="h-4 w-4" />
            <span className="text-sm">This post is hidden due to community feedback</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-4 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 text-muted-foreground",
              isLiked && "text-primary"
            )}
            onClick={handleLike}
          >
            <Heart
              className={cn("h-4 w-4", isLiked && "fill-current")}
            />
            {likeCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 text-muted-foreground",
              isDisliked && "text-destructive"
            )}
            onClick={handleDislike}
          >
            <MessageCircle className="h-4 w-4" />
            {dislikeCount}
          </Button>
        </div>
      </div>
    </Card>
  );
}
