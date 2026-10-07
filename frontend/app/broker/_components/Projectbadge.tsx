import { BadgeType } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const badgeStyles: Record<NonNullable<BadgeType>, string> = {
    live: "bg-emerald-100 text-emerald-700",
    draft: "bg-gray-100 text-gray-500",
    list: "bg-amber-100 text-amber-700",
};

interface ProjectBadgeProps {
    label: string;
    type: BadgeType;
}

export function ProjectBadge({ label, type }: ProjectBadgeProps) {
    if (!type || !label) return null;

    return (
        <span
            className={cn(
                "text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded",
                badgeStyles[type]
            )}
        >
            {label}
        </span>
    );
}