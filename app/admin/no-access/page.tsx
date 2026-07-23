import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Landing for an authenticated user who has not been granted any module.
export default async function NoAccessPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-bold text-white">No access yet</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your account ({session.email}) doesn&apos;t have any modules assigned. Please ask an
          administrator to grant you access.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block rounded-full border border-navy-700/70 bg-navy-800/50 px-4 py-2 text-sm text-slate-200 hover:border-accent-cyan"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
