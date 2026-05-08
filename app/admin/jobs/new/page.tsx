import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import NewJobClient from "./Client";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <NewJobClient />;
}
