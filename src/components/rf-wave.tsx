function sinePath(
  step = 6,
  amplitude = 34,
  mid = 60,
  width = 600,
  phase = 0,
  cycles = 4,
): string {
  const points: string[] = [];
  for (let x = 0; x <= width; x += step) {
    const y = mid + amplitude * Math.sin((x / width) * Math.PI * 2 * cycles + phase);
    points.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

/**
 * Decorative oscilloscope-style waveform trace (pure SVG, server-safe).
 */
export function WaveTrace({
  className,
  animate = true,
  strokes = 2,
  amplitude = 34,
  cycles = 4,
}: {
  className?: string;
  animate?: boolean;
  strokes?: number;
  amplitude?: number;
  cycles?: number;
}) {
  return (
    <svg
      viewBox="0 0 600 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: strokes }).map((_, i) => (
        <path
          key={i}
          d={sinePath(6, amplitude * (i % 2 === 0 ? 1 : 0.55), 60, 600, i * 1.1, cycles)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={i === 0 ? 0.95 : 0.35}
          strokeWidth={i === 0 ? 1.6 : 1}
          className={animate && i === 0 ? "wave-dash" : undefined}
        />
      ))}
    </svg>
  );
}