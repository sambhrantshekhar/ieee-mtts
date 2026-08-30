export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureCollections } = await import("@/lib/bootstrap");
    await ensureCollections();
  }
}