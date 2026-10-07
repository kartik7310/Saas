"use client";

import { useState, useEffect } from "react";
import { 
    X, 
    Calendar as CalendarIcon, 
    Clock, 
    User, 
    Mail, 
    Users, 
    Loader2, 
    CheckCircle2,
    CalendarCheck2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ScheduleMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ScheduleMeetingModal({ isOpen, onClose, onSuccess }: ScheduleMeetingModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [buyerEmail, setBuyerEmail] = useState("");
    const [buyerName, setBuyerName] = useState("");
    const [isFetchingBuyer, setIsFetchingBuyer] = useState(false);
    
    const [proEmail, setProEmail] = useState("");
    const [proName, setProName] = useState("");
    const [isFetchingPro, setIsFetchingPro] = useState(false);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // Debounce for Buyer Email
    useEffect(() => {
        const timer = setTimeout(() => {
            if (buyerEmail && buyerEmail.includes("@")) {
                fetchUserDetails(buyerEmail, setBuyerName, setIsFetchingBuyer);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [buyerEmail]);

    // Debounce for Pro Email
    useEffect(() => {
        const timer = setTimeout(() => {
            if (proEmail && proEmail.includes("@")) {
                fetchUserDetails(proEmail, setProName, setIsFetchingPro);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [proEmail]);

    const fetchUserDetails = async (email: string, setName: (name: string) => void, setFetching: (val: boolean) => void) => {
        try {
            setFetching(true);
            const data = await api(`/users/admin/search-by-email?email=${email}`);
            setName(data.name);
        } catch (err) {
            // Silence 404s for auto-fill
            setName("");
        } finally {
            setFetching(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!buyerEmail || !proEmail || !date || !time) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setIsLoading(true);
            await api("/meetings/schedule", {
                method: "POST",
                body: JSON.stringify({
                    buyerEmail,
                    buyerName,
                    proEmail,
                    proName,
                    date,
                    time
                })
            });
            toast.success("Meeting scheduled successfully!");
            onSuccess();
            onClose();
            // Reset form
            setBuyerEmail("");
            setBuyerName("");
            setProEmail("");
            setProName("");
            setDate("");
            setTime("");
        } catch (err: any) {
            toast.error(err.message || "Failed to schedule meeting");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-6 right-6 z-10">
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <CalendarCheck2 size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Scheduling</h2>
                            <p className="text-slate-500 text-sm font-medium">Create a new consultation session between users.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSchedule} className="space-y-6">
                        {/* Participants Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Buyer Info */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Buyer Details</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="email"
                                            placeholder="Buyer Email"
                                            value={buyerEmail}
                                            onChange={(e) => setBuyerEmail(e.target.value)}
                                            required
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buyer Name"
                                            value={buyerName}
                                            onChange={(e) => setBuyerName(e.target.value)}
                                            className="w-full h-12 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        />
                                        {isFetchingBuyer && (
                                            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                                        )}
                                        {!isFetchingBuyer && buyerName && (
                                            <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Pro Info */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Host Details</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="email"
                                            placeholder="Builder/Broker Email"
                                            value={proEmail}
                                            onChange={(e) => setProEmail(e.target.value)}
                                            required
                                            className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Host Name"
                                            value={proName}
                                            onChange={(e) => setProName(e.target.value)}
                                            className="w-full h-12 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                        />
                                        {isFetchingPro && (
                                            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                                        )}
                                        {!isFetchingPro && proName && (
                                            <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                             <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Scheduled Date</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Scheduled Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium appearance-none"
                                    >
                                        <option value="">Select Slot</option>
                                        {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest border-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] h-14 rounded-2xl text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Save & Schedule Session"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
