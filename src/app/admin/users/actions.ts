"use server";
import { revalidatePath } from "next/cache";
import { approveAccessRequest } from "@/server/auth/access-requests";
export async function approveAction(formData: FormData) {
  await approveAccessRequest(String(formData.get("requestId")), String(formData.get("roleSlug")), String(formData.get("note") ?? ""));
  revalidatePath("/admin/users");
}
