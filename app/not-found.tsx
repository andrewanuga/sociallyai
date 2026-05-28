import Link from "next/link";
import { Zap, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, #7c3aed, transparent)",
        }}
      />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="font-bold text-xl">
          <span className="gradient-text">Socially</span>
          <span className="text-foreground">AI</span>
        </span>
      </Link>

      {/* 404 */}
      <div className="text-8xl font-black gradient-text mb-4 leading-none">
        404
      </div>
      <h1 className="text-3xl font-bold mb-3">Page not found</h1>
      <p className="text-muted-foreground text-lg max-w-md mb-10">
        Looks like this page went viral and then got taken down. Let&apos;s get
        you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button variant="gradient" size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            Back to home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
