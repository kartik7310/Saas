"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ListingTypeItem, BhkItem } from "./useDashboardData";

interface PropertyTypeChartProps {
  listingTypeAnalytics: ListingTypeItem[];
  bhkAnalytics: BhkItem[];
}

const COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#3b82f6", // blue
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
];

export default function PropertyTypeChart({
  listingTypeAnalytics,
  bhkAnalytics,
}: PropertyTypeChartProps) {
  // Combine both datasets into one unified list for the donut chart
  const chartData = [
    ...bhkAnalytics.map((item) => ({
      name: item.bhk,
      value: item.count,
    })),
    ...listingTypeAnalytics.map((item) => ({
      name: item.type.charAt(0) + item.type.slice(1).toLowerCase(),
      value: item.count,
    })),
  ];

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
      <h2 className="font-bold text-lg mb-4 text-foreground">
        Property Type Analytics
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
        {/* Donut chart */}
        <div className="w-44 h-44 flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  fontSize: "13px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                }}
                itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-foreground">{total}</span>
            <span className="text-[10px] text-muted-foreground">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 w-full">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground flex-1 truncate">
                {item.name}
              </span>
              <span
                className="text-sm font-semibold px-2.5 py-0.5 rounded-md min-w-[40px] text-center text-white"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
