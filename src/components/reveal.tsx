"use client";

import { motion, type Variants } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";
import type { ReactNode } from "react";

function withDelay(variants: Variants, delay: number): Variants {
  if (!delay) return variants;
  const show = variants.show as
    | ({ transition?: Record<string, unknown> } & Record<string, unknown>)
    | undefined;
  return {
    ...variants,
    show: {
      ...show,
      transition: { ...(show?.transition ?? {}), delay },
    },
  } as Variants;
}

export function Reveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={withDelay(variants, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}