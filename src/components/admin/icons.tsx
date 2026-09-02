"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileClock,
  FileText,
  FolderOpen,
  GalleryVerticalEnd,
  Images,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideProps,
} from "lucide-react";

export type AdminIconName =
  | "activity"
  | "bar-chart"
  | "book-open"
  | "calendar"
  | "clipboard"
  | "clock"
  | "file"
  | "folder"
  | "gallery"
  | "images"
  | "layout"
  | "settings"
  | "shield"
  | "sparkles"
  | "users";

const icons = {
  activity: Activity,
  "bar-chart": BarChart3,
  "book-open": BookOpen,
  calendar: CalendarDays,
  clipboard: ClipboardList,
  clock: FileClock,
  file: FileText,
  folder: FolderOpen,
  gallery: GalleryVerticalEnd,
  images: Images,
  layout: LayoutDashboard,
  settings: Settings2,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: Users,
};

export function AdminIcon({ name, ...props }: { name: AdminIconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} />;
}
