"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { getErrorMessage } from "@/lib/errors";
import { CyberPanel } from "@/components/cyber-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { logIn } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      await logIn(values.email, values.password);
      toast.success("Access granted. Welcome back!");
      router.push("/departments");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <CyberPanel className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
          auth://login
        </span>
      </div>

      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Log in
      </h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {"// authenticate with your credentials"}
      </p>

      <div className="mt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[11px] tracking-widest uppercase">
                    email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@university.edu"
                      autoComplete="email"
                      className="bg-white/[0.03] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[11px] tracking-widest uppercase">
                    password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="bg-white/[0.03] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="sheen-btn mt-2 font-mono text-xs tracking-widest uppercase shadow-[0_0_24px_-8px] shadow-cyan-500/60"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              authenticate
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          no access token yet?{" "}
          <Link
            href="/auth/signup"
            className="font-medium tracking-widest text-cyan-400 uppercase hover:underline"
          >
            register
          </Link>
        </p>
      </div>
    </CyberPanel>
  );
}