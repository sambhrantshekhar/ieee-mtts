import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Reveal } from "@/components/reveal";
import { ScrambleText } from "@/components/scramble-text";
import { MagneticButton } from "@/components/magnetic-button";
import { SpectrumWindow } from "@/components/spectrum-window";

const STATS = [
  { value: "04", label: "channels" },
  { value: "100%", label: "student-run" },
  { value: "<5m", label: "to apply" },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="flex flex-1 flex-col">
        <section className="relative flex min-h-screen w-full items-center">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-sm border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 font-mono text-[11px] tracking-widest text-cyan-300">
                  IEEE MTT-S
                </p>
              </Reveal>

              <Reveal>
                <h1 className="mt-6 font-heading text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
                  <ScrambleText text="TUNE. BUILD." />
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent text-glow">
                    <ScrambleText text="LEAD. CONNECT." delay={0.5} />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.2} className="mt-4">
                <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
                  Electronics,
                  microwaves, and technology. Four departments, one chapter — find
                  your fit and apply in under five minutes.
                </p>
              </Reveal>

              <Reveal delay={0.3} className="mt-6">
                <div className="flex flex-col items-start gap-3 sm:flex-row">
                  <MagneticButton
                    size="lg"
                    asChild
                    className="sheen-btn font-mono text-xs tracking-widest uppercase shadow-[0_0_28px_-6px] shadow-cyan-500/60"
                  >
                    <Link href="/auth/signup">
                      Apply Now
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton
                    size="lg"
                    variant="outline"
                    asChild
                    className="font-mono text-xs tracking-widest uppercase"
                  >
                    <Link href="/departments">Explore Departments</Link>
                  </MagneticButton>
                </div>
              </Reveal>

              <Reveal delay={0.4} className="mt-8">
                <dl className="flex max-w-md items-center divide-x divide-white/10 border-y border-white/10 py-4">
                  {STATS.map((stat, i) => (
                    <div key={stat.label} className={i === 0 ? "pr-6" : "px-6"}>
                      <dd className="font-heading text-2xl font-bold text-cyan-400">
                        {stat.value}
                      </dd>
                      <dt className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-6 -z-10 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 blur-2xl"
                aria-hidden="true"
              />
              <SpectrumWindow />
            </div>
          </div>
        </section>

        <section id="contact" className="w-full border-t border-white/10 bg-black/20">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Got questions or issues?
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
                Whether you want to learn more about the chapter, our projects, or need help with your application, our team is here for you. Reach out to us directly!
              </p>
            </Reveal>
            <div className="mt-6 flex flex-col items-center gap-4">
              <a 
                href="mailto:contact@ieeemttsvitc.tech" 
                className="group relative inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-400/5 px-6 py-3 font-mono text-sm text-cyan-300 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                </span>
                Mail: contact@ieeemttsvitc.tech
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}