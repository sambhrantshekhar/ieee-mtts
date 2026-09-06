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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

  let requiredMessage = "This field is required.";
  if (question.type === "select") {
    requiredMessage = "Please select an option.";
  }
  if (question.key === "stack") {
    requiredMessage = "Please select a stack.";
  }

  let field: z.ZodType = question.required
    ? z.preprocess(
        (val) => (val === undefined ? "" : val),
        z.string().min(1, requiredMessage)
      )
    : z.string().optional();

  if (question.key === "github") {
    field = field.refine(
      (value) => !value || /^(https?:\/\/)?(www\.)?github\.com\/\S+/i.test(value as string),
      "Please provide a valid GitHub profile link (e.g., github.com/yourname).",
    );
  } else if (question.type === "url") {
    field = field.refine(
      (value) => !value || /^(https?:\/\/|www\.)\S+$/.test(value as string),
      "Enter a valid URL (e.g., https://... or www....).",
    );
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  const textQuestions = questions.filter((question) => question.type !== "file");
  const fileQuestion = questions.find((question) => question.type === "file");
  const steps = questions;

  const schema = useMemo(
    () => {
      const shape: Record<string, z.ZodType> = {};
      textQuestions.forEach((question) => {
        shape[question.key] = questionToZod(question);
        const hasDetailOption = question.options?.some(opt => opt === "Other" || opt.toLowerCase().includes("please specify"));
        if (question.type === "select" && hasDetailOption) {
          shape[`${question.key}_other`] = z.string().optional();
        }
      });
      return z.object(shape).superRefine((data, ctx) => {
        textQuestions.forEach((q) => {
          const hasDetailOption = q.options?.some(opt => opt === "Other" || opt.toLowerCase().includes("please specify"));
          if (q.type === "select" && hasDetailOption) {
            const val = data[q.key] as string;
            const requiresDetail = val === "Other" || (val && val.toLowerCase().includes("please specify"));
            if (requiresDetail && !(data[`${q.key}_other`] as string)?.trim()) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please specify.",
                path: [`${q.key}_other`],
              });
            }
          }
        });
      });
    },
    [textQuestions],
  );

  const draftKey = `draft_app_${userId}_${dept.slug}`;
  const [loaded, setLoaded] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        form.reset(parsed);
        
        // Find the first unanswered question to jump to
        let targetIndex = 0;
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step.type === "file") continue;
          
          const val = parsed[step.key];
          if (val && String(val).trim() !== "") {
            targetIndex = i; // has answer, but keep checking next
          } else {
            targetIndex = i; // missing answer, stop here
            break;
          }
        }
        
        setIndex(Math.min(targetIndex, steps.length - 1));
      }
    } catch (e) {
      // Ignore parsing errors
    }
    setLoaded(true);
  }, [draftKey, form, steps]);

  useEffect(() => {
    if (!loaded) return;
    const subscription = form.watch((value) => {
      localStorage.setItem(draftKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, draftKey, loaded]);

  const current = steps[Math.min(index, steps.length - 1)];
  const isLast = index === steps.length - 1;
  const isFirst = index === 0;

  async function validateCurrent(): Promise<boolean> {
    if (current.type === "file") {
      if (current.required && !asset) {
        toast.error("Please upload the required file.");
        return false;
      }
      return true;
    }
    let isValid = await form.trigger(current.key);
    if (current.type === "select" && current.options?.includes("Other")) {
      const otherValid = await form.trigger(`${current.key}_other`);
      isValid = isValid && otherValid;
    }
    return isValid;
  }

  async function handleNext() {
    if (isTransitioning) return;
    if (!(await validateCurrent())) return;
    setIsTransitioning(true);
    setDirection(1);
    setIndex((i) => Math.min(i + 1, steps.length - 1));
    setTimeout(() => setIsTransitioning(false), 400);
  }

  function handleBack() {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
    setTimeout(() => setIsTransitioning(false), 400);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isTransitioning) return;

    // Advance one question at a time until the final step.
    if (!isLast) {
      await handleNext();
      return;
    }

    if (!(await validateCurrent())) return;
    const results = await Promise.all(
      textQuestions.map(async (question) => {
        let valid = await form.trigger(question.key);
        const hasDetailOption = question.options?.some(opt => opt === "Other" || opt.toLowerCase().includes("please specify"));
        if (question.type === "select" && hasDetailOption) {
          const val = form.getValues()[question.key] as string;
          const requiresDetail = val === "Other" || (val && val.toLowerCase().includes("please specify"));
          if (requiresDetail) {
            const otherValid = await form.trigger(`${question.key}_other`);
            valid = valid && otherValid;
          }
        }
        return valid;
      }),
    );
    if (results.some((valid) => !valid)) return;

    if (fileQuestion?.required && !asset) {
      toast.error("Please upload the required file.");
      return;
    }

    // Intercept submit and show confirmation dialog
    setIsConfirmSubmitOpen(true);
  }

  async function processSubmit() {
    setIsConfirmSubmitOpen(false);
    setIsSubmitting(true);
    try {
      const submitData = { ...form.getValues() } as Record<string, unknown>;
      textQuestions.forEach((q) => {
        const val = submitData[q.key] as string;
        const requiresDetail = val === "Other" || (val && val.toLowerCase().includes("please specify"));
        if (q.type === "select" && requiresDetail && submitData[`${q.key}_other`]) {
          const prefix = val === "Other" ? "Other" : val;
          submitData[q.key] = `${prefix}: ${submitData[`${q.key}_other`]}`;
          delete submitData[`${q.key}_other`];
        }
      });

      await submitApplication({
        userId,
        department: dept.slug,
        data: submitData,
        asset: asset ?? undefined,
      });
      localStorage.removeItem(draftKey);
      toast.success(`${dept.name} application submitted!`);
      router.push("/departments");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="grid gap-8" noValidate>
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
                          <div className="space-y-3">
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
                            
                            { (field.value === "Other" || (field.value && (field.value as string).toLowerCase().includes("please specify"))) && (
                              <FormField
                                control={form.control}
                                name={`${current.key}_other`}
                                render={({ field: otherField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder="Please specify..."
                                        className="bg-white/[0.03] font-mono text-sm mt-3"
                                        {...otherField}
                                        value={(otherField.value as string) || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
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
            disabled={isFirst || isSubmitting || isTransitioning}
            className="font-mono text-[11px] tracking-widest uppercase"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            prev
          </Button>

          {isLast ? (
            <Button
              type="submit"
              disabled={isSubmitting || isTransitioning}
              className="sheen-btn font-mono text-xs tracking-widest uppercase shadow-[0_0_24px_-8px] shadow-cyan-500/60"
            >
              {isSubmitting && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {isSubmitting
                ? "Submitting..."
                : `Submit Application`}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isTransitioning}
              className="font-mono text-xs tracking-widest uppercase"
            >
              next
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </form>
      
      <ConfirmDialog
        isOpen={isConfirmSubmitOpen}
        onClose={() => setIsConfirmSubmitOpen(false)}
        onConfirm={processSubmit}
        title="Submit Application?"
        description="Are you sure you want to submit your application? You won't be able to change it after submission."
        confirmText="Submit"
      />
    </Form>
  );
}