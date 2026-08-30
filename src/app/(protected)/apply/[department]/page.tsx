"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Loader2, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { ApplyForm } from "@/components/apply-form";
import { StatusBadge } from "@/components/status-badge";
import { CyberPanel } from "@/components/cyber-panel";
import {
  getApplicationsForUser,
  type Application,
} from "@/lib/applications";
import { getDepartment } from "@/lib/departments";
import { getErrorMessage } from "@/lib/errors";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";

export default function ApplyPage() {
  const params = useParams<{ department: string }>();
  const dept = getDepartment(params.department);
  const { user } = useAuth();
  const [existing, setExisting] = useState<Application | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!dept || !user) return;
    let cancelled = false;

    getApplicationsForUser(user.id)
      .then((apps) => {
        if (cancelled) return;
        setExisting(
          apps.find((app) => app.department === dept.slug) ?? null,
        );
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dept, user]);

  if (!dept) {
    notFound();
  }

  const Icon = dept.icon;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-6"
      >
        <Button variant="ghost" size="sm" className="-ml-2 font-mono text-[11px] tracking-widest uppercase" asChild>
          <Link href="/departments">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            return_to_bands
          </Link>
        </Button>
      </motion.div>

      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.08 }}
        className="mb-8 flex items-start gap-4"
      >
        <span
          className={`clip-chevron flex size-12 shrink-0 items-center justify-center bg-gradient-to-br text-white ${dept.gradient}`}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[10px] tracking-widest text-cyan-400">
            [ {dept.code} ] // uplink
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {dept.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {dept.tagline}
          </p>
        </div>
      </motion.header>

      {checking ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Checking your applications…</span>
        </div>
      ) : existing ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <CyberPanel className="px-6 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
              <PartyPopper className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold tracking-tight">
              signal already locked
            </h2>
            <p className="mx-auto mt-2 max-w-sm font-mono text-xs text-muted-foreground">
              {"// one transmission per department — your submission is queued."}
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <StatusBadge status={existing.status} />
              <Button asChild className="font-mono text-xs tracking-widest uppercase">
                <Link href="/departments">return_to_bands</Link>
              </Button>
            </div>
          </CyberPanel>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.16 }}>
          <CyberPanel className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                uplink // {dept.code}
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-emerald-400">
                <span className="status-dot bg-emerald-400" aria-hidden="true" />
                ON AIR
              </span>
            </div>
            <p className="mb-6 font-mono text-xs leading-relaxed text-muted-foreground">
              {dept.description}
            </p>
            <ApplyForm dept={dept} userId={user!.id} />
          </CyberPanel>
        </motion.div>
      )}
    </div>
  );
}