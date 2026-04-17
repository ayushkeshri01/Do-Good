"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle, MessageSquare, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  points: number;
  banned: boolean;
  banReason: string | null;
  createdAt: Date;
  _count: {
    posts: number;
    memberships: number;
  };
}

interface AdminUsersContentProps {
  initialUsers: User[];
  currentUserId: string;
}

export function AdminUsersContent({
  initialUsers: users,
  currentUserId,
}: AdminUsersContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [banReason, setBanReason] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) return;

    const res = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: banReason }),
    });

    if (res.ok) {
      setSelectedUser(null);
      setBanReason("");
      router.refresh();
    }
  };

  const handleUnban = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}/unban`, {
      method: "POST",
    });

    if (res.ok) {
      router.refresh();
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    const res = await fetch(`/api/admin/users/${selectedUser.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      setSelectedUser(null);
      setMessage("");
      alert("Message sent to user!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className={user.banned ? "opacity-60 border-destructive/50" : ""}
          >
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.name || "Anonymous"}</h3>
                    {user.role === "ADMIN" && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    {user.banned && (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{user.points} points</span>
                    <span>{user._count.posts} posts</span>
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedUser(user)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Message to {user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message..."
                        rows={4}
                      />
                      <Button onClick={handleSendMessage} className="w-full">
                        Send Message
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {user.id !== currentUserId && (
                  user.banned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnban(user.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Unban
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Ban className="h-4 w-4" />
                      Ban
                    </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ban {user.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Reason for ban..."
                            rows={3}
                          />
                          <Button
                            onClick={handleBan}
                            variant="destructive"
                            className="w-full"
                          >
                            Confirm Ban
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
