"use client";

import {} from "react";
import { useRouter } from "next/navigation";
import { CommunityCard } from "@/components/communities/community-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: {
    members: number;
    posts: number;
  };
}

interface CommunitiesContentProps {
  communities: Community[];
  memberCommunityIds: string[];
}

export function CommunitiesContent({
  communities,
  memberCommunityIds,
}: CommunitiesContentProps) {
  const router = useRouter();

  const handleJoin = async (communityId: string) => {
    const res = await fetch(`/api/communities/${communityId}/join`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const handleLeave = async (communityId: string) => {
    const res = await fetch(`/api/communities/${communityId}/leave`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const myCommunities = communities.filter((c) => memberCommunityIds.includes(c.id));
  const otherCommunities = communities.filter((c) => !memberCommunityIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Communities</h1>
      </div>

      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">My Communities</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>
        <TabsContent value="my" className="mt-6">
          {myCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No communities yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Join a community to see posts and participate!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isMember={true}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="browse" className="mt-6">
          {otherCommunities.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No other communities available
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isMember={false}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
