"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { DepartmentCard } from "@/components/department-card";
import { ScrambleText } from "@/components/scramble-text";
import {
  getApplicationsForUser,
  type Application,
} from "@/lib/applications";
import { DEPARTMENT_LIST } from "@/lib/departments";
import { getErrorMessage } from "@/lib/errors";

export default function DepartmentsPage() {
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

  const byDepartment = new Map(
    applications?.map((app) => [app.department, app]) ?? [],
  );
  const appliedCount = applications?.length ?? 0;
  const appliedAll = appliedCount >= DEPARTMENT_LIST.length;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-cyan-400">
            &gt; band_selection
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            <ScrambleText text="SELECT YOUR BAND" />
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span>
            user: <span className="text-foreground">{user?.reg_number ?? user?.email}</span>
          </span>
          <span>
            tuned:{" "}
            <span className="text-emerald-400">
              {appliedCount}/{DEPARTMENT_LIST.length}
            </span>
          </span>
          {appliedCount > 0 && (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 text-cyan-400 uppercase transition-colors hover:text-primary"
            >
              <Activity className="size-3.5" aria-hidden="true" />
              {appliedAll ? "status" : "view status"}
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </header>

      {applications === null ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading channels…</span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center px-4 pb-4 sm:px-6">
          <div className="mx-auto grid w-full max-w-6xl auto-rows-[minmax(340px,auto)] grid-cols-1 gap-px bg-border/40 sm:grid-cols-2">
            {DEPARTMENT_LIST.map((dept) => (
              <DepartmentCard
                key={dept.slug}
                slug={dept.slug}
                href={`/apply/${dept.slug}`}
                ctaLabel="apply"
                applied={byDepartment.get(dept.slug) ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}