"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { ProfileCard } from "./profile-card";

type Profile = {
  imageUrl: string;
  name: string;
  position: string;
  gender: "L" | "P";
};

export default function ProfileGrid({
  data,
  showOnDesktop = 6,
  showOnMobile = 3,
  isRight = false,
}: {
  data: Profile[];
  showOnMobile: number;
  showOnDesktop: number;
  isRight?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const canExpand = data.length > Math.min(showOnMobile, showOnDesktop);

  if (!data.length) {
    return <p className="relative rounded-xl border border-dashed border-dgb-200 bg-white/55 px-6 py-10 text-center font-montserrat text-sm text-[#505050]">Belum ada profil yang ditampilkan.</p>;
  }

  return (
    <div className="relative">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((item, index) => (
          <div
            key={`${item.name}-${item.position}`}
            className={cn(
              !showAll && index >= showOnMobile && "max-md:hidden",
              !showAll && index >= showOnDesktop && "md:hidden",
            )}
          >
            <ProfileCard {...item} ornamentId={item.name} />
          </div>
        ))}
      </div>
      {canExpand ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          aria-expanded={showAll}
          className={cn("group mt-4 flex w-fit items-center gap-2 font-montserrat text-base font-semibold text-dgb transition-colors hover:text-dgb-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fb-400 focus-visible:ring-offset-4", isRight && "ml-auto")}
        >
          {showAll ? "Tampilkan lebih sedikit" : "Lihat semua"}
          <ArrowRight className={cn("size-5 transition-transform", showAll ? "-rotate-90" : "group-hover:translate-x-1")} />
        </button>
      ) : null}
    </div>
  );
}
