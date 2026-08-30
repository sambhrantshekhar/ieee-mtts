"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { StatusBadge } from "@/components/status-badge";
import { Reveal } from "@/components/reveal";
import { ScrambleText } from "@/components/scramble-text";
import {
  getApplicationsForUser,
  type Application,
} from "@/lib/applications";
import { DEPARTMENTS, DEPARTMENT_LIST } from "@/lib/departments";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getApplicationsForUser(user.id)
      .then((apps) => {
        if (!cancelled) setApplications(apps);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        if (!cancelled) setApplications([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const appliedCount = applications?.length ?? 0;
  const appliedAll = appliedCount >= DEPARTMENT_LIST.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <Reveal>
          <p className="font-mono text-[11px] tracking-widest text-cyan-400">
            &gt; transmission_status
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <ScrambleText text="SIGNAL MONITOR" />
          </h1>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            <span className="text-cyan-400">{"//"}</span> user:
            <span className="text-foreground">
              {" "}
              {user?.reg_number ?? user?.email}
            </span>{" "}
            · tuned:{" "}
            <span className="text-emerald-400">
              {appliedCount}/{DEPARTMENT_LIST.length}
            </span>{" "}
            ·{" "}
            {appliedCount === 0
              ? "no_channels_tuned"
              : appliedAll
                ? "all_bands_engaged"
                : "slots_remaining"}
          </p>
        </Reveal>
      </header>

      {applications === null ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading status…</span>
        </div>
      ) : appliedCount === 0 ? (
        <Reveal>
          <div className="flex flex-col items-center gap-5 rounded-sm border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              no_transmissions_found
            </p>
            <Button asChild className="sheen-btn font-mono text-xs tracking-widest uppercase">
              <Link href="/departments">tune_into_a_band</Link>
            </Button>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal className="mb-8">
            <div className="clip-angle cyber-border-static overflow-hidden bg-card/70 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  rf_status // tuned_channels
                </span>
                <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-emerald-400">
                  <span className="status-dot bg-emerald-400" aria-hidden="true" />
                  ON AIR
                </span>
              </div>
              <div className="grid gap-px">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="font-mono text-sm">
                      <span className="text-cyan-400">[</span>
                      {DEPARTMENTS[app.department].code}
                      <span className="text-cyan-400">]</span>{" "}
                      {DEPARTMENTS[app.department].name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                        {new Date(app.created).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {!appliedAll && (
            <Reveal>
              <Link
                href="/departments"
                className="group inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase transition-colors hover:text-primary"
              >
                tune_more_bands
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          )}
        </>
      )}
    </div>
  );
}