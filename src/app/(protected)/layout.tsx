import { RequireAuth } from "@/components/require-auth";
import { Navbar } from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </RequireAuth>
  );
}