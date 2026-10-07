"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Phone, 
  User, 
  Home, 
  MessageSquare,
  Loader2,
  AlertCircle,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import Pagination from "@/components/admin/Pagination";

interface Lead {
  _id: string;
  buyerName: string;
  buyerMobile: string;
  message: string;
  status: string;
  propertyTitle: string;
  propertyLocation: string;
  ownerName: string;
  ownerRole: string;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    notInterested: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, [currentPage, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchLeads();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        status: statusFilter,
        search: searchQuery
      });
      const response = await api(`/leads/admin/all?${params.toString()}`);
      if (response.success) {
        setLeads(response.data);
        setTotalPages(response.totalPages);
        setStats(response.stats);
      } else {
        throw new Error(response.message || "Failed to fetch leads");
      }
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setError(err.message || "Something went wrong while loading leads");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads; // Now handled by backend

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Contacted": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Interested": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Not Interested": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  // Stats are now fetched from backend

  const statCards = [
    { label: "Total Leads", count: stats.total, filter: "All", icon: Briefcase, bg: "#eef2ff", iconColor: "text-blue-500" },
    { label: "New Leads", count: stats.new, filter: "New", icon: AlertCircle, bg: "#ecfdf5", iconColor: "text-green-500" },
    { label: "Connected", count: stats.contacted, filter: "Contacted", icon: Phone, bg: "#fef3c7", iconColor: "text-amber-500" },
    { label: "Interested", count: stats.interested, filter: "Interested", icon: MessageSquare, bg: "#f5f3ff", iconColor: "text-purple-500" },
    { label: "Not Interested", count: stats.notInterested, filter: "Not Interested", icon: AlertCircle, bg: "#fff1f2", iconColor: "text-red-500" },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "BUILDER": return "text-purple-600 bg-purple-50";
      case "SELLER": return "text-indigo-600 bg-indigo-50";
      case "BROKER": return "text-amber-600 bg-amber-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Briefcase size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global CRM</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Leads Management</h1>
          <p className="text-gray-500 text-sm font-medium">Track interactions between buyers and property owners across the platform.</p>
        </div>
      </div>

      {/* Modern Dashboard-Style Summary Cards */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((item, idx) => (
               <div 
                  key={idx} 
                  className="relative group cursor-pointer transition-all duration-300"
                  onClick={() => setStatusFilter(item.filter)}
               >
                  <div 
                     className="flex items-center gap-4 p-4 rounded-xl shadow-sm h-[80px] hover:shadow-md transition-all" 
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

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search by buyer, owner or property..." 
            className="h-12 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 min-w-[200px]">
             <Filter size={16} className="text-gray-400" />
             <select 
                className="bg-transparent text-sm font-bold text-gray-600 outline-none w-full cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="All">All Statuses</option>
               <option value="New">New</option>
               <option value="Contacted">Contacted</option>
               <option value="Interested">Interested</option>
               <option value="Not Interested">Not Interested</option>
             </select>
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-gray-100 bg-gray-50 text-gray-400">
            <ArrowUpDown size={20} />
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Lead Interactions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">Sync Failed</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">{error}</p>
            <Button onClick={fetchLeads} variant="outline" className="mt-6 rounded-xl border-red-100 text-red-600 hover:bg-red-50">Retry Connection</Button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-4">
              <Briefcase size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">No Leads Found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Adjust your filters or wait for more property inquiries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Buyer Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Owner</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Information</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Location</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Inquiry status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="group hover:bg-blue-50/30 transition-all border-b border-gray-50">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">{format(new Date(lead.createdAt), "dd MMM yyyy")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900 tracking-tight">{lead.buyerName}</p>
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px]">
                          <Phone size={10} />
                          {lead.buyerMobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-black text-gray-900 tracking-tight">{lead.ownerName}</p>
                           <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${getRoleColor(lead.ownerRole)}`}>
                             {lead.ownerRole}
                           </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">Ownership verified</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
                           <Home size={18} />
                         </div>
                         <div className="space-y-0.5">
                           <p className="text-xs font-black text-gray-900 tracking-tight line-clamp-1">{lead.propertyTitle}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Property ID: {lead._id.slice(-6)}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                         <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">{lead.propertyLocation || "Not Set"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
        <p>System Logs: {filteredLeads.length} Lead records synchronized</p>
        <p>Last Sync: Just Now</p>
      </div>
    </div>
  );
}
