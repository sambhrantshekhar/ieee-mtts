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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Enter a valid email address.")
      .refine((val) => val.endsWith("@vitstudent.ac.in"), "Only @vitstudent.ac.in emails are allowed."),
    regNumber: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "Registration number is required.")
      .regex(
        /^[0-9]{2}[A-Z]{3}[0-9]{4}$/,
        "Use your university format, e.g. 24BLC1308.",
      ),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    passwordConfirm: z.string().min(1, "Please confirm your password."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordConfirm"],
        message: "Passwords do not match.",
      });
    }
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      regNumber: "",
      phone: "",
      password: "",
      passwordConfirm: "",
    },
  });

  async function onSubmit(values: SignUpValues) {
    try {
      await signUp(values);
      toast.success("Access token issued. Welcome aboard!");
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
          auth://register
        </span>
      </div>

      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {"// one token to apply to any department"}
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
                      placeholder="you@vitstudent.ac.in"
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
              name="regNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[11px] tracking-widest uppercase">
                    Registration Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="24BLC1308"
                      autoComplete="username"
                      className="bg-white/[0.03] font-mono text-sm uppercase"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[11px] tracking-widest uppercase">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      className="bg-white/[0.03] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
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
                        placeholder="min 8 chars"
                        autoComplete="new-password"
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
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[11px] tracking-widest uppercase">
                      confirm
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="repeat"
                        autoComplete="new-password"
                        className="bg-white/[0.03] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="sheen-btn mt-2 font-mono text-xs tracking-widest uppercase shadow-[0_0_24px_-8px] shadow-cyan-500/60"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Create Account
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          already identified?{" "}
          <Link
            href="/auth/login"
            className="font-medium tracking-widest text-cyan-400 uppercase hover:underline"
          >
            log in
          </Link>
        </p>
      </div>
    </CyberPanel>
  );
}