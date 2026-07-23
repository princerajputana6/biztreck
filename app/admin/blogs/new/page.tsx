import { requireView } from "@/lib/auth";
import NewBlogClient from "./Client";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  await requireView("content");
  return <NewBlogClient />;
}
