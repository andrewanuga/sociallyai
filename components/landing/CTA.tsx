"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, #7c3aed, transparent)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-8">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Free for 14 days — no credit card required
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]">
            Your AI marketing team
            <br />
            <span className="gradient-text">starts today.</span>
          </h2>

          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join 2,000+ creators and businesses in Nigeria and across Africa who
            have stopped posting manually and started delegating to AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/signup">
              <Button variant="gradient" size="xl" className="group w-full sm:w-auto min-w-[220px]">
                Get started free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto min-w-[180px]">
                Sign in to dashboard
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            14-day free trial. Then from{" "}
            <span className="text-foreground font-medium">₦5,000/month</span>.
            Cancel anytime.
            <br />
            Accepts Paystack, Flutterwave, and all Nigerian bank cards.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
