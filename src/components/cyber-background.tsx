"use client";

import { useEffect, useRef, useState } from "react";
import { WaveTrace } from "@/components/rf-wave";

export function CyberBackground() {
  const [pos, setPos] = useState({ x: -600, y: -600 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPos({ x: event.clientX, y: event.clientY });
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      aria-hidden="true"
    >
      {/* Animated mesh gradients */}
      <div className="mesh-blob absolute -top-48 -left-40 size-[38rem] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div
        className="mesh-blob absolute -right-40 top-1/4 size-[34rem] rounded-full bg-emerald-500/15 blur-[120px]"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="mesh-blob absolute bottom-0 left-1/3 size-[30rem] rounded-full bg-amber-500/10 blur-[120px]"
        style={{ animationDelay: "-14s" }}
      />

      {/* Cursor spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(640px circle at ${pos.x}px ${pos.y}px, rgba(34,211,238,0.07), transparent 65%)`,
        }}
      />

      {/* Grid floor */}
      <div className="cyber-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_78%)]" />

      {/* Faint RF waveform traces */}
      <div className="absolute inset-x-0 bottom-0 opacity-[0.13]">
        <WaveTrace className="h-32 w-full text-emerald-400" cycles={5} />
      </div>
      <div className="absolute inset-x-0 bottom-24 opacity-[0.07]">
        <WaveTrace className="h-24 w-full text-cyan-400" cycles={7} amplitude={20} />
      </div>

      {/* Scanlines + noise */}
      <div className="scanlines absolute inset-0" />
      <div className="noise-overlay absolute inset-0 opacity-[0.035]" />
    </div>
  );
}