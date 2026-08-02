import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter (body) + JetBrains Mono (data) are loaded via a client-side <link> below
// rather than next/font — next/font fetches font files at build time, which
// hard-fails in offline/air-gapped environments. The <link> degrades gracefully
// to Geist/system fallbacks (see --font-inter / --font-jetbrains in globals.css).

export const metadata: Metadata = {
  title: "Socially AI — Your Personal Social Agent",
  description:
    "Social, understood. Deploy an AI agent that creates, engages, and converts around the clock — powered by Llama 3.3 70B.",
  keywords: [
    "social media management",
    "AI content creation",
    "social media scheduling",
    "AI agents",
    "content calendar",
    "social media analytics",
    "Nigeria",
    "Africa",
  ],
   icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "SociallyAI — AI-Powered Social Media Manager",
    description:
      "Stop managing social media. Start delegating it. SociallyAI deploys autonomous AI agents that create content, engage followers, and convert leads 24/7.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark sai-js h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <ImpersonationBanner />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
