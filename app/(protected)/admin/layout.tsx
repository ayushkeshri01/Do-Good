import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Shield, Users, FolderTree, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/feed");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: Shield },
    { href: "/admin/communities", label: "Communities", icon: FolderTree },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage your Do-Good community</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
