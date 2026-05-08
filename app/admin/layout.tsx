import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Biztreck Solutions",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-navy-950 text-slate-100">{children}</div>;
}
