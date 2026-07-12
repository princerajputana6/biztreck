import { Loader2 } from "lucide-react";

// Shown instantly on admin tab navigation while the target page's data loads,
// so switching views feels responsive instead of blocking on the server render.
export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 text-slate-400">
      <div className="flex items-center gap-3 text-sm">
        <Loader2 size={18} className="animate-spin text-accent-cyan" />
        Loading…
      </div>
    </div>
  );
}
