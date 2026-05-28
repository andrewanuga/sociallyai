import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Auth navbar */}
      <header className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-lg">
            <span className="gradient-text">Socially</span>
            <span className="text-foreground">AI</span>
          </span>
        </Link>
      </header>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-10 blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse, #7c3aed 0%, #2563eb 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
