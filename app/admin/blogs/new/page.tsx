import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import NewBlogClient from "./Client";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <NewBlogClient />;
}
