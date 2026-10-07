"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface DashboardSummary {
  totalUsers: number;
  totalBuilders: number;
  totalSellers: number;
  totalBuyers: number;
  totalBrokers: number;
  totalAdmins: number;
  totalProperties: number;
  totalLeads: number;
  totalMeetings: number;
  pendingMeetings: number;
  approvedMeetings: number;
}

export interface ListingTypeItem {
  type: string;
  count: number;
}

export interface BhkItem {
  bhk: string;
  count: number;
}

export interface CategoryItem {
  category: string;
  count: number;
}

export interface PieChartItem {
  name: string;
  value: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  listingTypeAnalytics: ListingTypeItem[];
  bhkAnalytics: BhkItem[];
  commercialAnalytics: CategoryItem[];
  meetingStatusAnalytics: PieChartItem[];
  leadStatusAnalytics: PieChartItem[];
  siteVisitAnalytics: PieChartItem[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch dashboard summary and other data in parallel for fallback
        const [res, propertiesRes, leadsRes, meetingsRes] = await Promise.all([
          api("/admin/dashboard-summary").catch(() => null),
          api("/properties?limit=100").catch(() => null),
          // Try admin all leads first for total system count, fallback to general leads
          api("/leads/admin/all").catch(() => api("/leads")).catch(() => null),
          api("/meetings/all").catch(() => null)
        ]);

        if (!res || !res.data) throw new Error("Failed to load dashboard data");

        const dashboardData = res.data;

        // Fallback for leads count if not provided by backend summary
        if (dashboardData.summary.totalLeads === undefined || dashboardData.summary.totalLeads === 0) {
          dashboardData.summary.totalLeads = leadsRes?.count || leadsRes?.data?.length || 0;
        }

        // Fallback for meetings count
        if (dashboardData.summary.totalMeetings === undefined || dashboardData.summary.totalMeetings === 0) {
          // API returns direct array from /meetings/all or /meetings/upcoming
          const meetingsData = Array.isArray(meetingsRes) ? meetingsRes : (meetingsRes?.data || meetingsRes?.meetings || []);
          dashboardData.summary.totalMeetings = meetingsData.length || 0;
          dashboardData.summary.pendingMeetings = meetingsData.filter((m: any) => m.status === "PENDING").length || 0;
          dashboardData.summary.approvedMeetings = meetingsData.filter((m: any) => m.status === "APPROVED").length || 0;
        }

        // Fallback aggregation for commercial properties if the backend hasn't been deployed with our new query yet
        if (!dashboardData.commercialAnalytics || dashboardData.commercialAnalytics.length === 0) {
          const commercialAgg: Record<string, number> = {};
          if (propertiesRes?.results) {
            propertiesRes.results.forEach((p: any) => {
              if (p.listingType === "COMMERCIAL" && p.commercial?.propertyCategory) {
                const cat = p.commercial.propertyCategory;
                commercialAgg[cat] = (commercialAgg[cat] || 0) + 1;
              }
            });
          }
          dashboardData.commercialAnalytics = Object.entries(commercialAgg).map(([category, count]) => ({
            category,
            count: count as number,
          }));
        }

        setData(dashboardData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
