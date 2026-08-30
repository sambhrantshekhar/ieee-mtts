"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*<>/\\{}";

export function ScrambleText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const started = useRef(false);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    let frame = 0;
    let interval: ReturnType<typeof setInterval>;
    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        frame += 1;
        setDisplay(
          text
            .split("")
            .map((ch, i) =>
              ch === " "
                ? " "
                : frame > i + 7
                  ? ch
                  : CHARS[Math.floor(Math.random() * CHARS.length)],
            )
            .join(""),
        );

        if (frame > text.length + 7) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, 22);
    }, delay * 1000);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [inView, text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {display}
    </span>
  );
}