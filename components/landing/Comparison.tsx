"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

type CellValue = boolean | "partial";

const COMPARISON_ROWS: {
  feature: string;
  socially: CellValue;
  buffer: CellValue;
  hootsuite: CellValue;
  taplio: CellValue;
}[] = [
  { feature: "Autonomous commenting agents",      socially: true,      buffer: false,     hootsuite: false,      taplio: "partial" },
  { feature: "Predictive performance scoring",    socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
  { feature: "Revenue attribution (ROI Pulse)",   socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
  { feature: "Trend-to-Draft automation",         socially: true,      buffer: false,     hootsuite: false,      taplio: "partial" },
  { feature: "Self-hosted AI (no per-token fees)",socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
  { feature: "Naira-denominated pricing",         socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
  { feature: "Paystack / Flutterwave payments",   socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
  { feature: "Smart Inbox Triage (lead sorting)", socially: true,      buffer: false,     hootsuite: "partial",  taplio: false     },
  { feature: "Brand voice from URL scrape",       socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
  { feature: "WhatsApp Channels support",         socially: true,      buffer: false,     hootsuite: false,      taplio: false     },
];

function CheckCell({ value, highlight = false }: { value: CellValue; highlight?: boolean }) {
  if (value === true)
    return <Check className={`w-5 h-5 mx-auto ${highlight ? "text-red-400" : "text-green-500"}`} />;
  if (value === "partial")
    return <Minus className="w-5 h-5 mx-auto text-yellow-500 opacity-60" />;
  return <X className="w-4 h-4 mx-auto text-muted-foreground opacity-40" />;
}

export function Comparison() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Why teams{" "}
            <span className="gradient-text">switch to SociallyAI</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We&apos;re not just another social media scheduler. We&apos;re a category upgrade.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground w-[40%]">
                  Feature
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold gradient-text">SociallyAI</span>
                    <span className="text-xs text-muted-foreground">You</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <span className="text-sm font-medium text-muted-foreground">Buffer</span>
                </th>
                <th className="py-4 px-4 text-center">
                  <span className="text-sm font-medium text-muted-foreground">Hootsuite</span>
                </th>
                <th className="py-4 px-4 text-center">
                  <span className="text-sm font-medium text-muted-foreground">Taplio</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-border/50 ${i % 2 === 0 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                >
                  <td className="py-3.5 px-4 text-sm text-foreground">{row.feature}</td>
                  <td className="py-3.5 px-4 text-center bg-red-500/5">
                    <CheckCell value={row.socially} highlight />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CheckCell value={row.buffer} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CheckCell value={row.hootsuite} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <CheckCell value={row.taplio} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground px-4">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> Available
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5 text-yellow-500 opacity-60" /> Partial / limited
            </div>
            <div className="flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-muted-foreground opacity-40" /> Not available
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
