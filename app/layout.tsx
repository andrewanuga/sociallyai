import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
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

// Body face — precise, technical, premium (pairs with General Sans display).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Utility / data face — eyebrows, numbers, labels.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
        {/* Mark JS-present before paint so reveal elements can pre-hide without FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('sai-js')`,
          }}
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
