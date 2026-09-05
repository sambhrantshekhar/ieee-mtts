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
  const appliedAll = appliedCount >= 2;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            <ScrambleText text="SELECT YOUR DEPARTMENT" />
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-sm text-muted-foreground">
          <span>
            User: <span className="text-foreground">{user?.reg_number ?? user?.email}</span>
          </span>
          <span>
            Applied:{" "}
            <span className="text-emerald-400">
              {appliedCount}/2
            </span>
          </span>
          {appliedCount > 0 && (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 text-cyan-400 uppercase transition-colors hover:text-primary"
            >
              <Activity className="size-4" aria-hidden="true" />
              {appliedAll ? "Status" : "View Status"}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
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
          <div className="mx-auto grid w-full max-w-6xl auto-rows-[minmax(340px,auto)] grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
            {DEPARTMENT_LIST.map((dept) => (
              <DepartmentCard
                key={dept.slug}
                slug={dept.slug}
                href={`/apply/${dept.slug}`}
                ctaLabel="Apply"
                applied={byDepartment.get(dept.slug) ?? null}
                limitReached={appliedAll}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}