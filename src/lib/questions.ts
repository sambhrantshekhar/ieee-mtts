import { getPocketBase } from "@/lib/pocketbase";
import type { DepartmentSlug } from "@/lib/departments";

export type QuestionType = "text" | "url" | "textarea" | "select" | "file";

export interface Question {
  key: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  hint?: string;
  options?: string[];
  rows?: number;
  min_length?: number;
  required: boolean;
  sort_order: number;
}

/** Questions are served from the `questions` collection, ordered by sort_order. */
export async function getQuestionsForDepartment(
  department: DepartmentSlug,
): Promise<Question[]> {
  const pb = getPocketBase();
  const records = await pb.collection("questions").getFullList({
    filter: `department = "${department}"`,
    sort: "sort_order",
  });

  return records.map((record) => ({
    key: record.key as string,
    label: record.label as string,
    type: record.type as QuestionType,
    placeholder: record.placeholder as string | undefined,
    hint: record.hint as string | undefined,
    options: Array.isArray(record.options)
      ? (record.options as string[])
      : undefined,
    rows: record.rows ? Number(record.rows) : undefined,
    min_length: record.min_length ? Number(record.min_length) : 0,
    required: (record.required ?? true) as boolean,
    sort_order: Number(record.sort_order ?? 0),
  }));
}