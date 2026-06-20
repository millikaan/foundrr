"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Extra classes applied to the wrapper. */
  className?: string;
  /** Render as a different element (defaults to div). */
  as?: "div" | "section" | "li" | "span";
}

const DISTANCE = 18;

/**
 * Restrained section reveal: a small fade + upward translate that fires once
 * when the element scrolls into view. Nothing bouncy — a single soft ease.
 * Fully disabled under prefers-reduced-motion (content renders in place).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : DISTANCE },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
    >
      {children}
    </MotionTag>
  );
}
