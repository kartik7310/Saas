"use client";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Tag,
  HomeIcon,
  Phone,
  AlertCircle,
  Shield,
  AlertTriangle
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function HostMeetingsPage({ role }: { role: string }) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinedMeetingIds, setJoinedMeetingIds] = useState<string[]>([]);
  const [finishedMeetingIds, setFinishedMeetingIds] = useState<string[]>([]);
  
  // Feedback Modal states
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [visitorStatus, setVisitorStatus] = useState<"VISITED" | "NOT_VISITED" | "PENDING">("PENDING");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const data = await api("/meetings/upcoming");
      setMeetings(data.filter((m: any) => m.status !== "PENDING"));
    } catch (err: any) {
      toast.error("Failed to fetch meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStatusUpdate = async (meetingId: string, status: string) => {
    try {
      await api(`/meetings/${meetingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Meeting ${status.toLowerCase()} successfully`);
      fetchMeetings(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || "Failed to update meeting status");
    }
  };

  const handleJoin = async (meeting: any) => {
    try {
      // Record joining event in backend
      await api(`/meetings/${meeting._id}/join`, { method: "POST" });
      
      // Update local state for immediate UI feedback
      setJoinedMeetingIds(prev => [...prev, meeting._id]);
      
      // Open the meeting link
      window.open(meeting.meetingLink || "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1", "_blank");
      
      toast.info("Meeting joined. Don't forget to update the site visit status after your call!");
    } catch (err: any) {
      // Even if recording fails, still try to open the meeting
      window.open(meeting.meetingLink || "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1", "_blank");
      console.error("Failed to record join event:", err);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedMeeting) return;
    
    try {
      setIsSubmitting(true);
      await api(`/meetings/${selectedMeeting._id}/site-visit-feedback`, {
        method: "PATCH",
        body: JSON.stringify({
          feedback,
          siteVisitStatus: visitorStatus
        }),
      });
      
      toast.success("Site visit feedback updated successfully");
      setIsModalOpen(false);
      setFeedback("");
      fetchMeetings(); // Refresh the list to show updated status
    } catch (err: any) {
      toast.error(err.message || "Failed to update feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meeting Listings</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Meetings Schedule</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {meetings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-20 text-center shadow-lg">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-500 font-black text-xl uppercase tracking-tighter">No Appointments Scheduled.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row group min-h-[250px]"
            >

              {/* 1. Property Image Section - Reference Styling */}
              <div className="relative w-full lg:w-[360px] shrink-0 min-h-[180px] lg:min-h-full bg-slate-50 p-3">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 group-hover:border-blue-500 transition-colors shadow-sm bg-white">
                  <img
                    src={meeting.propertyId?.media?.photos?.[0] || "/images/property-placeholder.png"}
                    alt={meeting.propertyTitle}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Status Badge Overlay */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={cn(
                      "text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md text-white whitespace-nowrap",
                      meeting.status === "APPROVED" || meeting.status === "IN_PROGRESS" ? "bg-emerald-500" :
                        meeting.status === "PENDING" ? "bg-amber-500" : "bg-red-500"
                    )}>
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      {meeting.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Original Content Section (Flexbox based) */}
              <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between">
                <div>
                  {/* HEADER SECTION */}
                  <div className="flex flex-col mb-4">
                    <h2 className="text-xl font-bold text-[#2563eb] tracking-tighter mb-0.5 leading-none">{meeting.propertyTitle}</h2>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      PROPERTY ID: <span className="text-slate-500">{(meeting.propertyId?._id || "MEET").toUpperCase()}</span>
                    </p>
                  </div>

                  {/* BADGES ROW ( ORIGINAL STYLE ) */}
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    {/* CATEGORY SLOT */}
                    <div className="px-4 py-1 bg-[#f5f9ff] border border-[#e3efff] rounded-xl flex flex-col min-w-[100px]">
                      <span className="text-[8px] font-black text-[#5698ff] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Tag className="w-2.5 h-2.5" /> CATEGORY
                      </span>
                      <span className="text-xs font-black text-[#2563eb] uppercase tracking-tight">
                        {meeting.propertyId?.listingType || "RESIDENTIAL"}
                      </span>
                    </div>

                    {/* LOCATION SLOT */}
                    <div className="px-4 py-1 bg-[#f1faf6] border border-[#e0f3eb] rounded-xl flex flex-col min-w-[100px]">
                      <span className="text-[8px] font-black text-[#00c581] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <MapPin className="w-2.5 h-2.5" /> LOCATION
                      </span>
                      <span className="text-xs font-black text-[#007f52] uppercase tracking-tight">
                        {meeting.propertyId?.location?.city || "Bangalore"}
                      </span>
                    </div>

                    {/* STATUS SLOT */}
                    <div className="px-4 py-1 bg-[#fffaf1] border border-[#fff3e0] rounded-xl flex flex-col min-w-[100px]">
                      <span className="text-[8px] font-black text-[#ff9800] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Video className="w-2.5 h-2.5" /> STATUS
                      </span>
                      <span className="text-xs font-black text-[#c07300] uppercase tracking-tight italic">
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER ( ORIGINAL STYLE ) - Fluid Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100/80">
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                    <div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">BUYER PROFILE</p>
                      <p className="text-sm font-black text-slate-800 tracking-tighter leading-none">{meeting.attendeeName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                    <div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">MEETING DATE</p>
                      <p className="text-sm font-black text-slate-800 tracking-tighter leading-none">
                        {new Date(meeting.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">MEETING TIME</p>
                      <p className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">{meeting.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. FAR RIGHT: ACTION AREA ( ORIGINAL STYLE ) */}
              <div className="w-full lg:w-[130px] shrink-0 border-l border-slate-100/80 bg-slate-50/10 flex flex-col items-center justify-center p-4 gap-2.5">
                {(meeting.status === "APPROVED" || meeting.status === "COMPLETED" || meeting.status === "IN_PROGRESS") ? (
                  <>
                    {meeting.siteVisit?.sellerUpdatedAt ? (
                      <div className="w-full h-12 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-emerald-600 font-black tracking-widest text-[9px] uppercase text-center gap-1 shadow-sm">
                        <CheckCircle2 size={14} />
                        <span>{meeting.siteVisit.sellerStatus === 'VISITED' ? 'VISITED' : 'SUBMITTED'}</span>
                      </div>
                    ) : (meeting.status === "COMPLETED" || finishedMeetingIds.includes(meeting._id)) ? (
                      <Button
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setVisitorStatus("PENDING");
                          setIsModalOpen(true);
                        }}
                        className="w-full h-12 bg-indigo-600 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 group"
                      >
                        <MapPin size={14} className="group-hover:scale-110 transition-transform" />
                        <span>VISIT SITE</span>
                      </Button>
                    ) : (meeting.joinedBy || joinedMeetingIds.includes(meeting._id)) ? (
                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          onClick={() => window.open(meeting.meetingLink || "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1", "_blank")}
                          className="w-full h-9 bg-blue-600 hover:bg-black text-white font-black text-[8px] uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Video size={12} />
                          REJOIN
                        </Button>
                        <Button
                          onClick={() => setFinishedMeetingIds(prev => [...prev, meeting._id])}
                          className="w-full h-9 bg-slate-800 hover:bg-black text-white font-black text-[8px] uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          FINISH
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoin(meeting)}
                        className="w-full h-12 bg-[#2563eb] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-50 flex items-center justify-center gap-2 active:scale-95 px-3"
                      >
                        <Video size={14} />
                        <span>JOIN</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full h-12 bg-slate-50/50 rounded-xl border border-dotted border-slate-200 flex items-center justify-center text-slate-300 font-black italic tracking-widest text-[9px] uppercase">
                    PROCESSED
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Site Visit Update Modal */}
      {isModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative h-28">
              <h3 className="text-xl font-black tracking-tight mb-1">Update Site Visit</h3>
              <p className="text-[10px] font-medium text-blue-50 opacity-90 leading-tight pr-12">Please confirm if the visitor showed up and provide any relevant feedback.</p>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Visit Info */}
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-blue-600 border border-slate-100">
                  <UserIcon size={18} />
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">BUYER</p>
                  <p className="text-xs font-black text-slate-800 leading-tight">{selectedMeeting.attendeeName}</p>
                </div>
              </div>

              {/* Status Picker */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DID THE VISITOR SHOW UP?</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setVisitorStatus("VISITED")}
                    className={cn(
                      "py-3 px-4 rounded-xl border text-[11px] font-black tracking-widest transition-all",
                      visitorStatus === "VISITED" ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    VISITED
                  </button>
                  <button 
                    onClick={() => setVisitorStatus("NOT_VISITED")}
                    className={cn(
                      "py-3 px-4 rounded-xl border text-[11px] font-black tracking-widest transition-all",
                      visitorStatus === "NOT_VISITED" ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    NOT VISITED
                  </button>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PRIVATE NOTES & FEEDBACK</h4>
                <textarea
                  placeholder="Notes about the buyer's interest, visit outcome, etc..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-24 p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none placeholder:text-slate-300 shadow-sm"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleFeedbackSubmit}
                disabled={isSubmitting || visitorStatus === "PENDING"}
                className="w-full h-14 bg-blue-600 hover:bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "SUBMIT FEEDBACK & COMPLETE"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

