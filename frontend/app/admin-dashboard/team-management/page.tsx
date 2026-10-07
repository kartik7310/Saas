"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Plus,
  User as UserIcon,
  Users,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  X,
  History,
  Ban,
  CheckCircle2,
  XCircle,
  Calendar,
  Zap,
  BarChart3,
  AlertCircle,
  Clock,
  ChevronRight,
  UserCheck,
  Video
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

export default function TeamManagementPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Activity History State
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [activitiesFilterStatus, setActivitiesFilterStatus] = useState("ALL");
  const [activitiesFilterDate, setActivitiesFilterDate] = useState("");

  const filteredActivities = activities.filter(activity => {
    // For Users and Meetings, they use 'status' field, Properties use 'propertyApprovedStatus'
    const currentStatus = activity.type === "PROPERTY" ? activity.propertyApprovedStatus : activity.status;
    const matchesStatus = activitiesFilterStatus === "ALL" || currentStatus === activitiesFilterStatus;
    
    const activityDate = new Date(activity.updatedAt).toISOString().split('T')[0];
    const matchesDate = !activitiesFilterDate || activityDate === activitiesFilterDate;
    return matchesStatus && matchesDate;
  });

  // Stats for Filter Cards
  const activitiesStats = {
    TOTAL: activities.length,
    APPROVED: activities.filter(a => (a.propertyApprovedStatus === 'APPROVED' || a.status === 'APPROVED')).length,
    REJECTED: activities.filter(a => (a.propertyApprovedStatus === 'REJECTED' || a.status === 'REJECTED')).length,
    PENDING: activities.filter(a => (a.propertyApprovedStatus === 'PENDING' || a.status === 'PENDING')).length,
  };

  // Block Confirmation State
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [adminToToggle, setAdminToToggle] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await api("/auth/admin/list-admins");
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (admin: any) => {
    try {
      setSelectedAdmin(admin);
      setIsActivitiesModalOpen(true);
      setIsActivitiesLoading(true);
      const data = await api(`/auth/admin/activities/${admin._id}`);
      setActivities(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin activities");
      setIsActivitiesModalOpen(false);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const triggerToggleBlock = (admin: any) => {
    setAdminToToggle(admin);
    setIsBlockConfirmOpen(true);
  };

  const proceedToggleBlock = async () => {
    if (!adminToToggle) return;

    const isBlocked = adminToToggle.status === "BLOCKED";
    const newStatus = isBlocked ? "APPROVED" : "BLOCKED";

    try {
      setIsSubmitting(true);
      await api(`/auth/admin/toggle-status/${adminToToggle._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Admin account ${newStatus.toLowerCase()} successfully`);
      setIsBlockConfirmOpen(false);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPhoneError = () => {
    if (!formData.phone) return null;
    if (formData.phone.length > 0 && !/^[5-9]/.test(formData.phone)) {
      return "Must start with 5-9";
    }
    if (formData.phone.length < 10) {
      return "Must be 10 digits";
    }
    return null;
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneError = getPhoneError();
    if (phoneError) {
      toast.error(phoneError);
      return;
    }
    setIsSubmitting(true);
    try {
      await api("/auth/admin/create-admin", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success("Admin created successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", phone: "", location: "" });
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [teamFilterStatus, setTeamFilterStatus] = useState("ALL");

  const filteredAdmins = admins.filter(admin => {
    if (teamFilterStatus === "ALL") return true;
    if (teamFilterStatus === "ACTIVE") return admin.status !== "BLOCKED";
    if (teamFilterStatus === "BLOCKED") return admin.status === "BLOCKED";
    return true;
  });

  const teamStats = {
    TOTAL: admins.length,
    ACTIVE: admins.filter(a => a.status !== "BLOCKED").length,
    BLOCKED: admins.filter(a => a.status === "BLOCKED").length,
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="p-8 pb-32 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 px-2 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Team Core</div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Team Management</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Control sub-admin permissions and audit their operational history.</p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Create Admin</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse mb-8">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retrieving Team Data...</p>
        </div>
      ) : (
        <>
            {/* Dashboard-Style Summary Cards Container */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Total Admins */}
                  <div
                     className="bg-[#eef2ff] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer"
                     onClick={() => setTeamFilterStatus("ALL")}
                  >
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <Users size={20} className="text-blue-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{teamStats.TOTAL}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Total Sub-Admins</span>
                     </div>
                  </div>

                  {/* Active Admins */}
                  <div
                     className="bg-[#ecfdf5] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer"
                     onClick={() => setTeamFilterStatus("ACTIVE")}
                  >
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <ShieldCheck size={20} className="text-emerald-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{teamStats.ACTIVE}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Active Nodes</span>
                     </div>
                  </div>

                  {/* Blocked Admins */}
                  <div
                     className="bg-[#fff1f2] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer"
                     onClick={() => setTeamFilterStatus("BLOCKED")}
                  >
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <Ban size={20} className="text-rose-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{teamStats.BLOCKED}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Blocked Accounts</span>
                     </div>
                  </div>
               </div>
            </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-600" /> Administrative Cluster
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              {teamFilterStatus} FILTER: {filteredAdmins.length}
            </span>
          </div>

          {filteredAdmins.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <ShieldCheck size={48} />
              </div>
              <p className="font-black text-gray-900 text-xl tracking-tight">No Results Found</p>
              <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">No sub-admins match the currently selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metrics</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operational Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredAdmins.map((admin) => {
                    const isSelf = admin._id === currentUser?._id;
                    const isBlocked = admin.status === "BLOCKED";

                    return (
                      <tr key={admin._id} className={cn(
                        "hover:bg-slate-50/50 transition-colors group",
                        isBlocked && "bg-slate-50/80 grayscale-[0.8]"
                      )}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ring-4 ring-transparent transition-all",
                              isBlocked ? "bg-slate-200 text-slate-500 border-slate-300" : "bg-purple-50 text-purple-700 border-purple-100 group-hover:ring-purple-50"
                            )}>
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900 tracking-tight">{admin.name}</p>
                                {isBlocked && (
                                  <span className="bg-rose-100 text-rose-700 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase flex items-center gap-1">
                                    <Ban size={10} /> Account Blocked
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 transition-colors group-hover:text-purple-500">
                                {isSelf ? "System Anchor (You)" : `Joined ${new Date(admin.createdAt).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Mail size={14} className="text-slate-300" />
                            {admin.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <MapPin size={14} className={cn("text-slate-300", admin.location && "text-purple-400")} />
                            {admin.location || "UNLINKED"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                isBlocked ? "bg-slate-300" : "bg-emerald-500 animate-pulse"
                              )}></div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Status</span>
                            </div>
                            <span className="text-xs font-black text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4 tracking-tighter">
                              LEVEL 1 AUDITOR
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button
                              onClick={() => fetchActivities(admin)}
                              className="flex items-center gap-2 h-10 px-4 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black text-slate-700 hover:border-purple-200 hover:text-purple-700 hover:shadow-md transition-all active:scale-95 uppercase tracking-widest"
                            >
                              <History size={14} />Activities
                            </button>

                            {isSuperAdmin && !isSelf && (
                              <button
                                onClick={() => triggerToggleBlock(admin)}
                                className={cn(
                                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-95 border-2",
                                  isBlocked
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                                )}
                                title={isBlocked ? "Unblock Admin" : "Block Admin"}
                              >
                                {isBlocked ? <UserCheck size={18} /> : <Ban size={18} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      )}

      {/* ACTIVITIES HISTORY TERMINAL */}
      {isActivitiesModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsActivitiesModalOpen(false)}>
          <div
            className="bg-white h-full w-full max-w-2xl shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative">
              <div className="absolute top-0 left-0 h-1 bg-purple-600 w-full" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-purple-600" />
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em]">Audit Terminal</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Activities: {selectedAdmin?.name}</h2>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Complete ledger of properties, meetings, and users audited by this node.</p>
              </div>
              <button
                onClick={() => setIsActivitiesModalOpen(false)}
                className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {isActivitiesLoading ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Deciphering Ledger...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <AlertCircle size={40} />
                  </div>
                  <p className="font-black text-slate-800 text-lg uppercase tracking-tight">Zero Events Logged</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">This admin has not audited any properties, meetings, or accounts yet.</p>
                </div>
              ) : (
                <>
                  {/* CARD FILTERS (MATCHING REFERENCE IMAGE) */}
                  <div className="bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3">
                    <button 
                      onClick={() => setActivitiesFilterStatus("ALL")}
                      className={cn(
                        "flex-1 flex items-center gap-3 p-3 rounded-2xl transition-all border bg-[#f0f4ff]",
                        activitiesFilterStatus === "ALL" 
                          ? "border-[#3b82f6] shadow-md ring-4 ring-blue-500/5 translate-y-[-2px]" 
                          : "border-[#dbeafe] hover:border-[#3b82f6]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <BarChart3 size={18} className="text-[#3b82f6]" />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-black text-slate-800 leading-none">{activitiesStats.TOTAL}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 whitespace-nowrap">Total Activity</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActivitiesFilterStatus("APPROVED")}
                      className={cn(
                        "flex-1 flex items-center gap-3 p-3 rounded-2xl transition-all border bg-[#edfaf3]",
                        activitiesFilterStatus === "APPROVED" 
                          ? "border-[#10b981] shadow-md ring-4 ring-emerald-500/5 translate-y-[-2px]" 
                          : "border-[#d1fae5] hover:border-[#10b981]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <CheckCircle2 size={18} className="text-[#10b981]" />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-black text-slate-800 leading-none">{activitiesStats.APPROVED}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 whitespace-nowrap">Approved</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActivitiesFilterStatus("REJECTED")}
                      className={cn(
                        "flex-1 flex items-center gap-3 p-3 rounded-2xl transition-all border bg-[#fff8ed]",
                        activitiesFilterStatus === "REJECTED" 
                          ? "border-[#f59e0b] shadow-md ring-4 ring-amber-500/5 translate-y-[-2px]" 
                          : "border-[#fef3c7] hover:border-[#f59e0b]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                        <XCircle size={18} className="text-[#f59e0b]" />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-black text-slate-800 leading-none">{activitiesStats.REJECTED}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 whitespace-nowrap">Rejected</p>
                      </div>
                    </button>
                  </div>

                  {/* DATE FILTER (Refined) */}
                  <div className="bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Audit Calendar</p>
                      <input 
                        type="date" 
                        value={activitiesFilterDate}
                        onChange={(e) => setActivitiesFilterDate(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-xs font-black text-slate-900 focus:ring-0 cursor-pointer h-4"
                      />
                    </div>
                    {activitiesFilterDate && (
                      <button 
                        onClick={() => setActivitiesFilterDate("")}
                        className="h-8 px-3 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* ACTIVITY LIST */}
                  <div className="grid gap-4">
                    {filteredActivities.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No matching activities found</p>
                      </div>
                    ) : (
                      filteredActivities.map((activity) => (
                        <div key={activity._id} className="p-6 bg-white border-2 border-slate-100 rounded-[2.2rem] hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/5 transition-all group relative overflow-hidden">
                          <div className={cn(
                            "absolute top-0 right-0 h-1 font-black transition-all group-hover:w-full w-0",
                            activity.type === 'PROPERTY' ? "bg-blue-500" : 
                            activity.type === 'MEETING' ? "bg-purple-500" : "bg-emerald-500"
                          )} />

                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              {/* Status Badge */}
                              <span className={cn(
                                "px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 tracking-widest flex items-center gap-1.5",
                                (activity.propertyApprovedStatus === 'APPROVED' || activity.status === 'APPROVED') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  (activity.propertyApprovedStatus === 'REJECTED' || activity.status === 'REJECTED') ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    "bg-amber-50 text-amber-600 border-amber-100"
                              )}>
                                {(activity.propertyApprovedStatus === 'APPROVED' || activity.status === 'APPROVED') ? <CheckCircle2 size={12} /> :
                                  (activity.propertyApprovedStatus === 'REJECTED' || activity.status === 'REJECTED') ? <XCircle size={12} /> : <Clock size={12} />}
                                {activity.type === 'PROPERTY' ? activity.propertyApprovedStatus : activity.status}
                              </span>

                              {/* Type/Context Badge */}
                              <span className={cn(
                                "px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 tracking-widest flex items-center gap-1.5",
                                activity.type === 'PROPERTY' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                activity.type === 'MEETING' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                              )}>
                                {activity.type === 'PROPERTY' ? <ShieldCheck size={12} /> :
                                 activity.type === 'MEETING' ? <Video size={12} /> : <UserIcon size={12} />}
                                {activity.type}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-xl">
                              {new Date(activity.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.updatedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-lg font-black text-slate-900 tracking-tighter group-hover:text-purple-600 transition-colors mb-1">
                            {activity.displayTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                             <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] uppercase tracking-wider text-slate-500">{activity.displayContext}</div>
                             {activity.location?.city && (
                               <div className="flex items-center gap-1">
                                 <MapPin size={12} className="text-slate-200" />
                                 {activity.location?.city}
                               </div>
                             )}
                          </div>

                          <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               {activity.type === 'PROPERTY' ? (
                                  <>
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                      {activity.createdBy?.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Source Owner</p>
                                      <p className="text-[11px] font-bold text-slate-700">{activity.createdBy?.name} <span className="text-slate-300 ml-1 opacity-60">({activity.createdBy?.role})</span></p>
                                    </div>
                                  </>
                               ) : activity.type === 'MEETING' ? (
                                  <>
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                      {activity.attendeeId?.name?.charAt(0) || activity.attendeeName?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Attendee Name</p>
                                      <p className="text-[11px] font-bold text-slate-700">{activity.attendeeId?.name || activity.attendeeName}</p>
                                    </div>
                                  </>
                               ) : (
                                  <>
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                      {activity.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Audited Entity</p>
                                      <p className="text-[11px] font-bold text-slate-700">{activity.name} <span className="text-slate-300 ml-1 opacity-60">({activity.email})</span></p>
                                    </div>
                                  </>
                               )}
                            </div>
                            <ChevronRight size={16} className="text-slate-200 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-white">
              <button
                onClick={() => setIsActivitiesModalOpen(false)}
                className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-[1.5rem] shadow-xl shadow-slate-900/20 transition-all active:scale-95"
              >
                Close Activity Monitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK CONFIRMATION MODAL (Shadcn UI style) */}
      {isBlockConfirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsBlockConfirmOpen(false)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className={cn(
              "p-10 text-white text-center relative overflow-hidden",
              adminToToggle?.status === "BLOCKED" ? "bg-emerald-600" : "bg-rose-600"
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                {adminToToggle?.status === "BLOCKED" ? <UserCheck size={120} /> : <Ban size={120} />}
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md">
                  {adminToToggle?.status === "BLOCKED" ? <UserCheck size={40} /> : <Ban size={40} />}
                </div>
                <h3 className="font-black text-2xl tracking-tighter">
                  {adminToToggle?.status === "BLOCKED" ? "Restore Access?" : "Confirm Block?"}
                </h3>
                <p className="text-white/80 text-sm font-medium mt-2 leading-relaxed">
                  {adminToToggle?.status === "BLOCKED"
                    ? `You are about to re-activate ${adminToToggle.name}'s administrator account.`
                    : `This will immediately terminate ${adminToToggle.name}'s active sessions and access to the dashboard.`}
                </p>
              </div>
            </div>

            <div className="p-10 bg-white">
              <div className="space-y-4">
                <button
                  onClick={proceedToggleBlock}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full h-14 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50",
                    adminToToggle?.status === "BLOCKED"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                  )}
                >
                  {isSubmitting ? "PROCESSING..." : (adminToToggle?.status === "BLOCKED" ? "UNBLOCK OPERATOR" : "EXECUTE BLOCK")}
                </button>
                <button
                  onClick={() => setIsBlockConfirmOpen(false)}
                  className="w-full h-14 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-slate-50/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Plus size={100} />
              </div>
              <div className="relative z-10">
                <h3 className="font-black text-2xl text-gray-900 tracking-tighter">Onboard Sub-Admin</h3>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Expand the administrative cluster with a new operator.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-10 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <UserIcon size={12} /> Agent Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm shadow-inner"
                    placeholder="Enter operator name..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Mail size={12} /> Secure Email Handle *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm shadow-inner"
                    placeholder="system@link2builder.com"
                  />
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Phone size={12} /> Direct Contact
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 outline-none focus:ring-4 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm shadow-inner",
                        getPhoneError() 
                          ? "border-amber-400 focus:ring-amber-500/10 focus:border-amber-500" 
                          : formData.phone.length === 10 
                            ? "border-emerald-400 focus:ring-emerald-500/10 focus:border-emerald-500"
                            : "border-slate-100 focus:ring-purple-500/10 focus:border-purple-500"
                      )}
                      placeholder="e.g. 9876543210"
                    />
                    {getPhoneError() && (
                      <p className="text-[10px] font-black text-amber-500 mt-1.5 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                        {getPhoneError()}
                      </p>
                    )}
                    {!getPhoneError() && formData.phone.length === 10 && (
                      <p className="text-[10px] font-black text-emerald-500 mt-1.5 uppercase tracking-widest animate-in fade-in">
                        Verified Format
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MapPin size={12} /> Geolocation
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-800 placeholder:text-slate-300 text-sm shadow-inner"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-14 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[1.5rem] transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs tracking-widest rounded-[1.5rem] shadow-xl shadow-purple-600/30 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                >
                  {isSubmitting ? <span className="animate-pulse">Writing Protocol...</span> : "Establish Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
