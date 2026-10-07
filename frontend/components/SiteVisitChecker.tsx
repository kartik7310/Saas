"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SiteVisitChecker({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const [pendingVisit, setPendingVisit] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [interestLevel, setInterestLevel] = useState<string>("");
    const [visitorStatus, setVisitorStatus] = useState<string>("");
    const [isFetchingPending, setIsFetchingPending] = useState(false);

    useEffect(() => {
        if (!authLoading && user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            const checkPending = async () => {
                try {
                    setIsFetchingPending(true);
                    const data = await api("/meetings/pending-site-visit");
                    if (data && data._id) {
                        setPendingVisit(data);
                    } else {
                        setPendingVisit(null);
                    }
                } catch (err) {
                    console.error("Failed to check pending site visits", err);
                } finally {
                    setIsFetchingPending(false);
                }
            };
            checkPending();
        }
    }, [user, authLoading]);

    const handleUpdate = async () => {
        if (!feedback) {
            toast.error("Please provide feedback");
            return;
        }
        if (user?.role === 'BUYER' && !interestLevel) {
            toast.error("Please select interest level");
            return;
        }
        if (user?.role !== 'BUYER' && !visitorStatus) {
            toast.error("Please select visitor status");
            return;
        }

        try {
            setIsUpdating(true);
            await api(`/meetings/${pendingVisit._id}/site-visit-feedback`, {
                method: "PATCH",
                body: JSON.stringify({
                    feedback,
                    interestLevel,
                    visitorStatus
                })
            });
            toast.success("Site visit updated. You can now proceed.");
            setPendingVisit(null);
        } catch (err: any) {
            toast.error(err.message || "Failed to update site visit");
        } finally {
            setIsUpdating(false);
        }
    };

    if (pendingVisit) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <AlertCircle size={120} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-2 relative z-10">Update Site Visit!</h2>
                        <p className="text-amber-50/80 text-sm font-medium relative z-10 leading-relaxed">
                            To maintain transparency and listing health, please provide feedback on your last site visit.
                        </p>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 space-y-3 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600 border border-slate-100">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Physical Visit At</p>
                                    <h4 className="font-bold text-slate-800 line-clamp-1">{pendingVisit.propertyId?.title || pendingVisit.propertyTitle}</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 pt-3 border-t border-slate-200/50">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400 font-bold" />
                                    <span className="text-xs font-black text-slate-600">
                                        {new Date(pendingVisit.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400 font-bold" />
                                    <span className="text-xs font-black text-slate-600 uppercase">{pendingVisit.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {user?.role === 'BUYER' ? (
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                        How was your interest level?
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setInterestLevel(level)}
                                                className={cn(
                                                    "px-3 py-3 rounded-2xl text-[11px] font-black tracking-tighter transition-all border-2",
                                                    interestLevel === level 
                                                        ? "bg-amber-600 text-white border-amber-600 shadow-xl shadow-amber-600/20 scale-105" 
                                                        : "bg-white text-slate-500 border-slate-100 hover:border-amber-200"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Did the visitor show up?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setVisitorStatus('SHOWED_UP')}
                                            className={cn(
                                                "px-3 py-3 rounded-2xl text-[11px] font-black tracking-tighter transition-all border-2",
                                                visitorStatus === 'SHOWED_UP' 
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20 scale-105" 
                                                    : "bg-white text-slate-500 border-slate-100 hover:border-emerald-200"
                                            )}
                                        >
                                            COMPLETED
                                        </button>
                                        <button
                                            onClick={() => setVisitorStatus('NO_SHOW')}
                                            className={cn(
                                                "px-3 py-3 rounded-2xl text-[11px] font-black tracking-tighter transition-all border-2",
                                                visitorStatus === 'NO_SHOW' 
                                                    ? "bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-600/20 scale-105" 
                                                    : "bg-white text-slate-500 border-slate-100 hover:border-rose-200"
                                            )}
                                        >
                                            NO SHOW
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Notes & Feedback</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Briefly describe the visit experience..."
                                    className="w-full h-28 p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium resize-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                             <Button 
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-2xl shadow-slate-900/40 transition-all group active:scale-95"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Saving Update...</span>
                                    </div>
                                ) : "Submit Update & Resume Session"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
