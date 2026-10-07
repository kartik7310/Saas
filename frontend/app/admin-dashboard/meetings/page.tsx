"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    User as UserIcon,
    CheckCircle2,
    XCircle,
    Loader2,
    Video,
    Phone,
    Mail,
    ChevronRight,
    HomeIcon,
    AlertCircle,
    Search,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Pagination from "@/components/admin/Pagination";
import { useAuth } from "@/lib/AuthContext";
import ScheduleMeetingModal from "./_components/ScheduleMeetingModal";
import { Plus, CalendarCheck2 } from "lucide-react";

type MeetingStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export default function AdminMeetingsManagement() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
    });

    const { user: currentUser } = useAuth();

    const fetchMeetings = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                status: filterStatus,
                search: searchQuery,
                date: filterDate
            });
            const data = await api(`/meetings/all?${params.toString()}`);
            setMeetings(data.meetings || []);
            setTotalPages(data.totalPages || 1);
            if (data.stats) setStats(data.stats);
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch meetings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [currentPage, filterStatus, filterDate]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchMeetings();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleUpdateStatus = async (id: string, status: MeetingStatus) => {
        try {
            setIsProcessing(id);
            await api(`/meetings/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });
            toast.success(`Meeting ${status.toLowerCase()} successfully`);

            // Update local state by refetching to ensure accurate state transition and stats update
            fetchMeetings();
        } catch (err: any) {
            toast.error(err.message || "Failed to update meeting status");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleJoinMeeting = async (id: string, meetingUrl: string = "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1") => {
        try {
            setIsProcessing(id);
            // Open meeting first
            window.open(meetingUrl, "_blank");

            // Notify backend
            await api(`/meetings/${id}/join`, {
                method: "POST"
            });
            toast.success("Joined session. You can click Mark Completed after 30 seconds.");

            // Set locally to immediately update UI instead of full refetch to avoid flicker
            setMeetings(prev => prev.map(m =>
                m._id === id ? { ...m, joinedBy: currentUser?._id, joinedAt: new Date().toISOString() } : m
            ));
        } catch (err: any) {
            toast.error(err.message || "Failed to join meeting");
        } finally {
            setIsProcessing(null);
        }
    };

    const filteredMeetings = meetings; // Now handled by backend

    const statCards = [
        { label: "Total Calls", count: stats.total, filter: "ALL", icon: Video, bg: "#eef2ff", iconColor: "text-blue-500" },
        { label: "Pending", count: stats.pending, filter: "PENDING", icon: Clock, bg: "#fffbeb", iconColor: "text-amber-500" },
        { label: "Approved", count: stats.approved, filter: "APPROVED", icon: CheckCircle2, bg: "#ecfdf5", iconColor: "text-emerald-500" },
        { label: "Rejected", count: stats.rejected, filter: "REJECTED", icon: XCircle, bg: "#fff1f2", iconColor: "text-red-500" },
        { label: "Completed", count: stats.completed, filter: "COMPLETED", icon: Calendar, bg: "#f0f9ff", iconColor: "text-blue-600" },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse m-8">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Syncing Video Schedules...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                            <Video size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Video Operations</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Meetings Management</h1>
                    <p className="text-gray-500 text-sm font-medium">Approve and monitor video consultation requests between users.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search attendee or property..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-64 shadow-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-medium"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate("")}
                                className="h-11 px-4 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="h-11 px-6 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Schedule Meeting
                    </Button>
                </div>
            </div>

            {/* Dashboard-Style Summary Cards Container */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {statCards.map((item, idx) => (
                        <div
                            key={idx}
                            className="relative group cursor-pointer transition-all duration-300"
                            onClick={() => setFilterStatus(item.filter)}
                        >
                            <div
                                className={`flex items-center gap-4 p-4 rounded-xl shadow-sm h-[80px] hover:shadow-md transition-all ${filterStatus === item.filter ? "shadow-md bg-opacity-90 ring-1 ring-gray-900/5" : ""
                                    }`}
                                style={{ backgroundColor: item.bg }}
                            >
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                                    <item.icon size={20} className={item.iconColor} />
                                </div>
                                <div className="flex flex-col justify-center leading-tight">
                                    <span className="text-xl font-black text-gray-900">{item.count}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.label}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Meetings Table Layout */}
            {filteredMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                        <Calendar size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-500">No meeting requests found</p>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
                        <h2 className="text-lg font-bold text-slate-800">Upcoming Meetings</h2>
                        <div className="flex gap-2">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                Showing 1 to {filteredMeetings.length} of {stats.total} Meetings
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold">Topic</th>
                                    <th className="px-6 py-4 font-semibold">Attendees</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Host / Owner</th>
                                    <th className="px-6 py-4 text-center font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {filteredMeetings.map((meeting) => {
                                    const meetingDate = new Date(meeting.date);
                                    const formattedDate = meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                                    return (
                                        <tr key={meeting._id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-800">{formattedDate},</div>
                                                <div className="text-xs font-medium text-slate-500">{meeting.time}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 line-clamp-1">
                                                    {meeting.scheduledBy ? (
                                                        <div className="flex items-center gap-1.5 text-indigo-600">
                                                            <CalendarCheck2 size={14} />
                                                            Scheduled by {meeting.scheduledBy.name}
                                                        </div>
                                                    ) : (
                                                        meeting.propertyTitle
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-semibold">{meeting.propertyId?.listingType || (meeting.scheduledBy ? "Direct Consultation" : "Property Discussion")}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {meeting.attendeeName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{meeting.attendeeName}</div>
                                                        <div className="text-[10px] text-slate-500">{meeting.attendeePhone || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100/80 w-fit px-2.5 py-1 rounded-md">
                                                    <Video size={12} className="text-blue-500" />
                                                    VC
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Shield size={12} className="text-orange-400" />
                                                    <span className="font-semibold text-slate-700 text-sm">{meeting.hostId?.name || "Owner"}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center flex-col gap-2">
                                                    {meeting.status === "PENDING" ? (
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleUpdateStatus(meeting._id, "APPROVED")}
                                                                disabled={!!isProcessing}
                                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 w-full justify-center active:scale-95"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(meeting._id, "REJECTED")}
                                                                disabled={!!isProcessing}
                                                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[11px] font-black uppercase rounded-lg transition-all w-full justify-center active:scale-95"
                                                            >
                                                                <XCircle size={14} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (meeting.status === "APPROVED" || meeting.status === "IN_PROGRESS") ? (
                                                        <div className="flex flex-col gap-2">
                                                            {!meeting.joinedBy ? (
                                                                <button
                                                                    onClick={() => handleJoinMeeting(meeting._id)}
                                                                    disabled={!!isProcessing}
                                                                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-black text-white text-[11px] font-black uppercase rounded-lg shadow-xl shadow-slate-900/10 transition-all flex items-center gap-1.5 w-full justify-center active:scale-95"
                                                                >
                                                                    <Video size={10} className="text-blue-400" />
                                                                    Join Meeting
                                                                </button>
                                                            ) : (
                                                                meeting.joinedBy === currentUser?._id ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => window.open("https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1", "_blank")}
                                                                            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-black text-white text-[11px] font-black uppercase rounded-lg shadow-xl shadow-slate-900/10 transition-all flex items-center gap-1.5 w-full justify-center active:scale-95 opacity-80"
                                                                        >
                                                                            <Video size={10} className="text-blue-400" />
                                                                            Rejoin
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(meeting._id, "COMPLETED")}
                                                                            disabled={!!isProcessing}
                                                                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 text-[11px] font-black uppercase rounded-lg transition-all w-full justify-center active:scale-95 flex items-center gap-1.5 mt-1"
                                                                        >
                                                                            <CheckCircle2 size={10} />
                                                                            Mark Completed
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <div className="px-4 py-3 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase rounded-lg text-center flex flex-col gap-1.5 items-center justify-center">
                                                                        <Loader2 size={14} className="animate-spin text-amber-500" />
                                                                        <span className="tracking-widest">Meeting is Running</span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded text-center w-fit mx-auto">
                                                            {meeting.status}
                                                        </span>
                                                    )}
                                                </div>
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

            <ScheduleMeetingModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSuccess={fetchMeetings}
            />
        </div>
    );
}
