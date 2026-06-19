import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SociallyAI — AI-Powered Social Media Manager",
  description:
    "The all-in-one AI social media workspace. Schedule posts, deploy autonomous agents, predict performance, and turn engagement into revenue — powered by Llama 3.3 70B.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
