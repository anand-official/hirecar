"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface MotionScrollProps {
  children: ReactNode;
  className?: string;
  variant?: "fade-up" | "scale-in" | "stagger-container" | "stagger-item";
  delay?: number;
}

export function MotionScroll({ 
  children, 
  className = "", 
  variant = "fade-up",
  delay = 0 
}: MotionScrollProps) {
  
  const variants: Record<string, Variants> = {
    "fade-up": {
      hidden: { opacity: 0, y: 40 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1], // Custom snappy easing
          delay 
        } 
      }
    },
    "scale-in": {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1],
          delay 
        } 
      }
    },
    "stagger-container": {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: delay
        }
      }
    },
    "stagger-item": {
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}
