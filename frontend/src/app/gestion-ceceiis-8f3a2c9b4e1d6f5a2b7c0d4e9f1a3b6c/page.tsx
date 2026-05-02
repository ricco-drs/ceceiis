import { redirect } from "next/navigation";
import { ADMIN } from "@/lib/routes";

export default function AdminPage() {
  redirect(ADMIN.listas);
}
