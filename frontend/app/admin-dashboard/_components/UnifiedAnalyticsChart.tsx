"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import type { ListingTypeItem, BhkItem, CategoryItem } from "./useDashboardData";

interface UnifiedAnalyticsChartProps {
  listingTypeAnalytics: ListingTypeItem[];
  bhkAnalytics: BhkItem[];
  commercialAnalytics: CategoryItem[];
  summary: {
    totalUsers: number;
    totalBuilders: number;
    totalSellers: number;
    totalBuyers: number;
    totalBrokers: number;
  };
}

const COLORS_CATEGORY = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];
const COLORS_BHK = ["#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4"];
const COLORS_COMMERCIAL = ["#dc2626", "#ea580c", "#ca8a04", "#65a30d", "#0d9488"];
const COLORS_USERS = ["#2563eb", "#10b981", "#fbbf24", "#818cf8"];

function SubChart({
  title,
  data,
  colors,
}: {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
}) {
  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((sum, d) => sum + d.value, 0);

  if (filteredData.length === 0) {
    filteredData.push({ name: "None", value: 1 });
  }

  return (
    <div className="flex flex-col gap-1 items-center h-full w-full">
      <h4 className="font-black text-gray-800 text-sm text-center tracking-tight">{title}</h4>
      <div className="w-44 h-44 flex-shrink-0 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-gray-900">{total}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Total
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {filteredData.map((entry, index) => {
                const isFallback = entry.name === "None";
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isFallback ? "#f3f4f6" : colors[index % colors.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                  />
                );
              })}
            </Pie>
            <Tooltip
              offset={40}
              wrapperStyle={{ zIndex: 50 }}
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              itemStyle={{ color: "#1f2937" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1.5 w-full max-w-[240px]">
        {filteredData.map((item, index) => {
          if (item.name === "None") return null;
          return (
            <div key={item.name} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-bold text-gray-600 flex-1 truncate uppercase tracking-tight">
                {item.name}
              </span>
              <span
                className="text-xs font-black px-3 py-1 rounded-full text-white shadow-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UnifiedAnalyticsChart({
  listingTypeAnalytics,
  bhkAnalytics,
  commercialAnalytics,
  summary,
}: UnifiedAnalyticsChartProps) {
  // 1. Property Category Data
  const categoryData = listingTypeAnalytics.map((item) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase(),
    value: item.count,
  }));

  // 2. Residential BHK Distribution Data
  const bhkData = bhkAnalytics.map((item) => ({
    name: item.bhk,
    value: item.count,
  }));
  // 3. Commercial Category Data
  const commercialData = (commercialAnalytics || []).map((item) => ({
    name: item.category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    value: item.count,
  }));

  return (
    <div className="bg-white py-4 px-5 rounded-[2rem] border border-gray-200 shadow-sm shadow-blue-900/5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight">
              Property Analytics
            </h3>
            <p className="text-xs text-gray-400 font-bold">
              Demographics & Property Metrics Overview
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="md:pr-4 pt-4 md:pt-0 flex justify-center">
          <SubChart
            title="Property Categories"
            data={categoryData}
            colors={COLORS_CATEGORY}
          />
        </div>
        <div className="md:px-4 pt-6 md:pt-0 flex justify-center">
          <SubChart
            title="Residential Types"
            data={bhkData}
            colors={COLORS_BHK}
          />
        </div>
        <div className="md:pl-4 pt-6 md:pt-0 flex justify-center">
          <SubChart
            title="Commercial Properties"
            data={commercialData}
            colors={COLORS_COMMERCIAL}
          />
        </div>
      </div>
    </div>
  );
}
