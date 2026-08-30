"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { submitApplication } from "@/lib/applications";
import { getErrorMessage } from "@/lib/errors";
import { EASE } from "@/lib/motion";
import {
  getQuestionsForDepartment,
  type Question,
} from "@/lib/questions";
import type { DepartmentConfig } from "@/lib/departments";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function questionToZod(question: Question): z.ZodType {
  if (question.type === "file") return z.undefined();

  const requiredMessage = `${question.label} is required.`;
  let field: z.ZodType = question.required
    ? z.string().min(1, requiredMessage)
    : z.string().optional();

  if (question.type === "url") {
    field = field.refine(
      (value) => !value || /^https?:\/\/\S+$/.test(value as string),
      "Enter a valid URL (https://…).",
    );
  }

  if (question.type === "select" && question.required) {
    field = z.string().min(1, requiredMessage);
  }

  const minLength = question.min_length ?? 0;
  if (
    (question.type === "text" || question.type === "textarea") &&
    minLength > 0
  ) {
    field = field.refine(
      (value) => !value || (value as string).trim().length >= minLength,
      `Give a bit more detail — at least ${minLength} characters.`,
    );
  }

  return field;
}

export function ApplyForm({
  dept,
  userId,
}: {
  dept: DepartmentConfig;
  userId: string;
}) {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getQuestionsForDepartment(dept.slug)
      .then((fetched) => {
        if (!cancelled) setQuestions(fetched);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        if (!cancelled) setQuestions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [dept.slug]);

  if (questions === null) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading questions…</span>
      </div>
    );
  }

  return <QuestionForm questions={questions} dept={dept} userId={userId} />;
}

function QuestionForm({
  questions,
  dept,
  userId,
}: {
  questions: Question[];
  dept: DepartmentConfig;
  userId: string;
}) {
  const router = useRouter();
  const [asset, setAsset] = useState<File | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textQuestions = questions.filter((question) => question.type !== "file");
  const fileQuestion = questions.find((question) => question.type === "file");
  const steps = questions;

  const schema = useMemo(
    () =>
      z.object(
        Object.fromEntries(
          textQuestions.map((question) => [
            question.key,
            questionToZod(question),
          ]),
        ),
      ),
    [textQuestions],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const current = steps[Math.min(index, steps.length - 1)];
  const isLast = index === steps.length - 1;
  const isFirst = index === 0;

  async function validateCurrent(): Promise<boolean> {
    if (current.type === "file") {
      if (current.required && !asset) {
        toast.error(`${current.label} is required.`);
        return false;
      }
      return true;
    }
    return form.trigger(current.key);
  }

  async function handleNext() {
    if (!(await validateCurrent())) return;
    setDirection(1);
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function handleBack() {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Advance one question at a time until the final step.
    if (!isLast) {
      await handleNext();
      return;
    }

    if (!(await validateCurrent())) return;
    const results = await Promise.all(
      textQuestions.map((question) => form.trigger(question.key)),
    );
    if (results.some((valid) => !valid)) return;

    if (fileQuestion?.required && !asset) {
      toast.error(`${fileQuestion.label} is required.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication({
        userId,
        department: dept.slug,
        data: form.getValues() as Record<string, unknown>,
        asset: asset ?? undefined,
      });
      toast.success(`${dept.name} application transmitted!`);
      router.push("/departments");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="grid gap-8">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
            [0{index + 1}/0{steps.length}]
          </span>
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {steps.map((step, i) => (
              <span
                key={step.key}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i < index && "bg-emerald-400/70",
                  i === index && "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
                  i > index && "bg-white/10",
                )}
              />
            ))}
          </div>
        </div>

        {/* Current question */}
        <div className="min-h-44">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.key}
              initial={{ opacity: 0, x: direction * 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -48 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {current.type === "file" ? (
                <div className="grid gap-2">
                  <Label>
                    {current.label}
                    {!current.required && (
                      <span className="text-muted-foreground"> (optional)</span>
                    )}
                  </Label>
                  <Label
                    htmlFor="portfolio-asset"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-12 text-center transition-colors hover:border-primary hover:bg-muted/40"
                  >
                    <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">
                      {asset ? asset.name : "Click to upload"}
                    </span>
                    {current.hint && (
                      <span className="text-xs text-muted-foreground">
                        {current.hint}
                      </span>
                    )}
                    <input
                      id="portfolio-asset"
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg,.pdf"
                      className="sr-only"
                      onChange={(event) =>
                        setAsset(event.target.files?.[0] ?? null)
                      }
                    />
                  </Label>
                </div>
              ) : (
                <FormField
                  name={current.key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-heading text-lg font-semibold">
                        {current.label}
                        {!current.required && (
                          <span className="text-muted-foreground"> (optional)</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        {current.type === "select" ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={current.placeholder ?? "Select an option"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {current.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : current.type === "textarea" ? (
                          <Textarea
                            rows={current.rows ?? 4}
                            placeholder={current.placeholder}
                            {...field}
                          />
                        ) : (
                          <Input
                            type={current.type === "url" ? "url" : "text"}
                            placeholder={current.placeholder}
                            className="bg-white/[0.03] font-mono text-sm"
                            {...field}
                          />
                        )}
                      </FormControl>
                      {current.hint && (
                        <FormDescription>{current.hint}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={isFirst || isSubmitting}
            className="font-mono text-[11px] tracking-widest uppercase"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            prev
          </Button>

          {isLast ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sheen-btn font-mono text-xs tracking-widest uppercase shadow-[0_0_24px_-8px] shadow-cyan-500/60"
            >
              {isSubmitting && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {isSubmitting
                ? "transmitting_…"
                : `transmit::${dept.name.toLowerCase()}`}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              className="font-mono text-xs tracking-widest uppercase"
            >
              next
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}