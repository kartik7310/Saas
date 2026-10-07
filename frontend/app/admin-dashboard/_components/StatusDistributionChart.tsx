"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { LucideIcon } from "lucide-react";

interface StatusDistributionChartProps {
  title: string;
  subtitle: string;
  data: { name: string; value: number }[];
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  colors: string[];
}

export default function StatusDistributionChart({
  title,
  subtitle,
  data,
  icon: Icon,
  iconBg,
  iconColor,
  colors,
}: StatusDistributionChartProps) {
  const chartData = data.length > 0 ? data : [{ name: "No Data", value: 0 }];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
            <Icon size={18} />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-gray-900 tracking-tight text-sm">
              {title}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-[250px] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
                background: "rgba(255, 255, 255, 0.98)",
                fontSize: "11px",
                fontWeight: "700",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "8px 12px"
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 pt-5 border-t border-gray-50">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              {item.name}
            </span>
            <span className="text-[10px] font-black text-gray-900 ml-auto">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
