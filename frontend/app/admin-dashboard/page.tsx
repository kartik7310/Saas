"use client";

import {
  Users,
  Building,
  BarChart3,
  Loader2,
  AlertCircle,
  Home,
  UserCheck,
  Briefcase,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart,
  LayoutDashboard,
  Target,
  Calendar,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

import DashboardSummaryCard from "./_components/DashboardSummaryCard";
import UnifiedAnalyticsChart from "./_components/UnifiedAnalyticsChart";
import UserCompositionChart from "./_components/UserCompositionChart";
import StatusDistributionChart from "./_components/StatusDistributionChart";
import { useDashboardData } from "./_components/useDashboardData";

export default function AdminDashboard() {
  const { data, isLoading, error } = useDashboardData();

  const MEETING_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#6b7280"];
  const LEAD_COLORS = ["#8b5cf6", "#3b82f6", "#ec4899", "#f43f5e"];

  return (
    <>
          <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            {/* Page Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="space-y-1">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tighter">System Overview</h1>
                  <p className="text-gray-500 text-sm font-medium">Monitor real-time platform growth and user engagement metrics.</p>
               </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-600 shadow-sm">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assembling Dashboard Tiles...</p>
              </div>
            )}

            {/* Dashboard Content */}
            {!isLoading && data && (
              <div className="space-y-6">
                {/* Modern Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                   {[
                      { label: "Total Users", value: data.summary.totalUsers || 0, icon: Users, bg: "#eef2ff", iconColor: "text-blue-500" },
                      { label: "Total Properties", value: data.summary.totalProperties || 0, icon: Home, bg: "#ecfdf5", iconColor: "text-green-500" },
                      { label: "Total Meetings", value: data.summary.totalMeetings || 0, icon: Calendar, bg: "#fef3c7", iconColor: "text-amber-500", isMeeting: true },
                      { label: "Total Leads", value: data.summary.totalLeads || 0, icon: Target, bg: "#f5f3ff", iconColor: "text-purple-500" },
                      { label: "Total Team", value: data.summary.totalAdmins || 0, icon: UserCheck, bg: "#fff1f2", iconColor: "text-rose-500" },
                   ].map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm h-[80px] hover:shadow-md transition cursor-pointer" style={{ backgroundColor: item.bg }}>
                           <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                              <item.icon size={20} className={item.iconColor} />
                           </div>
                           <div className="flex flex-col justify-center leading-tight min-w-0">
                              <span className="text-xl font-black text-gray-900">{item.value}</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">{item.label}</span>
                           </div>
                        </div>

                        {/* Meeting Hover Tooltip */}
                        {item.isMeeting && (
                          <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Meeting Status</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                  <span className="text-[11px] font-bold text-gray-600">PENDING</span>
                                </div>
                                <span className="text-xs font-black text-amber-700">{data.summary.pendingMeetings || 0}</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                  <span className="text-[11px] font-bold text-gray-600">APPROVED</span>
                                </div>
                                <span className="text-xs font-black text-emerald-700">{data.summary.approvedMeetings || 0}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                   ))}
                </div>

                {/* Status Normalization Logic */}
                {(() => {
                  // Meeting Data Normalization
                  const meetingLabels = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];
                  const normalizedMeetings = meetingLabels.map(label => {
                    const match = data.meetingStatusAnalytics.find(m => m.name === label);
                    return { name: label, value: match?.value || 0 };
                  });

                  // Lead Data Normalization with Mapping
                  const leadMap: Record<string, string> = {
                    "New": "NEW LEADS",
                    "Contacted": "CONNECTED",
                    "Interested": "INTERESTED",
                    "Not Interested": "NOT INTERESTED"
                  };
                  const leadLabels = ["NEW LEADS", "CONNECTED", "INTERESTED", "NOT INTERESTED"];
                  const normalizedLeads = leadLabels.map(label => {
                    // Find if any backend status maps to this display label
                    const match = data.leadStatusAnalytics.find(l => {
                       const mappedName = leadMap[l.name] || l.name;
                       return mappedName.toUpperCase() === label;
                    });
                    return { name: label, value: match?.value || 0 };
                  });

                  // Site Visit Normalization
                  const siteVisitLabels = ["PENDING", "CONDUCTED", "MISSED"];
                  const normalizedSiteVisits = siteVisitLabels.map(label => {
                    const match = data.siteVisitAnalytics?.find(s => s.name === label);
                    return { name: label, value: match?.value || 0 };
                  });

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                      <StatusDistributionChart
                        title="Meeting Statuses"
                        subtitle="Appointment Lifecycle"
                        data={normalizedMeetings}
                        icon={Calendar}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-500"
                        colors={["#f59e0b", "#10b981", "#ef4444", "#3b82f6"]}
                      />
                      <StatusDistributionChart
                        title="Leads Distribution"
                        subtitle="Engagement Funnel"
                        data={normalizedLeads}
                        icon={Target}
                        iconBg="bg-purple-50"
                        iconColor="text-purple-500"
                        colors={["#8b5cf6", "#3b82f6", "#ec4899", "#f43f5e"]}
                      />
                      <StatusDistributionChart
                        title="Site Visits"
                        subtitle="Tour Conversion Rates"
                        data={normalizedSiteVisits}
                        icon={MapPin}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-500"
                        colors={["#cbd5e1", "#10b981", "#f43f5e"]}
                      />
                    </div>
                  );
                })()}

                {/* Main Analytics Hub */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                   <div className="xl:col-span-2 h-full">
                      <UnifiedAnalyticsChart
                        listingTypeAnalytics={data.listingTypeAnalytics}
                        bhkAnalytics={data.bhkAnalytics}
                        commercialAnalytics={data.commercialAnalytics}
                        summary={data.summary}
                      />
                   </div>
                   <div className="xl:col-span-1 h-full">
                      <UserCompositionChart summary={data.summary} />
                   </div>
                </div>
              </div>
            )}
          </div>
    </>
  );
}

function MoreVertical(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
