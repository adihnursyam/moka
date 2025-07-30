"use client";

import { motion } from "motion/react";


export default function HeroTextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0,
        duration: 0.5,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}