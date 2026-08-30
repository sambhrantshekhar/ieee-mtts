import Link from "next/link";
import { Cpu } from "lucide-react";
import { WaveTrace } from "@/components/rf-wave";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden opacity-[0.12]"
        aria-hidden="true"
      >
        <WaveTrace className="h-full w-full text-emerald-400" cycles={5} />
      </div>
      <Link
        href="/"
        className="group mb-8 flex items-center gap-2.5 font-heading text-xl font-bold tracking-tight"
      >
        <span className="clip-angle flex size-9 items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 text-primary-foreground transition-transform group-hover:rotate-6">
          <Cpu className="size-5" aria-hidden="true" />
        </span>
        <span className="flex items-baseline gap-2">
          IEEE MTT-S
          <span className="hidden font-mono text-[10px] tracking-widest text-cyan-400/80 sm:inline">
            {"//ACCESS"}
          </span>
        </span>
      </Link>

      <p className="mb-6 font-mono text-[11px] tracking-widest text-muted-foreground">
        <span className="text-cyan-400">&gt;</span> restricted_zone — identify
        to continue
      </p>

      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}