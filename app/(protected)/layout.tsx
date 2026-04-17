import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "@/components/providers/session-provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-6 px-4">{children}</main>
      </div>
    </SessionProvider>
  );
}
