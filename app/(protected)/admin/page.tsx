import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, FolderTree, AlertTriangle } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();

  const [userCount, postCount, communityCount, hiddenPostCount, bannedUserCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.community.count(),
      prisma.post.count({ where: { status: "HIDDEN" } }),
      prisma.user.count({ where: { banned: true } }),
    ]);

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: Users,
      description: "Registered members",
    },
    {
      title: "Total Posts",
      value: postCount,
      icon: FileText,
      description: "All posts created",
    },
    {
      title: "Communities",
      value: communityCount,
      icon: FolderTree,
      description: "Active communities",
    },
    {
      title: "Hidden Posts",
      value: hiddenPostCount,
      icon: AlertTriangle,
      description: "Flagged for review",
      alert: hiddenPostCount > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session?.user?.name || "Admin"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon
                  className={`h-4 w-4 ${
                    stat.alert ? "text-amber-500" : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bannedUserCount > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Banned Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              There {bannedUserCount === 1 ? "is" : "are"}{" "}
              <span className="font-semibold text-foreground">
                {bannedUserCount}
              </span>{" "}
              banned user{bannedUserCount !== 1 && "s"} in the system.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
