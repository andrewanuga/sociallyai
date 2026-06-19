"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring" as const, bounce: 0.3, duration: 1.5 },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <section className="overflow-hidden">
        {/* Decorative gradient blobs — red-tinted */}
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-60 contain-strict hidden lg:block"
        >
          <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(220,38,38,0.14)_0,rgba(185,28,28,0.04)_50%,transparent_80%)]" />
          <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(239,68,68,0.10)_0,rgba(185,28,28,0.03)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(244,63,94,0.08)_0,rgba(190,18,60,0.02)_80%,transparent_100%)]" />
        </div>

        <section>
          <div className="relative pt-24 md:pt-36">
            {/* Red ambient glow — top-centre */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 w-[700px] h-[420px] blur-[120px] rounded-full opacity-[0.18] dark:opacity-[0.25]"
              style={{ background: "radial-gradient(ellipse at top, #dc2626 0%, #7f1d1d 55%, transparent 100%)" }}
            />

            {/* Background image (dark mode only) */}
            <AnimatedGroup
              variants={{
                container: { visible: { transition: { delayChildren: 1 } } },
                item: {
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1, y: 0,
                    transition: { type: "spring" as const, bounce: 0.3, duration: 2 },
                  },
                },
              }}
              className="absolute inset-0 -z-20"
            >
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3276&auto=format&fit=crop"
                alt="background"
                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block w-full object-cover opacity-20"
                width="3276"
                height="4095"
              />
            </AnimatedGroup>

            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  {/* Announcement badge — branded red pill */}
                  <Link
                    href="#"
                    className="group mx-auto flex w-fit items-center gap-3 rounded-full border border-red-500/25 bg-red-500/[0.07] px-4 py-2 shadow-lg shadow-red-500/10 backdrop-blur-sm transition-all duration-300 hover:border-red-400/45 hover:bg-red-500/[0.13] hover:shadow-red-500/20"
                  >
                    <span className="flex items-center gap-2 text-sm text-red-300/90">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                      Introducing AI-Powered Ghost Mode for Creators
                    </span>
                    <span className="block h-4 w-px bg-red-500/30" />
                    <span className="flex items-center gap-1 text-xs font-medium text-red-400 transition-all duration-300 group-hover:gap-1.5">
                      Explore <ArrowRight className="size-3" />
                    </span>
                  </Link>

                  <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl font-bold md:text-7xl lg:mt-16 xl:text-[5.25rem] tracking-tight">
                    Social Media on{" "}
                    <span className="gradient-text-animated">Autopilot</span>
                    {" "}with AI
                  </h1>
                  <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                    Schedule posts, analyse trends, and let AI generate content that sounds exactly like you — for every platform.
                  </p>
                </AnimatedGroup>

                {/* CTA buttons */}
                <AnimatedGroup
                  variants={{
                    container: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } } },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
                >
                  <Button key={1} asChild variant="gradient" size="lg" className="rounded-xl px-7 text-base shadow-xl shadow-red-600/30">
                    <Link href="/signup">
                      <span className="text-nowrap">Start Free Trial</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button key={2} asChild size="lg" variant="outline" className="rounded-xl px-7 text-base border-border/60 hover:border-red-500/30 hover:text-foreground">
                    <Link href="#how-it-works">
                      <span className="text-nowrap">See how it works</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            {/* Dashboard preview */}
            <AnimatedGroup
              variants={{
                container: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } } },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-red-500/15 p-4 shadow-2xl shadow-red-500/10 ring-1 ring-red-500/10">
                  <img
                    className="bg-background aspect-[15/8] relative hidden rounded-2xl dark:block"
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2715&auto=format&fit=crop"
                    alt="SociallyAI dashboard dark"
                    width="2700"
                    height="1440"
                  />
                  <img
                    className="border-border/25 aspect-[15/8] relative rounded-2xl border dark:hidden"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
                    alt="SociallyAI dashboard light"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* Social proof logos */}
        <div className="bg-background pb-16 pt-8 md:pb-32">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/50 mb-6">
            Trusted by fast-growing brands
          </p>
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link href="/" className="block text-sm duration-150 hover:opacity-75">
                <span>Meet Our Customers</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="group-hover:blur-xs mx-auto grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
              {[
                { src: "https://html.tailus.io/blocks/customers/nvidia.svg",       alt: "Nvidia",      h: "h-5" },
                { src: "https://html.tailus.io/blocks/customers/column.svg",       alt: "Column",      h: "h-4" },
                { src: "https://html.tailus.io/blocks/customers/github.svg",       alt: "GitHub",      h: "h-4" },
                { src: "https://html.tailus.io/blocks/customers/nike.svg",         alt: "Nike",        h: "h-5" },
                { src: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg", alt: "LemonSqueezy",h: "h-5" },
                { src: "https://html.tailus.io/blocks/customers/laravel.svg",      alt: "Laravel",     h: "h-4" },
                { src: "https://html.tailus.io/blocks/customers/lilly.svg",        alt: "Lilly",       h: "h-7" },
                { src: "https://html.tailus.io/blocks/customers/openai.svg",       alt: "OpenAI",      h: "h-6" },
              ].map(({ src, alt, h }) => (
                <div key={alt} className="flex">
                  <img className={`mx-auto ${h} w-fit dark:invert`} src={src} alt={`${alt} Logo`} height="20" width="auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Navigation ─────────────────────────────────────────────────────── */
const menuItems = [
  { name: "Features",    href: "#features"    },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing",     href: "#pricing"     },
  { name: "ROI Pulse",   href: "#roi-pulse"   },
];

const HeroHeader = () => {
  const [menuState,  setMenuState]  = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed z-20 w-full px-2 group">
        <div className={cn(
          "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
          isScrolled && "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
        )}>
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">

            {/* Logo */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <SociallyLogo />
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            {/* Desktop nav */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Auth buttons */}
            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm" className={cn(isScrolled && "lg:hidden")}>
                  <Link href="/login"><span>Login</span></Link>
                </Button>
                <Button asChild size="sm" className={cn(isScrolled && "lg:hidden")}>
                  <Link href="/signup"><span>Sign Up</span></Link>
                </Button>
                <Button asChild size="sm" className={cn(isScrolled ? "lg:inline-flex" : "hidden")}>
                  <Link href="/signup"><span>Get Started</span></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

/* ── Brand logo ─────────────────────────────────────────────────────── */
const SociallyLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-md shadow-red-600/30">
      <span className="text-white text-xs font-black">S</span>
    </div>
    <span className="font-bold text-base tracking-tight">SociallyAI</span>
  </div>
);
