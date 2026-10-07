"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronRight, X, Loader2, Users, UserPlus, Phone, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabFilter } from "@/app/mock-data/mockLeadData";
import { api } from "@/lib/api";
import { toast } from "sonner";
import StatsCard from "../_components/StatsCard";

const TABS: TabFilter[] = ["All", "New", "Contacted", "Interested", "Not Interested"];
const STATUS_OPTIONS = ["New", "Contacted", "Interested", "Not Interested"];
const ROWS_PER_PAGE = 10;

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<TabFilter>("All");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(0);

    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // Fetch all leads for accurate global stats calculation
            const response = await api("/leads");
            setLeads(response.data || []);
        } catch (err: any) {
            console.error("Error fetching leads:", err);
            setError(err.message || "Failed to load leads.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const stats = useMemo(() => {
        return {
            total: leads.length,
            new: leads.filter(l => l.status === "New").length,
            contacted: leads.filter(l => l.status === "Contacted").length,
            interested: leads.filter(l => l.status === "Interested").length
        };
    }, [leads]);

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const matchesTab = activeTab === "All" || l.status === activeTab;
            const matchesFilter = statusFilter.length === 0 || statusFilter.includes(l.status);
            return matchesTab && matchesFilter;
        });
    }, [leads, activeTab, statusFilter]);

    const handleStatusUpdate = async (leadId: string, newStatus: string) => {
        try {
            await api(`/leads/${leadId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
            toast.success(`Status updated to ${newStatus}`);
            // Update local state keeping global counts correct
            setLeads((prev) =>
                prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
            );
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
        }
    };

    useEffect(() => {
        setPage(0);
    }, [activeTab, statusFilter]);

    const totalPages = Math.ceil(filteredLeads.length / ROWS_PER_PAGE);
    const paginated = filteredLeads.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

    const allChecked =
        paginated.length > 0 && paginated.every((l) => selected.has(l._id));

    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allChecked) {
                paginated.forEach((l) => next.delete(l._id));
            } else {
                paginated.forEach((l) => next.add(l._id));
            }
            return next;
        });
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleTabChange = (tab: TabFilter) => {
        setActiveTab(tab);
        setSelected(new Set());
    };

    return (
        <div className="min-h-screen bg-[#F4F5F9] -mt-5">
            <div className="max-[100%] lg:max-w-[1200px] mx-auto px-4 md:px-6 py-9">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                        Leads
                    </h1>

                    {/* <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center cursor-pointer gap-1.5 h-[36px] px-4 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:border-gray-300 transition-all"
                            >
                                Filter
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            </button>

                            {filterOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-md p-3 z-50">
                                    {STATUS_OPTIONS.map((status) => (
                                        <label key={status} className="flex items-center gap-2 text-[13px] text-gray-600 mb-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={statusFilter.includes(status)}
                                                onChange={() => {
                                                    setStatusFilter((prev) =>
                                                        prev.includes(status)
                                                            ? prev.filter((s) => s !== status)
                                                            : [...prev, status]
                                                    );
                                                }}
                                            />
                                            {status}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* <button className="h-[36px] px-4 cursor-pointer bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:border-gray-300 transition-all">
                            Assign to Agent
                        </button>

                        <button className="h-[36px] px-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors">
                            Import Leads
                        </button> */}
                    {/* </div> */}
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="cursor-pointer" onClick={() => handleTabChange("All")}>
                        <StatsCard
                            icon={Users}
                            value={stats.total.toString()}
                            label="Total Leads"
                            bg="#eef2ff"
                            iconColor="text-blue-500"
                            className={cn(
                                "transition-all duration-300",
                                activeTab === "All" ? "ring-2 ring-blue-500 shadow-md" : "opacity-70 hover:opacity-100"
                            )}
                        />
                    </div>
                    <div className="cursor-pointer" onClick={() => handleTabChange("New")}>
                        <StatsCard
                            icon={UserPlus}
                            value={stats.new.toString()}
                            label="New Leads"
                            bg="#ecfdf5"
                            iconColor="text-green-500"
                            className={cn(
                                "transition-all duration-300",
                                activeTab === "New" ? "ring-2 ring-green-500 shadow-md" : "opacity-70 hover:opacity-100"
                            )}
                        />
                    </div>
                    <div className="cursor-pointer" onClick={() => handleTabChange("Contacted")}>
                        <StatsCard
                            icon={Phone}
                            value={stats.contacted.toString()}
                            label="Contacted"
                            bg="#f5f3ff"
                            iconColor="text-purple-500"
                            className={cn(
                                "transition-all duration-300",
                                activeTab === "Contacted" ? "ring-2 ring-purple-500 shadow-md" : "opacity-70 hover:opacity-100"
                            )}
                        />
                    </div>
                    <div className="cursor-pointer" onClick={() => handleTabChange("Interested")}>
                        <StatsCard
                            icon={Star}
                            value={stats.interested.toString()}
                            label="Interested"
                            bg="#fef3c7"
                            iconColor="text-yellow-500"
                            className={cn(
                                "transition-all duration-300",
                                activeTab === "Interested" ? "ring-2 ring-yellow-500 shadow-md" : "opacity-70 hover:opacity-100"
                            )}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={cn(
                                "px-5 py-3 text-[13px] font-bold transition-all border-b-2 -mb-px whitespace-nowrap cursor-pointer",
                                activeTab === tab
                                    ? "text-blue-600 border-blue-600"
                                    : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex justify-center py-24">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="w-10 pl-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={allChecked}
                                                onChange={toggleAll}
                                                className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                                            />
                                        </th>

                                        <th className="py-3 pr-4 text-left">
                                            <span className="text-[12px] font-semibold text-gray-500">Date</span>
                                        </th>

                                        {["Buyer Name", "Phone Number", "Property", "Status"].map((col) => (
                                            <th
                                                key={col}
                                                className="py-3 pr-4 text-left text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginated.length > 0 ? (
                                        paginated.map((lead, i) => (
                                            <tr
                                                key={lead._id}
                                                className={cn(
                                                    "border-b border-gray-50 hover:bg-gray-50/60 transition-colors",
                                                    i === paginated.length - 1 && "border-b-0"
                                                )}
                                            >
                                                <td className="pl-4 py-3.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(lead._id)}
                                                        onChange={() => toggleOne(lead._id)}
                                                        className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-3.5 pr-4 text-[12.5px] text-gray-400 whitespace-nowrap">
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3.5 pr-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">
                                                    {lead.buyerName}
                                                </td>
                                                <td className="py-3.5 pr-4 text-[12.5px] font-medium text-blue-600 whitespace-nowrap">
                                                    {lead.buyerMobile || "N/A"}
                                                </td>
                                                <td className="py-3.5 pr-4 text-[12.5px] text-gray-500 whitespace-nowrap">
                                                    {lead.propertyTitle}
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <select
                                                        value={lead.status}
                                                        onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                                                        className={cn(
                                                            "text-[11px] font-bold px-2.5 py-1 rounded-full border-none outline-none cursor-pointer",
                                                            lead.status === "New" && "bg-blue-50 text-blue-600",
                                                            lead.status === "Contacted" && "bg-orange-50 text-orange-600",
                                                            lead.status === "Interested" && "bg-green-50 text-green-600",
                                                            lead.status === "Not Interested" && "bg-gray-100 text-gray-600"
                                                        )}
                                                    >
                                                        {STATUS_OPTIONS.map((opt) => (
                                                            <option key={opt} value={opt}>
                                                                {opt}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-[13px] text-gray-400">
                                                {error || "No leads found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading && (
                        /* Pagination */
                        <div className="flex items-center justify-end gap-1.5 px-4 py-3 border-t border-gray-100">
                            <button
                                onClick={() => setPage(0)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
                            >
                                <X className="w-3 h-3 text-gray-400" />
                            </button>

                            <button className="w-7 h-7 flex items-center justify-center rounded border border-blue-500 bg-white text-[12px] font-semibold text-blue-600">
                                {page + 1}
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                                disabled={page >= totalPages - 1}
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
