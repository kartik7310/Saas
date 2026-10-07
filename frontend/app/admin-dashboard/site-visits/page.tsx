"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    User as UserIcon,
    CheckCircle2,
    XCircle,
    Loader2,
    MapPin,
    MessageSquare,
    Search,
    Shield,
    Star,
    History,
    AlertTriangle
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Pagination from "@/components/admin/Pagination";

export default function AdminSiteVisitsHistory() {
    const [siteVisits, setSiteVisits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterDate, setFilterDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        visited: 0,
        not_visited: 0,
    });

    const fetchSiteVisits = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                search: searchQuery,
                status: filterStatus,
                date: filterDate
            });
            const data = await api(`/meetings/site-visits?${params.toString()}`);
            setSiteVisits(data.siteVisits || []);
            setTotalPages(data.totalPages || 1);
            if (data.stats) setStats(data.stats);
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch site visit history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSiteVisits();
    }, [currentPage, filterStatus, filterDate]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchSiteVisits();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse m-8">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loading Site Visit History...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                            <History size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Growth Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Site Visit History</h1>
                    <p className="text-gray-500 text-sm font-medium">Tracking physical property tours and post-visit feedback from buyers and hosts.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search attendee or property..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all w-64 shadow-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm font-medium text-slate-700"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate("")}
                                className="h-11 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-sm font-bold border border-slate-200 transition-colors shadow-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Dashboard-Style Summary Cards Container */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Total Visits */}
                    <div
                        className={cn("bg-[#eef2ff] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer border", filterStatus === "ALL" ? "border-blue-300 -translate-y-0.5 shadow-md" : "border-transparent")}
                        onClick={() => setFilterStatus("ALL")}
                    >
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                            <MapPin size={20} className="text-blue-500" />
                        </div>
                        <div className="flex flex-col justify-center leading-tight">
                            <span className="text-xl font-black text-gray-900">{stats.total}</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Logged</span>
                        </div>
                    </div>

                    {/* Visited */}
                    <div
                        className={cn("bg-[#ecfdf5] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer border", filterStatus === "VISITED" ? "border-emerald-300 -translate-y-0.5 shadow-md" : "border-transparent")}
                        onClick={() => setFilterStatus("VISITED")}
                    >
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                        <div className="flex flex-col justify-center leading-tight">
                            <span className="text-xl font-black text-gray-900">{stats.visited}</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Visited</span>
                        </div>
                    </div>

                    {/* Not Visited */}
                    <div
                        className={cn("bg-[#fff1f2] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer border", filterStatus === "NOT_VISITED" ? "border-rose-300 -translate-y-0.5 shadow-md" : "border-transparent")}
                        onClick={() => setFilterStatus("NOT_VISITED")}
                    >
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                            <XCircle size={20} className="text-rose-500" />
                        </div>
                        <div className="flex flex-col justify-center leading-tight">
                            <span className="text-xl font-black text-gray-900">{stats.not_visited}</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Not Visited</span>
                        </div>
                    </div>

                    {/* Pending Update */}
                    <div
                        className={cn("bg-[#fffbeb] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer border", filterStatus === "PENDING" ? "border-amber-300 -translate-y-0.5 shadow-md" : "border-transparent")}
                        onClick={() => setFilterStatus("PENDING")}
                    >
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                            <Clock size={20} className="text-amber-500" />
                        </div>
                        <div className="flex flex-col justify-center leading-tight">
                            <span className="text-xl font-black text-gray-900">{stats.pending}</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending Upd.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Site Visits Table Layout */}
            {siteVisits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                        <MapPin size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No site visit history found</p>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
                        <h2 className="text-lg font-bold text-slate-800">Growth Logs</h2>
                        <div className="flex gap-2">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                Total {(stats?.total || 0)} Site Visits Recorded
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold">Property Name</th>
                                    <th className="px-6 py-4 font-semibold">Buyer</th>
                                    <th className="px-6 py-4 font-semibold">District/City</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold text-center">Buyer Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Seller Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                 {siteVisits.map((visit) => {
                                    const meetingDate = visit.meetingId?.date ? new Date(visit.meetingId.date) : null;
                                    const formattedDate = meetingDate ? meetingDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "TBD";

                                    return (
                                        <tr key={visit._id} className="hover:bg-slate-50/60 transition-colors group text-sm">
                                            <td className="px-6 py-4 font-bold text-slate-800 line-clamp-1">{visit.propertyId?.title || "Unknown Property"}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">{visit.buyerId?.name || "Unknown"}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-600">
                                                {visit.propertyId?.location?.city || "Unknown"} {visit.propertyId?.location?.state ? `/ ${visit.propertyId.location.state}` : ""}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 whitespace-nowrap">
                                                    {visit.actualVisitDate 
                                                        ? new Date(visit.actualVisitDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : formattedDate}
                                                </div>
                                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-0.5">
                                                    {visit.actualVisitDate ? "ACTUAL DATE" : (visit.meetingId?.time || "Scheduled")}
                                                </div>
                                            </td>
                                             <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "text-[10px] font-black px-2 py-1 rounded border whitespace-nowrap uppercase",
                                                    visit.buyerStatus === "VISITED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                    visit.buyerStatus === "NOT_VISITED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {visit.buyerStatus}
                                                </span>
                                            </td>
                                             <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "text-[10px] font-black px-2 py-1 rounded border whitespace-nowrap uppercase",
                                                    visit.sellerStatus === "VISITED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                    visit.sellerStatus === "NOT_VISITED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {visit.sellerStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedVisit(visit);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="bg-white border text-xs font-bold text-slate-600 border-slate-200 hover:border-purple-200 hover:text-purple-600 rounded-lg px-3 py-1.5 transition-colors shadow-sm whitespace-nowrap"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
            />

            {/* View Details Modal */}
            {isModalOpen && selectedVisit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Site Visit Details</h3>

                                </div>
                                 <p className="text-xs font-medium text-slate-500">
                                    {selectedVisit.actualVisitDate 
                                        ? `Visited on ${new Date(selectedVisit.actualVisitDate).toLocaleDateString()}`
                                        : selectedVisit.meetingId?.date ? `${new Date(selectedVisit.meetingId.date).toLocaleDateString()} at ${selectedVisit.meetingId.time}` : "Scheduled Date TBD"}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                <span className="font-bold text-sm">âœ•</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            {/* Property Details */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Property Information</h4>
                                <div className="font-bold text-slate-800 text-lg mb-1">{selectedVisit.propertyId?.title || "Property Information"}</div>
                                <div className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    {selectedVisit.propertyId?.location?.projectName || selectedVisit.propertyId?.location?.city || "Location not provided"}
                                </div>
                            </div>

                            {/* Participant Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">B</div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer Details</h4>
                                    </div>
                                    <div className="font-bold text-slate-800">{selectedVisit.buyerId?.name || "Unknown"}</div>
                                    <div className="text-xs font-medium text-slate-500 mt-1 mb-4 flex-grow">{selectedVisit.buyerId?.email}</div>
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Buyer Status</span>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded border uppercase",
                                            selectedVisit.buyerStatus === "VISITED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                            selectedVisit.buyerStatus === "NOT_VISITED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {selectedVisit.buyerStatus}
                                        </span>
                                    </div>
                                </div>
                                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-black">S</div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller Details</h4>
                                    </div>
                                    <div className="font-bold text-slate-800">{selectedVisit.sellerId?.name || "Unknown"}</div>
                                    <div className="text-xs font-medium text-slate-500 mt-1 mb-4 flex-grow">{selectedVisit.sellerId?.email}</div>
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Seller Status</span>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded border uppercase",
                                            selectedVisit.sellerStatus === "VISITED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                            selectedVisit.sellerStatus === "NOT_VISITED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {selectedVisit.sellerStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Block */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Buyer Feedback</h4>
                                    {selectedVisit.buyerUpdatedAt ? (
                                        <div className="space-y-3">
                                            <span className="bg-white text-blue-700 text-[10px] font-black px-2 py-1 rounded shadow-sm border border-blue-100">
                                                {selectedVisit.interestLevel || "MEDIUM"} INTEREST
                                            </span>
                                            <p className="text-sm font-medium text-slate-600 italic">"{selectedVisit.buyerFeedback || "No feedback comments."}"</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-400 italic">No feedback submitted yet.</p>
                                    )}
                                </div>
                                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Seller Report</h4>
                                    {selectedVisit.sellerUpdatedAt ? (
                                        <div className="space-y-3">
                                            <span className="bg-white text-orange-700 text-[10px] font-black px-2 py-1 rounded shadow-sm border border-orange-100">
                                                {selectedVisit.sellerStatus}
                                            </span>
                                            <p className="text-sm font-medium text-slate-600 italic">"{selectedVisit.sellerFeedback || "No comments provided."}"</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-400 italic">No report filed yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
