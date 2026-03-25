"use client"

import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="landing-theme overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      
      <footer className="py-12 border-t border-[var(--lp-glass-border)] text-center">
        <p className="text-[var(--lp-text-muted)] text-sm">
          &copy; {new Date().getFullYear()} WeWorship. Elevate Your Worship Experience.
        </p>
      </footer>
    </div>
  );
}
