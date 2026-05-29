"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Adaeze Okonkwo",
    role: "Fintech Founder, Lagos",
    avatar: "AO",
    rating: 5,
    text: "I replaced Buffer and a freelance social media manager with SociallyAI. The Ghost Mode agent handles all the basic engagement while I focus on closing deals. ROI in week one.",
    highlight: "Replaced a freelance SM manager",
  },
  {
    name: "Chukwuemeka Dike",
    role: "Digital Agency, Abuja",
    avatar: "CD",
    rating: 5,
    text: "Managing 8 client accounts used to need 3 people. Now it's me and the AI. The Smart Inbox Triage alone saves 2 hours a day of reading through comments to find real leads.",
    highlight: "Manages 8 clients solo",
  },
  {
    name: "Fatima Al-Hassan",
    role: "E-commerce Brand, Kano",
    avatar: "FA",
    rating: 5,
    text: "The ROI Pulse feature is crazy. I can literally show my husband 'this Instagram post made us ₦340,000 this week.' He stopped questioning the marketing budget immediately.",
    highlight: "₦340k attributed to one post",
  },
  {
    name: "Tunde Fashola",
    role: "Personal Brand Coach, Lagos",
    avatar: "TF",
    rating: 5,
    text: "The Trend-to-Draft engine is like having a ghostwriter who never sleeps. It caught the ChatGPT news cycle before I even woke up and had 3 drafts waiting for me to approve.",
    highlight: "Trend content before it peaks",
  },
  {
    name: "Ngozi Eze",
    role: "Fashion Influencer, Port Harcourt",
    avatar: "NE",
    rating: 5,
    text: "I was skeptical about AI sounding like me but the Brand Voice feature is genuinely impressive. My followers can't tell the difference. My engagement went up 3x.",
    highlight: "3x engagement boost",
  },
  {
    name: "Biodun Afolabi",
    role: "SaaS Founder, Lagos",
    avatar: "BA",
    rating: 5,
    text: "As a developer I appreciate that they self-host Gemma. Means my content data doesn't go to OpenAI or Google. Plus the pricing makes sense for a Nigeria-based startup.",
    highlight: "Privacy-first architecture",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Creators &amp; businesses
            <br />
            <span className="gradient-text">love SociallyAI</span>
          </h2>
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-red-500 fill-red-500" />
            ))}
            <span className="ml-2 text-muted-foreground">
              4.9/5 average rating
            </span>
          </div>
        </motion.div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="break-inside-avoid p-6 rounded-2xl border border-border bg-card hover:border-red-500/25 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-200"
            >
              {/* Quote icon */}
              <Quote className="w-6 h-6 text-red-400/35 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Highlight badge */}
              <div className="mb-4 inline-block px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                {t.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
