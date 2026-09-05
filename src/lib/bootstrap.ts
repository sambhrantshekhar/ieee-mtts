import PocketBase from "pocketbase";
import { PB_URL } from "@/lib/pocketbase";
import type { DepartmentSlug } from "@/lib/departments";

const DEPARTMENT_SELECT = ["technical", "design", "management", "social"];

// PocketBase's API does NOT auto-add these (only the Admin UI does). Without
// them, `sort=created`/`sort=updated` fail and records lack timestamps.
const AUTODATE_FIELDS = [
  { name: "created", type: "autodate", onCreate: true, onUpdate: false },
  { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
];

export interface QuestionSeed {
  department: DepartmentSlug;
  key: string;
  label: string;
  type: "text" | "url" | "textarea" | "select" | "file";
  placeholder?: string;
  hint?: string;
  options?: string[];
  rows?: number;
  min_length?: number;
  required?: boolean;
  sort_order: number;
}

const DEFAULT_QUESTIONS: QuestionSeed[] = [
  // Technical
  {
    department: "technical",
    key: "github",
    label: "GitHub profile link",
    type: "url",
    placeholder: "https://github.com/yourname",
    hint: "Show us the code you're proud of.",
    sort_order: 0,
  },
  {
    department: "technical",
    key: "stack",
    label: "Preferred tech stack",
    type: "select",
    options: ["Next.js", "React", "Node.js", "Go", "Python", "Flutter", "Other"],
    sort_order: 1,
  },
  {
    department: "technical",
    key: "bug",
    label: "Describe a complex bug you fixed",
    type: "textarea",
    rows: 5,
    min_length: 30,
    placeholder: "What was the bug, how did you debug it, and what was the root cause?",
    sort_order: 2,
  },
  // Design
  {
    department: "design",
    key: "portfolio",
    label: "Portfolio link",
    type: "url",
    placeholder: "https://www.behance.net/yourname",
    hint: "Figma, Behance, Dribbble or a personal site.",
    sort_order: 0,
  },
  {
    department: "design",
    key: "software",
    label: "Preferred design software",
    type: "select",
    options: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Blender", "Canva", "Other"],
    sort_order: 1,
  },
  {
    department: "design",
    key: "asset",
    label: "Sample asset link",
    type: "url",
    placeholder: "https://drive.google.com/...",
    hint: "Provide an open access link (e.g. Google Drive, Figma) to a poster, thumbnail, or UI mock you've made.",
    sort_order: 2,
  },
  // Management
  {
    department: "management",
    key: "scenario",
    label: "How would you handle a team member missing a critical deadline?",
    type: "textarea",
    rows: 5,
    min_length: 30,
    sort_order: 0,
  },
  {
    department: "management",
    key: "leadership",
    label: "Previous leadership experience",
    type: "textarea",
    rows: 4,
    min_length: 10,
    placeholder: "Clubs, committees, class rep roles, project leads — anything counts.",
    sort_order: 1,
  },
  // Social
  {
    department: "social",
    key: "handles",
    label: "Social media handles",
    type: "text",
    min_length: 3,
    placeholder: "@instagram @linkedin @twitter",
    hint: "The handles you're most active on.",
    sort_order: 0,
  },
  {
    department: "social",
    key: "pitch",
    label: "Pitch a new club event",
    type: "textarea",
    rows: 5,
    min_length: 30,
    placeholder: "What's the event, who's it for, and why would it be a hit?",
    sort_order: 1,
  },
];

const QUESTIONS_FIELDS = [
  { name: "department", type: "select", required: true, values: DEPARTMENT_SELECT, maxSelect: 1 },
  { name: "key", type: "text", required: true, max: 64 },
  { name: "label", type: "text", required: true, max: 255 },
  {
    name: "type",
    type: "select",
    required: true,
    values: ["text", "url", "textarea", "select", "file"],
    maxSelect: 1,
  },
  { name: "placeholder", type: "text", max: 255 },
  { name: "hint", type: "text", max: 500 },
  { name: "options", type: "json" },
  { name: "rows", type: "number" },
  { name: "min_length", type: "number" },
  { name: "required", type: "bool" },
  { name: "sort_order", type: "number" },
];

const APPLICATIONS_FIELDS = [
  {
    name: "user",
    type: "relation",
    required: true,
    collectionId: "", // filled at runtime from the users collection
    cascadeDelete: true,
    maxSelect: 1,
  },
  { name: "department", type: "select", required: true, values: DEPARTMENT_SELECT, maxSelect: 1 },
  {
    name: "status",
    type: "select",
    values: ["pending", "reviewed", "accepted", "rejected"],
    maxSelect: 1,
  },
  { name: "data", type: "json" },
  {
    name: "portfolio_asset",
    type: "file",
    maxSelect: 1,
    maxSize: 5242880,
    mimeTypes: ["image/png", "image/jpeg", "image/svg+xml", "application/pdf"],
  },
  { name: "user_department", type: "text", required: true, max: 64 },
];

async function collectionExists(pb: PocketBase, name: string): Promise<boolean> {
  try {
    await pb.collections.getOne(name);
    return true;
  } catch {
    return false;
  }
}

/** Adds the `created`/`updated` autodate fields if the collection lacks them. */
async function ensureAutodateFields(pb: PocketBase, name: string): Promise<void> {
  const collection = await pb.collections.getOne(name);
  if (collection.fields.some((field: { name: string }) => field.name === "created")) {
    return;
  }
  await pb.collections.update(name, {
    fields: [...collection.fields, ...AUTODATE_FIELDS],
  });
  console.log(`[bootstrap] Added created/updated fields to ${name}.`);
}

/**
 * Idempotent: creates any missing collections and fields, then seeds the
 * default department questions. Requires superuser credentials via
 * PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD. Never throws — logs and skips instead.
 */
export async function ensureCollections(): Promise<void> {
  const email = process.env.PB_ADMIN_EMAIL;
  const password = process.env.PB_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[bootstrap] PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD are not set — skipping auto schema setup. Configure collections manually (see README).",
    );
    return;
  }

  const pb = new PocketBase(PB_URL);

  try {
    await pb.collection("_superusers").authWithPassword(email, password);
  } catch (error) {
    console.warn(
      "[bootstrap] Superuser login failed — skipping auto schema setup.",
      error instanceof Error ? error.message : error,
    );
    return;
  }

  try {
    await ensureUsersField(pb);
  } catch (error) {
    console.warn("[bootstrap] users.reg_number setup failed.", error);
  }

  try {
    await ensureApplicationsCollection(pb);
  } catch (error) {
    console.warn("[bootstrap] applications collection setup failed.", error);
  }

  try {
    await ensureQuestionsCollection(pb);
  } catch (error) {
    console.warn("[bootstrap] questions collection setup failed.", error);
  }

  console.log("[bootstrap] PocketBase schema sync finished.");
  pb.authStore.clear();
}

async function ensureUsersField(pb: PocketBase): Promise<void> {
  const users = await pb.collections.getOne("users");
  
  let needsUpdate = false;
  let newFields: any[] = users.fields;
  let newIndexes: string[] = users.indexes || [];

  if (!users.fields.some((field: { name: string }) => field.name === "reg_number")) {
    newFields = [
      ...users.fields,
      { name: "reg_number", type: "text", required: true, max: 16, pattern: "^[0-9]{2}[A-Z]{3}[0-9]{4}$" },
    ];
    needsUpdate = true;
  }

  const regNumberIndex = "CREATE UNIQUE INDEX idx_users_reg_number ON users (reg_number)";
  // Only add if an index for reg_number doesn't already exist
  if (!newIndexes.some((idx: string) => idx.includes("reg_number"))) {
    newIndexes = [...newIndexes, regNumberIndex];
    needsUpdate = true;
  }

  if (needsUpdate) {
    await pb.collections.update("users", {
      fields: newFields,
      indexes: newIndexes,
    });
    console.log("[bootstrap] Updated users collection with reg_number and unique index.");
  }
}

async function ensureApplicationsCollection(pb: PocketBase): Promise<void> {
  if (await collectionExists(pb, "applications")) {
    await ensureAutodateFields(pb, "applications");
    return;
  }

  const users = await pb.collections.getOne("users");
  const fields = [
    ...APPLICATIONS_FIELDS.map((field) =>
      field.name === "user" ? { ...field, collectionId: users.id } : field,
    ),
    ...AUTODATE_FIELDS,
  ];

  await pb.collections.create({
    name: "applications",
    type: "base",
    fields,
    indexes: ["CREATE UNIQUE INDEX idx_applications_user_dept ON applications (user_department)"],
    listRule: "user.id = @request.auth.id",
    viewRule: "user.id = @request.auth.id",
    createRule: "user.id = @request.auth.id",
    updateRule: "user.id = @request.auth.id",
    deleteRule: "user.id = @request.auth.id",
  });
  console.log("[bootstrap] Created applications collection.");
}

async function ensureQuestionsCollection(pb: PocketBase): Promise<void> {
  if (await collectionExists(pb, "questions")) {
    await ensureAutodateFields(pb, "questions");
  } else {
    await pb.collections.create({
      name: "questions",
      type: "base",
      fields: [...QUESTIONS_FIELDS, ...AUTODATE_FIELDS],
      indexes: ["CREATE UNIQUE INDEX idx_questions_dept_key ON questions (department, key)"],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: "",
      updateRule: "",
      deleteRule: "",
    });
    console.log("[bootstrap] Created questions collection.");
  }

  const existing = await pb.collection("questions").getFullList({ perPage: 1 });
  if (existing.length > 0) return;

  for (const question of DEFAULT_QUESTIONS) {
    await pb.collection("questions").create({
      department: question.department,
      key: question.key,
      label: question.label,
      type: question.type,
      placeholder: question.placeholder ?? "",
      hint: question.hint ?? "",
      options: question.options ?? null,
      rows: question.rows ?? null,
      min_length: question.min_length ?? 0,
      required: question.required ?? true,
      sort_order: question.sort_order,
    });
  }
  console.log(`[bootstrap] Seeded ${DEFAULT_QUESTIONS.length} default questions.`);
}