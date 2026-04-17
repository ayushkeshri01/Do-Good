"use client";

import { Trophy, Medal, Award, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Leader {
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  _count: {
    posts: number;
  };
}

interface LeaderboardContentProps {
  leaders: Leader[];
  currentUserId: string;
  currentUserRank: number;
}

export function LeaderboardContent({
  leaders,
  currentUserId,
  currentUserRank,
}: LeaderboardContentProps) {
  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Leaderboard
        </h1>
      </div>

      {/* Top 3 Podium */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-4">
            {/* Second Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-muted-foreground/50">
                    <AvatarImage src={topThree[1].image || ""} />
                    <AvatarFallback className="bg-muted text-lg">
                      {topThree[1].name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/20">
                    <Medal className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium">
                  {topThree[1].name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topThree[1].points} pts
                </p>
                <div className="mt-2 h-20 w-16 rounded-t-lg bg-muted-foreground/20 flex items-end justify-center pb-2">
                  <span className="text-2xl font-bold text-muted-foreground">2</span>
                </div>
              </div>
            )}

            {/* First Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary">
                    <AvatarImage src={topThree[0].image || ""} />
                    <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                      {topThree[0].name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Crown className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <p className="mt-2 font-semibold">
                  {topThree[0].name || "Anonymous"}
                </p>
                <p className="text-sm text-primary font-medium">
                  {topThree[0].points} pts
                </p>
                <div className="mt-2 h-28 w-20 rounded-t-lg bg-primary/20 flex items-end justify-center pb-2">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
              </div>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-amber-600/50">
                    <AvatarImage src={topThree[2].image || ""} />
                    <AvatarFallback className="bg-amber-600/20 text-lg text-amber-600">
                      {topThree[2].name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600/20">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium">
                  {topThree[2].name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topThree[2].points} pts
                </p>
                <div className="mt-2 h-16 w-16 rounded-t-lg bg-amber-600/10 flex items-end justify-center pb-2">
                  <span className="text-2xl font-bold text-amber-600">3</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {rest.map((leader, index) => {
              const rank = index + 4;
              const isCurrentUser = leader.id === currentUserId;

              return (
                <div
                  key={leader.id}
                  className={cn(
                    "flex items-center gap-4 px-6 py-3",
                    isCurrentUser && "bg-primary/5"
                  )}
                >
                  <div className="w-8 text-center font-medium text-muted-foreground">
                    #{rank}
                  </div>
                  <Avatar className={cn("h-10 w-10", isCurrentUser && "ring-2 ring-primary")}>
                    <AvatarImage src={leader.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {leader.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className={cn("font-medium", isCurrentUser && "text-primary")}>
                      {leader.name || "Anonymous"}
                      {isCurrentUser && " (You)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leader._count.posts} posts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-semibold", isCurrentUser && "text-primary")}>
                      {leader.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Your Rank */}
      {currentUserRank > 3 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">#{currentUserRank}</span>
              <div>
                <p className="font-medium">Your Position</p>
                <p className="text-sm text-muted-foreground">
                  Keep posting to climb the ranks!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
