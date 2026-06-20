"use client";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
  className?: string;
}

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const INITIALS_BG = [
  "bg-zinc-700",
  "bg-zinc-600",
  "bg-stone-700",
  "bg-neutral-700",
  "bg-slate-700",
];

const SIZE = {
  sm: { avatar: "w-8 h-8", text: "text-xs", status: "w-2 h-2" },
  md: { avatar: "w-10 h-10", text: "text-sm", status: "w-2.5 h-2.5" },
  lg: { avatar: "w-14 h-14", text: "text-base", status: "w-3 h-3" },
  xl: { avatar: "w-20 h-20", text: "text-xl", status: "w-4 h-4" },
};

const STATUS_COLOR = {
  online: "bg-green-500",
  offline: "bg-zinc-600",
  away: "bg-yellow-500",
};

export function UserAvatar({
  src,
  name,
  size = "md",
  showStatus = false,
  status = "online",
  className,
}: UserAvatarProps) {
  const s = SIZE[size];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = INITIALS_BG[hashName(name) % INITIALS_BG.length];

  return (
    <div className={cn("relative inline-flex shrink-0", s.avatar, className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover object-center"
        />
      ) : (
        <div
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center select-none",
            bg,
          )}
        >
          <span className={cn(s.text, "font-semibold text-white/60 leading-none")}>
            {initials}
          </span>
        </div>
      )}
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border border-black",
            s.status,
            STATUS_COLOR[status],
          )}
        />
      )}
    </div>
  );
}

export default UserAvatar;
