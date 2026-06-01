
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, noHover = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={noHover ? {} : { y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "glass-card p-6 border border-white/10 overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
