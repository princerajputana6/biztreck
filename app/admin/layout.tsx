import "../globals.css";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import ShadowWidget from "./ShadowWidget";

export const metadata: Metadata = {
  title: "Admin · Biztreck Solutions",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shadow is owner-only and floats over every admin page.
  const session = await getSession();
  const isOwner = session?.role === "owner";
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      {children}
      {isOwner && <ShadowWidget />}
    </div>
  );
}
