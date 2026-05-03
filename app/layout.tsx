import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Neki | Community Social Work Platform",
    template: "%s | Neki",
  },
  description:
    "Join your company's community to share social work, donations, and make a positive impact together. Earn points, climb the leaderboard, and inspire others.",
  keywords: [
    "social work",
    "community",
    "donations",
    "volunteer",
    "company",
    "team building",
    "corporate social responsibility",
    "csr",
  ],
  authors: [{ name: "Neki Team" }],
  creator: "Neki Team",
  publisher: "Neki",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Neki",
    title: "Neki | Community Social Work Platform",
    description:
      "Join your company's community to share social work, donations, and make a positive impact together.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Neki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neki | Community Social Work Platform",
    description:
      "Join your company's community to share social work, donations, and make a positive impact together.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
