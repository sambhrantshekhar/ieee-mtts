"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { getDepartment, type DepartmentSlug } from "@/lib/departments";
import type { Application } from "@/lib/applications";
import { StatusBadge } from "@/components/status-badge";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface DepartmentCardProps {
  slug: DepartmentSlug;
  href: string;
  ctaLabel: string;
  applied?: Application | null;
}

export function DepartmentCard({
  slug,
  href,
  ctaLabel,
  applied,
}: DepartmentCardProps) {
  const dept = getDepartment(slug);
  if (!dept) return null;

  const Icon = dept.icon;

  const content = (
    <div
      className={cn(
        "clip-angle group relative flex h-full w-full flex-col justify-between overflow-hidden bg-card/80 p-6 backdrop-blur-md sm:p-8",
        applied ? "cyber-border-static" : "cyber-border",
      )}
    >
      {/* Giant wireframe dept code watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-4 select-none font-heading text-8xl font-bold leading-none text-transparent sm:text-9xl"
        style={{ WebkitTextStroke: "1px rgba(34,211,238,0.14)" }}
      >
        {dept.code}
      </span>

      {/* Hover scan */}
      <div className="dept-scanline pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <span
          className={cn(
            "clip-chevron flex size-14 items-center justify-center bg-gradient-to-br text-white shadow-[0_0_24px_-6px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110",
            dept.gradient,
          )}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <span className="font-mono text-[10px] tracking-widest text-cyan-400/80">
          [ {dept.code} ]
        </span>
      </div>

      <div className="relative mt-auto pt-12">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {dept.name}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {dept.description}
        </p>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
        {applied ? (
          <div className="flex flex-col items-start gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-emerald-400">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              SUBMITTED
            </span>
            <StatusBadge status={applied.status} />
          </div>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-emerald-400/90">
            <span className="status-dot bg-emerald-400" aria-hidden="true" />
            OPEN
          </span>
        )}

        {!applied && (
          <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase transition-colors group-hover:text-primary">
            {ctaLabel}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="h-full"
    >
      {applied ? (
        content
      ) : (
        <Link href={href} className="block h-full">
          {content}
        </Link>
      )}
    </motion.div>
  );
}