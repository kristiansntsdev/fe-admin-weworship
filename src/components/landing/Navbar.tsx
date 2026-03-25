"use client"

import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-[var(--lp-bg)]/80 backdrop-blur-md border-b border-[var(--lp-glass-border)]"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[var(--lp-primary)] rounded-lg flex items-center justify-center">
          <Music2 className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">WeWorship</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--lp-text-muted)]">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#" className="hover:text-white transition-colors">Community</a>
        <a href="#" className="hover:text-white transition-colors">Support</a>
      </div>
      
      <button className="px-5 py-2.5 bg-[var(--lp-primary)] text-white text-sm font-bold rounded-full hover:scale-105 transition-transform">
        Get the App
      </button>
    </motion.nav>
  );
}
