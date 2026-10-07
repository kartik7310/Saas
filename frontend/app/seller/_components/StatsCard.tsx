import React from "react";

export default function StatsCard({
    icon: Icon,
    value,
    label,
    sub,
    bg,
    iconColor,
}: any) {
    return (
        <div
            className="flex items-center gap-3 p-3.5 rounded-xl shadow-sm min-h-[72px] h-auto hover:shadow-md transition"
            style={{ backgroundColor: bg }}
        >
            {/* Icon */}
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/70 shrink-0">
                <Icon size={18} className={iconColor} />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center leading-tight min-w-0">
                <span className="text-lg font-semibold text-gray-900 truncate">
                    {value}
                </span>

                <span className="text-xs text-gray-600 truncate sm:whitespace-normal">
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