import {
  Code,
  Palette,
  ClipboardList,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export const DEPARTMENT_SLUGS = [
  "technical",
  "design",
  "management",
  "social",
] as const;

export type DepartmentSlug = (typeof DEPARTMENT_SLUGS)[number];

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "accepted"
  | "rejected";

export interface DepartmentConfig {
  slug: DepartmentSlug;
  name: string;
  code: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  chip: string;
}

export const DEPARTMENTS: Record<DepartmentSlug, DepartmentConfig> = {
  technical: {
    slug: "technical",
    name: "Technical",
    code: "TCH",
    tagline: "Build things that move the club forward.",
    description:
      "Work on the club's website, automation tools, and technical projects with the IEEE MTT-S team. Ideal for engineers who love shipping real software.",
    icon: Code,
    gradient: "from-sky-500 to-blue-600",
    chip: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  design: {
    slug: "design",
    name: "Design",
    code: "DSN",
    tagline: "Make every pixel intentional.",
    description:
      "Own the visual identity of the club — posters, social creatives, website UI, and event branding. For people who sweat the details.",
    icon: Palette,
    gradient: "from-violet-500 to-fuchsia-600",
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  management: {
    slug: "management",
    name: "Management",
    code: "MGT",
    tagline: "Keep the gears turning.",
    description:
      "Plan events, coordinate teams, manage budgets and deadlines. For organised people who get things done without the spotlight.",
    icon: ClipboardList,
    gradient: "from-amber-500 to-orange-600",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  social: {
    slug: "social",
    name: "Social",
    code: "SOC",
    tagline: "Turn members into a community.",
    description:
      "Run our Instagram, plan events, and keep the club buzzing. For outgoing people who connect with others effortlessly.",
    icon: Megaphone,
    gradient: "from-emerald-500 to-green-600",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
};

export const DEPARTMENT_LIST = Object.values(DEPARTMENTS);

export function getDepartment(
  slug: string | undefined,
): DepartmentConfig | null {
  if (!slug || !(slug in DEPARTMENTS)) return null;
  return DEPARTMENTS[slug as DepartmentSlug];
}