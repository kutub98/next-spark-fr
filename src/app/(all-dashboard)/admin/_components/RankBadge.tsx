"use client";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function RankBadge({ rank }: { rank: number }) {
  const colors = {
    1: "bg-yellow-400 text-yellow-900",
    2: "bg-gray-300 text-gray-900",
    3: "bg-amber-600 text-white",
  };
  const color = colors[rank as 1 | 2 | 3] || "bg-slate-200 text-slate-800";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold",
        color
      )}
    >
      {rank <= 3 ? <Trophy className="w-4 h-4 mr-1" /> : null}#{rank}
    </span>
  );
}
