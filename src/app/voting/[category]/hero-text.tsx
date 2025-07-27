"use client";

import { motion } from "motion/react";


export default function HeroTextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className=""
      initial={{ opacity: 0 }} // Initial state: invisible
      animate={{ opacity: 1 }} // Target state: fully visible
      transition={{
        delay: 0,        // 5 seconds delay before the animation starts
        duration: 0.5,     // 1 second duration for the fade-in animation
        ease: "easeOut"  // Easing function for a smooth fade
      }}
    >
      {children}
    </motion.div>
  )
}