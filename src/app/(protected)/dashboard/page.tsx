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
import { getQuestionsForDepartment, type Question } from "@/lib/questions";
import { PB_URL } from "@/lib/pocketbase";
import { DEPARTMENTS, DEPARTMENT_LIST } from "@/lib/departments";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getApplicationsForUser(user.id)
      .then((apps) => {
        if (!cancelled) {
          setApplications(apps);
          
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const openId = urlParams.get('open');
            if (openId && apps.some(a => a.id === openId)) {
              setExpandedAppId(openId);
              // Clean up the URL
              window.history.replaceState({}, '', '/dashboard');
            }
          }
        }
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
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <ScrambleText text="YOUR APPLICATIONS" />
          </h1>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            User:
            <span className="text-foreground">
              {" "}
              {user?.reg_number ?? user?.email}
            </span>{" "}
            · Applied:{" "}
            <span className="text-emerald-400">
              {appliedCount}/2
            </span>{" "}
            ·{" "}
            {appliedCount === 0
              ? "No Applications Found"
              : appliedAll
                ? "Limit Reached"
                : "Slots Remaining"}
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
              No Applications Found
            </p>
            <Button asChild className="sheen-btn font-mono text-xs tracking-widest uppercase">
              <Link href="/departments">Apply to a Department</Link>
            </Button>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal className="mb-8">
            <div className="clip-angle cyber-border-static overflow-hidden bg-card/70 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 sm:px-8 sm:py-5">
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Submitted Applications
                </span>
              </div>
              <div className="grid gap-px">
                {applications.map((app) => (
                  <div key={app.id} className="flex flex-col bg-card/70 transition-colors">
                    <button
                      onClick={() => setExpandedAppId((prev) => (prev === app.id ? null : app.id))}
                      className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-white/[0.03] text-left cursor-pointer sm:px-8 sm:py-6"
                    >
                      <span className="font-mono text-base sm:text-lg">
                        {DEPARTMENTS[app.department].name}
                      </span>
                      <div className="flex items-center gap-5">
                        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                          {new Date(app.created).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <StatusBadge status={app.status} />
                      </div>
                    </button>
                    
                    {expandedAppId === app.id && (
                      <ApplicationDetails app={app} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            {appliedCount >= 2 ? (
              <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase opacity-50 cursor-not-allowed">
                Apply to More Departments
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            ) : (
              <Link
                href="/departments"
                className="group inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cyan-400 uppercase transition-colors hover:text-primary"
              >
                Apply to More Departments
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            )}
          </Reveal>
        </>
      )}
    </div>
  );
}

function ApplicationDetails({ app }: { app: Application }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    getQuestionsForDepartment(app.department)
      .then(q => { if (!cancelled) setQuestions(q); })
      .catch(() => { if (!cancelled) setQuestions([]); });
    return () => { cancelled = true; };
  }, [app.department]);

  if (!questions) {
    return <div className="px-5 py-4 text-xs font-mono text-muted-foreground animate-pulse border-t border-white/5 bg-black/20">Loading Data...</div>;
  }

  return (
    <div className="px-5 py-4 border-t border-white/5 bg-black/20">
      <div className="space-y-4">
        {questions.filter(q => q.type !== 'file').map((q) => {
          const answer = app.data[q.key];
          if (!answer && !q.required) return null;
          return (
            <div key={q.key}>
              <p className="text-[10px] font-mono tracking-widest text-cyan-400 mb-1 uppercase">{q.label}</p>
              <p className="text-sm font-mono whitespace-pre-wrap text-foreground/90">{String(answer || "N/A")}</p>
            </div>
          )
        })}
        {app.portfolio_asset && (
          <div>
            <p className="text-[10px] font-mono tracking-widest text-cyan-400 mb-1 uppercase">Portfolio Asset</p>
            <a 
              href={`${PB_URL}/api/files/applications/${app.id}/${app.portfolio_asset}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-mono text-emerald-400 hover:underline"
            >
              View Attachment
            </a>
          </div>
        )}
      </div>
    </div>
  );
}