export default function RootLoading() {
  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center"
      style={{ background: "#121212" }}
    >
      {/* ambient bloom */}
      <div
        className="pointer-events-none absolute h-[320px] w-[320px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.16), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo monogram */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Socially AI"
          width={72}
          height={62}
          className="h-[58px] w-auto animate-pulse-glow"
          style={{ filter: "drop-shadow(0 0 18px rgba(99,102,241,0.45))" }}
        />

        {/* Wordmark with water-flow light sweep */}
        <div
          className="font-display sai-flow-text select-none text-center"
          style={{
            fontSize: "clamp(26px, 5vw, 44px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
          }}
        >
          Socially AI
        </div>

        {/* Indeterminate progress sweep */}
        <div className="mt-1 h-px w-[180px] overflow-hidden rounded-full bg-white/10">
          <div
            className="sai-loader-bar h-full rounded-full"
            style={{
              width: "40%",
              background: "linear-gradient(90deg, transparent, #6366f1, #a855f7, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
