"use client";

import React from "react";

interface DashboardSummaryCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function DashboardSummaryCard({
  label,
  value,
  icon,
  iconBg,
}: DashboardSummaryCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between gap-4 group">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
    </div>
  );
}
