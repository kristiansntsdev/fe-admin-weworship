"use client"

import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--lp-primary)]/10 blur-[120px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
          Elevate Your <span className="text-[var(--lp-primary)]">Worship</span> Experience
        </h1>
        <p className="text-[var(--lp-text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The all-in-one platform for worship teams. Sync, share, and lead with confidence using our state-of-the-art live collaboration tools.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button className="w-full sm:w-auto px-8 py-4 bg-[var(--lp-primary)] text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(150,0,1,0.3)] transition-all">
            Start Live Session
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-[var(--lp-glass-border)] text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
            Watch Demo
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative w-full max-w-3xl aspect-[16/10] sm:aspect-[4/3] md:aspect-[16/9]"
      >
        <Image 
          src="/images/mockup.png" 
          alt="WeWorship iPhone Mockup"
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </section>
  );
}
