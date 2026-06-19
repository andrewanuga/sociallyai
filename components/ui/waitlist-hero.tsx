"use client";

import { useState, useRef } from "react";

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  life: number; color: string; size: number;
};

export const WaitlistHero = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      fireConfetti();
    }, 1500);
  };

  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const colors = ["#ef4444", "#dc2626", "#f87171", "#b91c1c", "#ffffff"];

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const create = (): Particle => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 2) * 10,
      life: 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
    });

    for (let i = 0; i < 50; i++) particles.push(create());

    const animate = () => {
      if (particles.length === 0) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= 2;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) { particles.splice(i, 1); i--; }
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <style>{`
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .animate-spin-slow { animation: spin-slow 60s linear infinite; }
        @keyframes spin-slow-reverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 60s linear infinite; }
        @keyframes wh-bounce-in {
          0%{transform:scale(0.8);opacity:0} 50%{transform:scale(1.05);opacity:1} 100%{transform:scale(1);opacity:1}
        }
        .wh-bounce-in { animation: wh-bounce-in 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        @keyframes wh-success-pulse {
          0%{transform:scale(0.5);opacity:0} 50%{transform:scale(1.1)} 70%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1}
        }
        @keyframes wh-success-glow {
          0%,100%{box-shadow:0 0 20px rgba(239,68,68,.4)} 50%{box-shadow:0 0 60px rgba(239,68,68,.8),0 0 100px rgba(239,68,68,.4)}
        }
        @keyframes wh-checkmark { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
        @keyframes wh-ring {
          0%{transform:translate(-50%,-50%) scale(0.8);opacity:1} 100%{transform:translate(-50%,-50%) scale(2);opacity:0}
        }
        .wh-success-pulse { animation: wh-success-pulse 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .wh-success-glow  { animation: wh-success-glow 2s ease-in-out infinite; }
        .wh-checkmark     { stroke-dasharray:24; stroke-dashoffset:24; animation: wh-checkmark 0.4s ease-out 0.3s forwards; }
        .wh-ring          { animation: wh-ring 0.8s ease-out forwards; }
      `}</style>

      <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: "#09090b" }}>
        {/* Spinning rings */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: "perspective(1200px) rotateX(15deg)", transformOrigin: "center bottom" }}
        >
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-1/2 left-1/2" style={{ width: "2000px", height: "2000px", transform: "translate(-50%,-50%) rotate(279.05deg)" }}>
              <img src="https://framerusercontent.com/images/oqZEqzDEgSLygmUDuZAYNh2XQ9U.png?scale-down-to=2048" alt="" className="w-full h-full object-cover opacity-50" />
            </div>
          </div>
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div className="absolute top-1/2 left-1/2" style={{ width: "1000px", height: "1000px", transform: "translate(-50%,-50%) rotate(304.42deg)" }}>
              <img src="https://framerusercontent.com/images/UbucGYsHDAUHfaGZNjwyCzViw8.png?scale-down-to=1024" alt="" className="w-full h-full object-cover opacity-60" />
            </div>
          </div>
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-1/2 left-1/2" style={{ width: "800px", height: "800px", transform: "translate(-50%,-50%) rotate(48.33deg)" }}>
              <img src="https://framerusercontent.com/images/Ans5PAxtJfg3CwxlrPMSshx2Pqc.png" alt="" className="w-full h-full object-cover opacity-80" />
            </div>
          </div>
        </div>

        {/* Gradient fade */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to top,#09090b 10%,rgba(9,9,11,.8) 40%,transparent 100%)" }} />

        {/* Content */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-end pb-24 gap-6">
          <div className="w-16 h-16 rounded-2xl shadow-lg overflow-hidden mb-2 ring-1 ring-white/10">
            <img
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop"
              alt="App Icon"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-center tracking-tight text-white">
            Grow your audience.
          </h1>
          <p className="text-lg font-medium text-slate-400">
            AI-powered social media, built for creators.
          </p>

          {/* Form container */}
          <div className="w-full max-w-md px-4 mt-4 h-[60px] relative">
            <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-50" />

            {/* Success */}
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-500 ${
                status === "success" ? "opacity-100 scale-100 wh-success-pulse wh-success-glow" : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{ backgroundColor: "#ef4444" }}
            >
              {status === "success" && (
                <>
                  <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-red-400 wh-ring" style={{ animationDelay: "0s" }} />
                  <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-red-300 wh-ring" style={{ animationDelay: "0.15s" }} />
                  <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-red-200 wh-ring" style={{ animationDelay: "0.3s" }} />
                </>
              )}
              <div className={`flex items-center gap-2 text-white font-semibold text-lg ${status === "success" ? "wh-bounce-in" : ""}`}>
                <div className="bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className={status === "success" ? "wh-checkmark" : ""} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>You&apos;re on the list!</span>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className={`relative w-full h-full transition-all duration-500 ${
                status === "success" ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
              }`}
            >
              <input
                type="email"
                required
                placeholder="name@email.com"
                value={email}
                disabled={status === "loading"}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[60px] pl-6 pr-[150px] rounded-full outline-none transition-all duration-200 placeholder-zinc-500 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#27272a", color: "#ffffff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)" }}
              />
              <div className="absolute top-[6px] right-[6px] bottom-[6px]">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-full px-6 rounded-full font-medium text-white bg-red-500 hover:bg-red-400 transition-all active:scale-95 disabled:cursor-wait flex items-center justify-center min-w-[130px]"
                >
                  {status === "loading" ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : "Join waitlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
