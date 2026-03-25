"use client"

import { motion } from "framer-motion";
import { Share2, Radio, Zap, Users } from "lucide-react";

const features = [
  {
    title: "Live Sync Sharing",
    description: "Lead your team effortlessly. Sync your screen, scroll positions, and song selections across all devices in real-time.",
    icon: <Radio className="w-6 h-6 text-white" />,
    color: "bg-red-500/20 text-red-500",
  },
  {
    title: "Instant Playlist Sharing",
    description: "Generate secure, shareable links for your playlists. Collaborate with your team and keep everyone on the same page.",
    icon: <Share2 className="w-6 h-6 text-white" />,
    color: "bg-blue-500/20 text-blue-500",
  },
  {
    title: "Lightning Fast Collaboration",
    description: "Optimized for performance. Your changes reflect instantly, ensuring a smooth and uninterrupted worship flow.",
    icon: <Zap className="w-6 h-6 text-white" />,
    color: "bg-yellow-500/20 text-yellow-500",
  },
  {
    title: "Team Management",
    description: "Assign roles, manage permissions, and track contributions. Built specifically for worship team dynamics.",
    icon: <Users className="w-6 h-6 text-white" />,
    color: "bg-green-500/20 text-green-500",
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4">Core Features</h2>
        <p className="text-[var(--lp-text-muted)] text-lg font-medium max-w-xl">
          Designed by worship leaders for worship teams. Everything you need to focus on what matters most.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="p-8 rounded-3xl bg-[var(--lp-glass)] border border-[var(--lp-glass-border)] hover:border-[var(--lp-primary)]/50 transition-colors group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[var(--lp-primary)]/10 text-[var(--lp-primary)] group-hover:bg-[var(--lp-primary)] group-hover:text-white transition-all`}>
              {f.icon}
            </div>
            <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
            <p className="text-[var(--lp-text-muted)] leading-relaxed font-medium">
              {f.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
