"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/authorization";
import { appendAuditLog } from "@/server/auth/audit";
import { database } from "@/server/db/client";
import { newsArticles } from "@/server/db/schema";
export async function createNewsAction(formData:FormData){const actor=await requirePermission("news.manage");const title=String(formData.get("title")??"").trim();const slug=String(formData.get("slug")??"").trim().toLowerCase();if(title.length<3||!/^[a-z0-9-]+$/.test(slug))throw new Error("Judul atau slug tidak valid");const id=crypto.randomUUID();await database.transaction(async tx=>{await tx.insert(newsArticles).values({id,title,slug,excerpt:String(formData.get("excerpt")??"").trim()||null,status:"draft"});await appendAuditLog(tx,{actorUserId:actor.session.user.id,actorLabel:actor.session.user.email,action:"news.create",resourceType:"newsArticle",resourceId:id,resourceLabel:title,after:{title,slug,status:"draft"},changedFields:["title","slug","excerpt","status"],source:"admin-content"})});revalidatePath("/admin/content/news")}
