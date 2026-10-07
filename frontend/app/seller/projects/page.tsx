"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, Home, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectCard from "../_components/ProjectCard";
import StatsCard from "../_components/StatsCard";
import { Project } from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PropertyViewModal from "@/components/PropertyViewModal";
import PromotionModal from "../../builder-dashboard/_components/PromotionModal";

type TabValue = "ALL" | "PUBLISHED" | "PENDING" | "REJECTED";

const TABS: { label: string; value: TabValue }[] = [
    { label: "All", value: "ALL" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Pending", value: "PENDING" },
    { label: "Reject", value: "REJECTED" },
];

export default function MyProjectsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabValue>("ALL");
    const [search, setSearch] = useState("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [isPromotionOpen, setIsPromotionOpen] = useState(false);
    const [promotingId, setPromotingId] = useState<string | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await api("/properties/my");
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const stats = useMemo(() => {
        return {
            total: projects.length,
            published: projects.filter(p => p.propertyApprovedStatus === "APPROVED" || p.status === "LIVE" || p.status === "PUBLISHED").length,
            pending: projects.filter(p => p.propertyApprovedStatus === "PENDING").length,
            rejected: projects.filter(p => p.propertyApprovedStatus === "REJECTED").length,
        };
    }, [projects]);

    const filtered = useMemo(() => {
        return projects.filter((p) => {
            const matchesTab =
                activeTab === "ALL" ||
                (activeTab === "PUBLISHED" && (p.propertyApprovedStatus === "APPROVED" || p.status === "LIVE" || p.status === "PUBLISHED")) ||
                (activeTab === "PENDING" && p.propertyApprovedStatus === "PENDING") ||
                (activeTab === "REJECTED" && p.propertyApprovedStatus === "REJECTED");
            const matchesSearch =
                search.trim() === "" ||
                (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
                (p.location?.city && p.location.city.toLowerCase().includes(search.toLowerCase()));
            return matchesTab && matchesSearch;
        });
    }, [projects, activeTab, search]);

    const handleView = (id: string) => {
        setSelectedPropertyId(id);
    };

    const handleEdit = (id: string) => {
        router.push(`/seller/add-property?id=${id}`);
    };

    const handleAddNew = () => {
        router.push("/seller/add-property");
    };

    return (
        <>
            <div className="min-h-screen bg-[#F4F5F9]">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-9">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h1 className="text-[22px] font-bold text-gray-900 tracking">
                            My Projects
                        </h1>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-[38px] pl-9 pr-3.5 w-full sm:w-52 text-[13.5px] bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAddNew}
                                className="flex items-center justify-center gap-1.5 h-[38px] cursor-pointer px-4 bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-semibold rounded-lg transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-[14px] h-[14px] " strokeWidth={2.5} />
                                Add New Property
                            </button>
                        </div>
                    </div>

                    {/* ── Stats Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                        <div className="cursor-pointer" onClick={() => setActiveTab("ALL")}>
                            <StatsCard
                                icon={Home}
                                value={stats.total.toString()}
                                label="Total Projects"
                                bg="#eef2ff"
                                iconColor="text-blue-500"
                                className={cn(
                                    "transition-all duration-300",
                                    activeTab === "ALL" ? "ring-2 ring-blue-500 shadow-md" : "opacity-70 hover:opacity-100"
                                )}
                            />
                        </div>
                        <div className="cursor-pointer" onClick={() => setActiveTab("PUBLISHED")}>
                            <StatsCard
                                icon={CheckCircle}
                                value={stats.published.toString()}
                                label="Published Projects"
                                bg="#ecfdf5"
                                iconColor="text-green-500"
                                className={cn(
                                    "transition-all duration-300",
                                    activeTab === "PUBLISHED" ? "ring-2 ring-green-500 shadow-md" : "opacity-70 hover:opacity-100"
                                )}
                            />
                        </div>
                        <div className="cursor-pointer" onClick={() => setActiveTab("PENDING")}>
                            <StatsCard
                                icon={Clock}
                                value={stats.pending.toString()}
                                label="Pending Approval"
                                bg="#f5f3ff"
                                iconColor="text-purple-500"
                                className={cn(
                                    "transition-all duration-300",
                                    activeTab === "PENDING" ? "ring-2 ring-purple-500 shadow-md" : "opacity-70 hover:opacity-100"
                                )}
                            />
                        </div>
                        <div className="cursor-pointer" onClick={() => setActiveTab("REJECTED")}>
                            <StatsCard
                                icon={XCircle}
                                value={stats.rejected.toString()}
                                label="Rejected Projects"
                                bg="#fef3c7"
                                iconColor="text-yellow-500"
                                className={cn(
                                    "transition-all duration-300",
                                    activeTab === "REJECTED" ? "ring-2 ring-yellow-500 shadow-md" : "opacity-70 hover:opacity-100"
                                )}
                            />
                        </div>
                    </div>

                    {/* ── Tabs (Hidden but logic remains) ── */}
                    <div className="flex gap-1.5 mb-5 overflow-hidden h-0 opacity-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    "h-8 px-4 text-[13px] font-medium rounded-md border transition-all cursor-pointer",
                                    activeTab === tab.value
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Grid ── */}
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 -mt-5 border border-gray-200 bg-white rounded-lg p-4 sm:p-7">
                            {filtered.map((project) => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onPromote={(id) => {
                                        setPromotingId(id);
                                        setIsPromotionOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <p className="text-base font-medium">No projects found</p>
                            <p className="text-sm mt-1">Try a different search or filter</p>
                        </div>
                    )}

                </div>
            </div>

            {/* Property View Modal */}
            <PropertyViewModal
                propertyId={selectedPropertyId}
                onClose={() => setSelectedPropertyId(null)}
            />

            {/* Promotion Modal */}
            <PromotionModal
                onClose={() => {
                    setIsPromotionOpen(false);
                    setPromotingId(null);
                }}
                propertyId={promotingId}
                onSuccess={() => {
                    setIsPromotionOpen(false);
                    setPromotingId(null);
                    // Refresh data to show "Featured" status
                    window.location.reload();
                }}
            />
        </>
    );
}