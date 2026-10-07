"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Video, User, Loader2, Home, Tag, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export default function BuyerMeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [interestLevel, setInterestLevel] = useState("MEDIUM");
  const [visitStatus, setVisitStatus] = useState("VISITED");
  const [visitDate, setVisitDate] = useState("");
  const [joinedMeetingIds, setJoinedMeetingIds] = useState<string[]>([]);
  const [finishedMeetingIds, setFinishedMeetingIds] = useState<string[]>([]);
  const [infoModalMessage, setInfoModalMessage] = useState("");

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const data = await api("/meetings/upcoming");
      setMeetings(data);
    } catch (err: any) {
      toast.error("Failed to fetch your meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

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
      setInfoModalMessage(err.message || "Firstly admin will start meeting");
    }
  };

  const approvedMeetings = meetings.filter(m => m.status === "APPROVED" || m.status === "IN_PROGRESS");
  const pendingMeetings = meetings.filter(m => m.status === "PENDING");
  const rejectedMeetings = meetings.filter(m => m.status === "REJECTED");
  const completedMeetings = meetings.filter(m => m.status === "COMPLETED");
  const meetingLink = "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  const MeetingCard = ({ meeting, isPending = false }: { meeting: any, isPending?: boolean }) => (
    <div
      key={meeting._id}
      className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row group min-h-[250px]"
    >

      {/* 1. Property Image Section */}
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
                meeting.status === "PENDING" ? "bg-amber-500" : "bg-rose-500"
            )}>
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              {meeting.status}
            </span>
          </div>
        </div>
      </div>
      {/* 2. Content Section (Original Flexbox structure) */}
      <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between">
        <div>
          {/* HEADER SECTION */}
          <div className="flex flex-col mb-4">
            <h2 className="text-xl font-bold text-[#2563eb] tracking-tighter mb-0.5 leading-none">{meeting.propertyTitle}</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              PROPERTY ID: <span className="text-slate-500">{(meeting.propertyId?._id || "MEET").toUpperCase()}</span>
            </p>
          </div>

          {/* BADGES ROW */}
          <div className="flex items-center gap-3 mb-8">
            <div className="px-4 py-1 bg-[#f5f9ff] border border-[#e3efff] rounded-xl flex flex-col min-w-[100px]">
              <span className="text-[8px] font-black text-[#5698ff] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Tag className="w-2.5 h-2.5" /> CATEGORY
              </span>
              <span className="text-xs font-black text-[#2563eb] uppercase tracking-tight">
                {meeting.propertyId?.listingType || "RESIDENTIAL"}
              </span>
            </div>

            <div className="px-4 py-1 bg-[#f1faf6] border border-[#e0f3eb] rounded-xl flex flex-col min-w-[100px]">
              <span className="text-[8px] font-black text-[#00c581] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MapPin className="w-2.5 h-2.5" /> LOCATION
              </span>
              <span className="text-xs font-black text-[#007f52] uppercase tracking-tight">
                {meeting.propertyId?.location?.city || "Bangalore"}
              </span>
            </div>

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

        {/* FOOTER: MEETING INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100/80">
          <div className="flex items-start gap-2">
            <User className="w-3.5 h-3.5 text-slate-300" />
            <div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">HOST DETAIL</p>
              <p className="text-sm font-black text-slate-800 tracking-tighter leading-none">{meeting.hostId?.name || "Owner"}</p>
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

          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">MEETING TIME</p>
              <p className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">{meeting.time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FAR RIGHT: ACTION AREA */}
      <div className="w-full lg:w-[130px] shrink-0 border-l border-slate-100/80 bg-slate-50/10 flex flex-col items-center justify-center p-4 gap-2.5">
        {meeting.status === "REJECTED" ? (
          <Button
            onClick={() => {
              router.push(`/book-vc?rescheduleId=${meeting._id}`);
            }}
            className="w-full h-12 bg-rose-600 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 group"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>RESCHEDULE</span>
          </Button>
        ) : !isPending ? (
          <>
            {meeting.siteVisit?.buyerUpdatedAt ? (
              <div className="w-full h-12 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-emerald-600 font-black tracking-widest text-[9px] uppercase text-center gap-1 shadow-sm">
                <CheckCircle2 size={14} />
                <span>{meeting.siteVisit.buyerStatus === 'VISITED' ? 'VISITED' : 'SUBMITTED'}</span>
              </div>
            ) : (finishedMeetingIds.includes(meeting._id) || meeting.status === "COMPLETED") ? (
              <Button
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setVisitDate(new Date(meeting.date).toISOString().split('T')[0]);
                  setIsModalOpen(true);
                }}
                className="w-full h-12 bg-indigo-600 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 group"
              >
                <MapPin size={14} className="group-hover:scale-110 transition-transform" />
                <span>SITE VISIT</span>
              </Button>
            ) : (meeting.joinedBy || joinedMeetingIds.includes(meeting._id)) ? (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={() => window.open(meeting.meetingLink || "https://us05web.zoom.us/j/84225365912?pwd=HRAycPfEstZ7x5gwmdTZhFTVv5yB1I.1", "_blank")}
                  className="w-full h-9 bg-[#2563eb] text-white text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
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
              <Button
                onClick={() => handleJoin(meeting)}
                className="w-full h-12 bg-[#2563eb] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-50 flex items-center justify-center gap-2 active:scale-95 px-3"
              >
                <Video size={14} />
                <span>JOIN</span>
              </Button>
            )}

            {/* Show Overall Status badge if Visited */}
            {meeting.siteVisit?.status === 'VISITED' && !meeting.siteVisit?.buyerUpdatedAt && (
              <span className="text-[8px] font-black text-emerald-500 uppercase">Confirmed Visit</span>
            )}
          </>
        ) : (
          <div className="w-full h-12 bg-slate-50/50 rounded-xl border border-dotted border-slate-200 flex flex-col items-center justify-center text-slate-300 font-black italic tracking-widest text-[9px] uppercase text-center gap-1">
            <Clock size={14} className="animate-pulse" />
            WAITING
          </div>
        )}
      </div>
    </div>
  );


  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My Video Meetings</h1>
        <p className="text-slate-500 font-medium font-bold">Track and join your scheduled property tours with owners and agents.</p>
      </div>

      <div className="space-y-12">
        {/* ACTIVE MEETINGS */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <Video className="w-4 h-4" />
              Approved & Ready to Join
            </h2>
            <div className="h-px flex-1 bg-slate-100 ml-6 opacity-60"></div>
          </div>

          <div className="space-y-6">
            {approvedMeetings.length === 0 ? (
              <div className="bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 p-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <Video className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No approved meetings yet</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-bold tracking-tight">Once the admin approves your video call requests, you can join them directly from here.</p>
              </div>
            ) : (
              approvedMeetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))
            )}
          </div>
        </section>
        {/* Just for testing */}
        {/* PENDING REQUESTS */}
        {pendingMeetings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Approvals
              </h2>
              <div className="h-px flex-1 bg-slate-100 ml-6 opacity-60"></div>
            </div>

            <div className="space-y-6">
              {pendingMeetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} isPending />
              ))}
            </div>
          </section>
        )}
        {/* REJECTED REQUESTS */}
        {rejectedMeetings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Rejected / Need Action
              </h2>
              <div className="h-px flex-1 bg-slate-100 ml-6 opacity-60"></div>
            </div>

            <div className="space-y-6">
              {rejectedMeetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))}
            </div>
          </section>
        )}

        {/* COMPLETED REQUESTS */}
        {completedMeetings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed Meetings
              </h2>
              <div className="h-px flex-1 bg-slate-100 ml-6 opacity-60"></div>
            </div>

            <div className="space-y-6 opacity-80">
              {completedMeetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))}
            </div>
          </section>
        )}
      </div>
            {/* Site Visit Update Modal */}
            {isModalOpen && selectedMeeting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
                <div
                  className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white relative h-28">
                    <h3 className="text-xl font-black tracking-tight mb-1">Update Site Visit!</h3>
                    <p className="text-[10px] font-medium text-indigo-50 opacity-90 leading-tight pr-12">Please provide a quick update on your physical property tour.</p>
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Visit Location Info */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Physical Visit At</p>
                        <p className="text-xs font-black text-slate-800 leading-tight">{selectedMeeting.propertyTitle} at {selectedMeeting.propertyId?.location?.city}</p>
                      </div>
                    </div>

                    {/* Status Picker (Visited/Not Visited) */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DID YOU VISIT?</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setVisitStatus("VISITED")}
                          className={cn(
                            "py-3 px-4 rounded-xl border text-[11px] font-black tracking-widest transition-all",
                            visitStatus === "VISITED" ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          VISITED
                        </button>
                        <button
                          onClick={() => setVisitStatus("NOT_VISITED")}
                          className={cn(
                            "py-3 px-4 rounded-xl border text-[11px] font-black tracking-widest transition-all",
                            visitStatus === "NOT_VISITED" ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          NOT VISITED
                        </button>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WHEN DID YOU VISIT?</h4>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="date"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer"
                        />
                      </div>
                    </div>



                    {/* Feedback Textarea */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes & Feedback</h4>
                      <textarea
                        placeholder="Briefly describe the visit experience..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-20 p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-300 shadow-sm"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={async () => {
                        try {
                          setSubmitting(true);
                          await api(`/meetings/${selectedMeeting._id}/site-visit-feedback`, {
                            method: "PATCH",
                            body: JSON.stringify({
                              feedback,
                              interestLevel,
                              siteVisitStatus: visitStatus,
                              visitDate // Optional, if you want to store it in backend
                            })
                          });
                          toast.success("Site visit updated successfully!");
                          setIsModalOpen(false);
                          fetchMeetings();
                        } catch (err: any) {
                          toast.error(err.message || "Failed to update site visit");
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      disabled={submitting}
                      className="w-full h-14 bg-indigo-600 hover:bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70 mt-2"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "SUBMIT UPDATE & RESUME SESSION"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}


            {/* Info Modal */}
            {infoModalMessage && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setInfoModalMessage("")}>
                <div
                  className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative flex flex-col items-center justify-center text-center">
                    <AlertTriangle className="w-10 h-10 text-white/90 mb-3" />
                    <h3 className="text-xl font-black tracking-tight mb-1">Notice</h3>
                  </div>

                  <div className="p-6 space-y-6 text-center">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{infoModalMessage}</p>
                    <Button
                      onClick={() => setInfoModalMessage("")}
                      className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-xl transition-all active:scale-95 mt-2"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
}

