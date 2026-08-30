"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logOut();
    toast.success("Session terminated. See you soon!");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={user ? "/departments" : "/"}
          className="group flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight"
        >
          <span className="clip-angle flex size-8 items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 text-primary-foreground transition-transform group-hover:rotate-6">
            <Cpu className="size-4" aria-hidden="true" />
          </span>
          <span className="flex items-baseline gap-2">
            IEEE MTT-S
            <span className="hidden font-mono text-[10px] tracking-widest text-cyan-400/80 sm:inline">
              {"//MTTS"}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5">
          {user ? (
            <>
              <span className="hidden items-center gap-2 font-mono text-[11px] text-muted-foreground md:flex">
                <UserRound className="size-3.5 text-cyan-400" aria-hidden="true" />
                {user.reg_number ?? user.email}
              </span>
              <Link
                href="/departments"
                className={cn(
                  "hidden font-mono text-xs tracking-widest uppercase transition-colors hover:text-primary sm:inline",
                  pathname === "/departments" ? "text-primary" : "text-muted-foreground",
                )}
              >
                bands
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "hidden font-mono text-xs tracking-widest uppercase transition-colors hover:text-primary sm:inline",
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
                )}
              >
                status
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="font-mono text-xs tracking-widest uppercase"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "font-mono text-xs tracking-widest uppercase",
                  pathname === "/auth/login" && "text-primary",
                )}
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="sheen-btn font-mono text-xs tracking-widest uppercase shadow-[0_0_20px_-6px] shadow-cyan-500/50"
              >
                <Link href="/auth/signup">Apply now</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}