import type { Variants } from "framer-motion";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const scaleClip: Variants = {
  hidden: { opacity: 0, scale: 0.94, clipPath: "inset(14% 8% 14% 8% round 6px)" },
  show: {
    opacity: 1,
    scale: 1,
    clipPath: "inset(0% 0% 0% 0% round 6px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;