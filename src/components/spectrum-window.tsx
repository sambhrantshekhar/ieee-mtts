"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { WaveTrace } from "@/components/rf-wave";

const READOUTS = [
  { k: "carrier", v: "10.000 GHz", tone: "text-cyan-300" },
  { k: "signal", v: "-42.3 dBm", tone: "text-emerald-300" },
  { k: "wavelength", v: "3.00 cm", tone: "text-amber-300" },
  { k: "band", v: "X-BAND", tone: "text-cyan-300" },
];

const CHANNELS = ["TCH", "DSN", "MGT", "SOC"];

const BARS = [0.9, 0.6, 1, 0.7, 0.5, 0.85, 1, 0.65, 0.75, 0.95, 0.55, 0.8, 0.9, 0.7, 0.6, 0.85, 1, 0.6, 0.75, 0.9];

export function SpectrumWindow() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="clip-angle cyber-border bg-card/80 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
          mtts://spectrum — x-band
        </span>
      </div>

      {/* Oscilloscope trace + spectrum bars */}
      <div className="trace-grid relative overflow-hidden px-5 pt-4">
        <WaveTrace className="h-20 w-full text-emerald-400/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
        <div
          className="scope-sweep absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/70 to-transparent"
          aria-hidden="true"
        />
        <div className="mt-3 flex h-10 items-end gap-[3px]" aria-hidden="true">
          {BARS.map((height, i) => (
            <span
              key={i}
              className="spec-bar w-full flex-1 rounded-t-[1px] bg-gradient-to-t from-emerald-500/20 to-emerald-400/80"
              style={
                {
                  "--h": height,
                  animationDelay: `${(i % 7) * 0.09}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* RF readouts */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4"
      >
        {READOUTS.map((readout) => (
          <motion.div
            key={readout.k}
            variants={fadeUp}
            className="flex items-center justify-between gap-3 font-mono text-[11px]"
          >
            <span className="text-muted-foreground">{readout.k}</span>
            <span className={readout.tone}>{readout.v}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Channel status */}
      <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
        {CHANNELS.map((code) => (
          <span
            key={code}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest"
          >
            <span className="status-dot bg-emerald-400" aria-hidden="true" />
            <span className="text-foreground">{code}</span>
            <span className="text-emerald-400/70">OPEN</span>
          </span>
        ))}
      </div>
    </motion.div>
  );
}