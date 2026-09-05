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
    if (error.status === 400) {
      const fieldObj = (error.data?.data || error.data?.details) as
        | Record<string, { message?: string } | string>
        | undefined;
      if (fieldObj && typeof fieldObj === "object") {
        for (const [key, val] of Object.entries(fieldObj)) {
          const msg = typeof val === "string" ? val : val?.message;
          if (msg) {
            if (msg.toLowerCase().includes("unique")) {
              if (key === "email") return "An account with this email already exists.";
              if (key === "reg_number") return "This registration number is already registered.";
              if (key === "user_department") return "You have already applied to this department.";
            }
            if (
              msg.toLowerCase().includes("blank") ||
              msg.toLowerCase().includes("required")
            ) {
              return `${key}: ${msg}`;
            }
            return msg;
          }
        }
      }
    }

    // PocketBase reports a missing collection as "Missing collection context."
    if (
      error.status === 404 &&
      error.message === "Missing collection context."
    ) {
      return "The PocketBase collections aren't set up yet. Set PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD in .env and restart the server to auto-create them (see README).";
    }

    if (error.data?.message) {
      if (error.data.message.toLowerCase().includes("unique")) {
        return "You have already applied to this department, or this value is already in use.";
      }
      return error.data.message;
    }
    
    if (error.message.toLowerCase().includes("unique")) {
      return "You have already applied to this department, or this value is already in use.";
    }
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}