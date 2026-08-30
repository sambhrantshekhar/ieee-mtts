import type { ApplicationStatus } from "@/lib/departments";

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; dot: string; text: string }
> = {
  pending: {
    label: "PENDING",
    dot: "bg-amber-400",
    text: "text-amber-300",
  },
  reviewed: {
    label: "REVIEWING",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
  },
  accepted: {
    label: "ACCEPTED",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
  rejected: {
    label: "REJECTED",
    dot: "bg-rose-400",
    text: "text-rose-300",
  },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] tracking-widest ${meta.text}`}
    >
      <span className={`status-dot ${meta.dot}`} aria-hidden="true" />
      {meta.label}
      <span className="sr-only">{status}</span>
    </span>
  );
}