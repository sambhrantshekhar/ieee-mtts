import PocketBase from "pocketbase";

/**
 * PocketBase base URL.
 *
 * - Browser: uses NEXT_PUBLIC_PB_URL (inlined at build time) — the browser
 *   talks to the publicly exposed PocketBase instance.
 * - Server: prefers PB_URL (e.g. the Docker-internal `http://pocketbase:8090`),
 *   falling back to NEXT_PUBLIC_PB_URL.
 */
export const PB_URL =
  typeof window === "undefined"
    ? process.env.c ??
      process.env.NEXT_PUBLIC_PB_URL ??
      "http://127.0.0.1:8090"
    : process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8090";

let client: PocketBase | undefined;

/**
 * Returns a shared PocketBase client.
 *
 * On the server a fresh instance is created per call (no auth is available
 * there). On the client a single instance is reused and its `LocalAuthStore`
 * persists the session token to localStorage, which keeps the app logged in
 * across reloads.
 */
export function getPocketBase(): PocketBase {
  if (typeof window === "undefined") {
    return new PocketBase(PB_URL);
  }
  if (!client) {
    client = new PocketBase(PB_URL);
  }
  return client;
}