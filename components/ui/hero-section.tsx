"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { useRef } from "react";

const blocksDesign = [
  {
    id: "compose",
    name: "AI Compose",
    url: "/dashboard/compose",
    des: "Generate posts with your brand voice.",
    imgSrc: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "analytics",
    name: "Analytics",
    url: "/dashboard/analytics",
    des: "Deep dive into your performance data.",
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "ghost-mode",
    name: "Ghost Mode",
    url: "/dashboard/ghost-mode",
    des: "Autonomous AI agent for engagement.",
    imgSrc: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "calendar",
    name: "Content Calendar",
    url: "/dashboard/calendar",
    des: "Visual scheduling across platforms.",
    imgSrc: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "trends",
    name: "Trend Discovery",
    url: "/dashboard/trends",
    des: "Catch viral topics before they peak.",
    imgSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "inbox",
    name: "Smart Inbox",
    url: "/dashboard/inbox",
    des: "Triage and respond with AI suggestions.",
    imgSrc: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=687&auto=format&fit=crop",
  },
];

function SociallyHeroShowcase() {
  const timelineRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.4, duration: 0.5 },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  return (
    <main ref={timelineRef} className="bg-background">
      {/* Navbar */}
      <TimelineContent
        as="header"
        animationNum={1}
        timelineRef={timelineRef}
        className="w-full top-1.5 left-0 z-50 transition-all duration-300 relative md:px-0 px-2"
      >
        <div className="2xl:max-w-6xl max-w-5xl p-1 2xl:px-1 px-2 h-full relative mx-auto flex justify-between backdrop-blur-2xl bg-card/10 rounded-lg items-center border border-border/50">
          <Link href="/" className="relative flex items-center gap-2 p-2 rounded-md">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-md shadow-red-600/30">
              <span className="text-white text-xs font-black">S</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">SociallyAI</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </TimelineContent>

      {/* Hero */}
      <div className="pt-28 pb-5 max-w-screen-2xl mx-auto min-h-screen px-4">
        <article className="w-fit mx-auto 2xl:max-w-5xl xl:max-w-4xl max-w-2xl text-center space-y-6">

          {/* Badge */}
          <TimelineContent
            as="a"
            href="/signup"
            animationNum={2}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="flex w-fit mx-auto items-center gap-1 rounded-full bg-red-600 border-4 border-red-500/30 py-0.5 pl-0.5 pr-3 text-xs"
          >
            <div className="rounded-full bg-white/90 px-2 py-1 text-xs text-black font-medium">New</div>
            <p className="text-white sm:text-base text-xs inline-block">
              ✨ Ghost Mode <span className="px-1 font-semibold">now live</span>
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-white">
              <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </TimelineContent>

          {/* Headline */}
          <TimelineContent
            as="h1"
            animationNum={3}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="2xl:text-7xl text-foreground xl:text-6xl sm:text-5xl text-4xl leading-[100%]"
          >
            Build Faster with{" "}
            <span className="font-semibold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Social{" "}
            <span className="font-semibold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Growth
            </span>
          </TimelineContent>

          {/* Subheading */}
          <TimelineContent
            as="p"
            animationNum={4}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="lg:text-xl text-muted-foreground sm:text-lg text-sm max-w-2xl mx-auto"
          >
            Schedule posts, discover trends, and let AI engage your audience — all from one powerful dashboard.
          </TimelineContent>
        </article>

        {/* Feature grid */}
        <div className="grid md:grid-cols-3 grid-cols-2 gap-6 pt-20">
          {blocksDesign.map((component, index) => (
            <TimelineContent
              as="a"
              animationNum={index + 5}
              timelineRef={timelineRef}
              key={component.id}
              href={component.url}
              className="transition-all aspect-video rounded-lg backdrop-blur-sm overflow-hidden relative block"
            >
              <figure className="relative h-full w-full">
                <img
                  src={component.imgSrc}
                  alt={component.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </figure>
              <ProgressiveBlur
                className="pointer-events-none absolute bottom-0 left-0 h-[25%] w-full"
                blurIntensity={0.5}
              />
              <div className="sm:py-2 py-1 sm:px-4 px-2 absolute bottom-2 left-2">
                <h2 className="2xl:text-xl xl:text-xl md:text-lg text-sm font-medium leading-[140%] capitalize text-white">
                  {component.name}
                </h2>
              </div>
            </TimelineContent>
          ))}
        </div>
      </div>
    </main>
  );
}

export default SociallyHeroShowcase;

/* ── Feature Showcase Grid ── exported for use in landing page ── */
export function FeatureShowcaseGrid() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section ref={ref} className="py-20 px-4" id="showcase">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Dashboard Preview
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything in{" "}
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
              one place
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
            Six powerful tools. One dashboard. Zero context-switching.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-3 grid-cols-2 gap-4 sm:gap-5">
          {blocksDesign.map((component, index) => (
            <TimelineContent
              as="a"
              animationNum={index + 1}
              timelineRef={ref}
              key={component.id}
              href={component.url}
              className={cn(
                "aspect-video rounded-xl overflow-hidden relative block group",
                "ring-1 ring-white/5 hover:ring-red-500/30 transition-all duration-300",
                "hover:shadow-lg hover:shadow-red-500/10"
              )}
            >
              <figure className="relative h-full w-full">
                <img
                  src={component.imgSrc}
                  alt={component.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 brightness-75 group-hover:brightness-90"
                />
              </figure>
              <ProgressiveBlur
                className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-full"
                blurIntensity={0.7}
              />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[11px] text-white/60 mb-0.5 leading-tight">{component.des}</p>
                <h3 className="text-sm sm:text-base font-semibold text-white drop-shadow-sm leading-tight">
                  {component.name}
                </h3>
              </div>
              {/* Hover top-right arrow */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </div>
            </TimelineContent>
          ))}
        </div>
      </div>
    </section>
  );
}
