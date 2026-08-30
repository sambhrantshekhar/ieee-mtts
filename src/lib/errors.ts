import { ClientResponseError } from "pocketbase";

/**
 * Converts any thrown value (usually a PocketBase `ClientResponseError`)
 * into a human-readable message for toast/error display.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    // Network / server unreachable.
    if (error.status === 0) {
      return "Could not reach the server. Make sure PocketBase is running.";
    }

    // Field-level validation errors (duplicate email, invalid reg number, …).
    if (error.status === 400 && error.data?.data) {
      const fields = error.data.data as Record<string, { message?: string }>;
      const first = Object.values(fields).find((field) => field?.message);
      if (first?.message) return first.message;
    }

    // PocketBase reports a missing collection as "Missing collection context."
    if (
      error.status === 404 &&
      error.message === "Missing collection context."
    ) {
      return "The PocketBase collections aren't set up yet. Set PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD in .env and restart the server to auto-create them (see README).";
    }

    if (error.data?.message) return error.data.message;
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}