import React from "react";
import { cn } from "@/lib/utils";

export default function StatsCard({
    icon: Icon,
    value,
    label,
    sub,
    bg,
    iconColor,
    className,
}: any) {
    return (
        <div
            className={cn("flex items-center gap-3 p-3.5 rounded-xl shadow-sm h-[72px] hover:shadow-md transition", className)}
            style={{ backgroundColor: bg }}
        >
            {/* Icon */}
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/70 shrink-0">
                <Icon size={18} className={iconColor} />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center leading-tight">

                <span className="text-lg font-semibold text-gray-900">
                    {value}
                </span>

                <span className="text-xs text-gray-600">
                    {label}
                </span>

                {/* Reserve space even if sub doesn't exist */}
                {sub && (
                    <span className="text-[10px] text-red-500">
                        {sub}
                    </span>
                )}

            </div>
        </div>
    );
}