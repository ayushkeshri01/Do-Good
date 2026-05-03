import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Heart, Users, Trophy, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                DG
              </div>
              <span className="text-xl font-semibold">Neki</span>
            </div>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Make a Difference,
            <br />
            <span className="text-primary">Together</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Join your company community to share social work, donations, and
            volunteer opportunities. Earn points, climb the leaderboard, and
            make a lasting impact.
          </p>
          <Link href="/login" className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Share Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Post about your social work, donations, and volunteer
                  activities. Inspire others in your community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Join Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Be part of different communities within your organization.
                  Each community has its own focused initiatives.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Earn & Compete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn 50 points for every post. Climb the leaderboard and
                  see who is making the biggest impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h2 className="text-2xl font-bold">Company-Only Access</h2>
              <p className="mt-2 max-w-xl mx-auto opacity-80">
                Neki is exclusively for members of your organization.
                Sign in with your company email to join.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Neki. Making a difference, together.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
