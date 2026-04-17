import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    _count: {
      members: number;
      posts: number;
    };
  };
  isMember: boolean;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
}

export function CommunityCard({
  community,
  isMember,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        {community.image ? (
          <Avatar className="h-16 w-16">
            <AvatarImage src={community.image} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {community.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Users className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <Link href={`/communities/${community.slug}`}>
          <h3 className="font-semibold hover:text-primary">{community.name}</h3>
        </Link>
        {community.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{community._count.members} members</span>
          <span>{community._count.posts} posts</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {isMember ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onLeave?.(community.id)}
          >
            Leave
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onJoin?.(community.id)}
          >
            Join
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
