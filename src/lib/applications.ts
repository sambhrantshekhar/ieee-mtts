import { getPocketBase } from "@/lib/pocketbase";
import type { ApplicationStatus, DepartmentSlug } from "@/lib/departments";

export interface Application {
  id: string;
  department: DepartmentSlug;
  status: ApplicationStatus;
  data: Record<string, unknown>;
  portfolio_asset?: string;
  created: string;
}

export function toApplication(record: Record<string, unknown>): Application {
  return {
    id: record.id as string,
    department: record.department as DepartmentSlug,
    status: (record.status ?? "pending") as ApplicationStatus,
    data: (record.data ?? {}) as Record<string, unknown>,
    portfolio_asset: record.portfolio_asset as string | undefined,
    created: record.created as string,
  };
}

/** All applications belonging to a user, newest first. */
export async function getApplicationsForUser(
  userId: string,
): Promise<Application[]> {
  const pb = getPocketBase();
  const records = await pb.collection("applications").getFullList({
    filter: `user.id = "${userId}"`,
    sort: "-created",
  });
  return records.map(toApplication);
}

export interface SubmitApplicationInput {
  userId: string;
  department: DepartmentSlug;
  data: Record<string, unknown>;
  asset?: File;
}

export async function submitApplication({
  userId,
  department,
  data,
  asset,
}: SubmitApplicationInput) {
  const pb = getPocketBase();

  const payload: Record<string, unknown> = {
    user: userId,
    department,
    status: "pending",
    user_department: `${userId}_${department}`,
    data,
  };

  if (asset) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      formData.set(key, String(value));
    }
    formData.set("portfolio_asset", asset);
    return pb.collection("applications").create(formData);
  }

  return pb.collection("applications").create(payload);
}