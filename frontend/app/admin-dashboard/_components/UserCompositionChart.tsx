"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";

interface UserCompositionChartProps {
  summary: {
    totalUsers: number;
    totalBuilders: number;
    totalSellers: number;
    totalBuyers: number;
    totalBrokers: number;
  };
}

const COLORS_USERS = ["#2563eb", "#10b981", "#fbbf24", "#818cf8"];

export default function UserCompositionChart({ summary }: UserCompositionChartProps) {
  const chartData = [
    { name: "Buyers", value: summary.totalBuyers || 0 },
    { name: "Sellers", value: summary.totalSellers || 0 },
    { name: "Builders", value: summary.totalBuilders || 0 },
    { name: "Brokers", value: summary.totalBrokers || 0 },
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    chartData.push({ name: "Users", value: 1 });
  }

  const total = chartData.filter(c => c.name !== "Users").reduce((s, c) => s + c.value, 0) || summary.totalUsers;

  return (
    <div className="bg-white py-4 px-5 rounded-[2rem] border border-gray-200 shadow-sm shadow-blue-900/5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
          <Users size={18} />
        </div>
        <div>
          <h3 className="font-black text-gray-900 tracking-tight text-[15px]">
            User Composition
          </h3>
          <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">
            Platform Participants
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        {/* Donut Chart */}
        <div className="w-44 h-44 flex-shrink-0 relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-gray-900 leading-none">{total}</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              Total
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%" className="relative z-10">
            <PieChart>
              <Pie
                data={chartData}
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
                {chartData.map((entry, index) => {
                  const isFallback = entry.name === "Users";
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isFallback ? "#f3f4f6" : COLORS_USERS[index % COLORS_USERS.length]}
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

        {/* Legend below chart */}
        <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
          {chartData.map((item, index) => {
            if (item.name === "Users") return null;
            return (
              <div key={item.name} className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: COLORS_USERS[index % COLORS_USERS.length] }}
                />
                <span className="text-[11px] font-bold text-gray-500 flex-1 uppercase tracking-tight text-nowrap">
                  {item.name}
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: COLORS_USERS[index % COLORS_USERS.length] }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
