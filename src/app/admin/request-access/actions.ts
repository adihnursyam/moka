"use server";

import { revalidatePath } from "next/cache";

import { submitAccessRequest } from "@/server/auth/access-requests";

export async function requestAccessAction(formData: FormData) {
  const reason = String(formData.get("reason") ?? "");
  const requestedAreas = formData.getAll("areas").map(String);
  await submitAccessRequest(reason, requestedAreas);
  revalidatePath("/admin/request-access");
}
