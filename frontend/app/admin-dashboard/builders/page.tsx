"use client";

import { useEffect, useState } from "react";
import {
   Users,
   UserCheck,
   UserX,
   Clock,
   Search,
   Filter,
   MoreVertical,
   Mail,
   Phone,
   ShieldCheck,
   Loader2,
   AlertCircle,
   Home,
   ChevronRight,
   ChevronDown,
   CheckCircle2,
   UserCircle,
   Target,
   ChevronLeft,
   Briefcase,
   XCircle
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/admin/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import {
   DropdownMenu,

   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { api } from "@/lib/api";
import { toast } from "sonner";

export default function UserManagementPage() {
   const [users, setUsers] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("ALL");
   const [filterRole, setFilterRole] = useState("ALL");
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [stats, setStats] = useState({
      total: 0,
      builders: 0,
      sellers: 0,
      buyers: 0,
      brokers: 0,
      admins: 0,
   });
   const [processingId, setProcessingId] = useState<string | null>(null);
   const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);

   const { user: currentUser } = useAuth();
   const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
   const searchParams = useSearchParams();

   useEffect(() => {
      const status = searchParams.get('status');
      if (status) setFilterStatus(status.toUpperCase());

      const role = searchParams.get('role');
      if (role) setFilterRole(role.toUpperCase());
   }, [searchParams]);


   const fetchUsers = async () => {
      try {
         setIsLoading(true);
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "10",
            role: filterRole,
            status: filterStatus,
            search: searchTerm
         });
         const data = await api(`/auth/admin/builders?${params.toString()}`);
         setUsers(data.users);
         setTotalPages(data.totalPages);
         setStats(data.stats);
         setError(null);
      } catch (err: any) {
         setError(err.message || "Failed to fetch users");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchUsers();
   }, [currentPage, filterRole, filterStatus]);

   // Debounce search
   useEffect(() => {
      const timer = setTimeout(() => {
         if (currentPage !== 1) setCurrentPage(1);
         else fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const handleStatusUpdate = async (id: string, action: "approve" | "reject") => {
      try {
         setProcessingId(id);
         await api(`/auth/admin/${action}/${id}`, {
            method: "PUT",
         });

         toast.success(`User ${action === "approve" ? "approved" : "rejected"} successfully`);
         // Update local state
         setUsers(prev =>
            prev.map(u => u._id === id ? { ...u, status: action === "approve" ? "APPROVED" : "REJECTED" } : u)
         );
      } catch (err: any) {
         toast.error(err.message || "Failed to update user status");
      } finally {
         setProcessingId(null);
         fetchUsers(); // Refresh to get correct counts
      }
   };

   const filteredUsers = users; // Now handled by backend

   // Stats are now fetched from backend

   return (
      <>
         <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            {/* Page Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
               <div className="space-y-1">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tighter">User Management</h1>
                  <p className="text-gray-500 text-sm font-medium">Review identities and maintain the high standard of partners on your platform.</p>
               </div>
               <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative group flex-1 sm:flex-initial">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                     <input
                        type="text"
                        placeholder="Search name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full sm:w-64 shadow-sm"
                     />
                  </div>
                  <DropdownMenu>
                     <DropdownMenuTrigger className="h-11 rounded-xl border border-gray-200 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-6 bg-white flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm text-gray-700 shrink-0">
                        <Filter size={16} />
                        <span className="truncate max-w-[70px] sm:max-w-none">
                           {filterRole === "ALL" ? "Filters" : `Role: ${filterRole}`}
                        </span>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                        <DropdownMenuGroup>
                           <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 pb-2">Filter By Role</DropdownMenuLabel>
                           <DropdownMenuItem onClick={() => setFilterRole("ALL")} className="font-bold text-xs rounded-lg uppercase">ALL USERS</DropdownMenuItem>
                           <DropdownMenuSeparator />
                           {isSuperAdmin && (
                              <DropdownMenuItem onClick={() => setFilterRole("ADMIN")} className="font-bold text-xs rounded-lg uppercase text-indigo-600 focus:text-indigo-700">SUB-ADMINS</DropdownMenuItem>
                           )}
                           <DropdownMenuItem onClick={() => setFilterRole("BUILDER")} className="font-bold text-xs rounded-lg uppercase">BUILDERS</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setFilterRole("SELLER")} className="font-bold text-xs rounded-lg uppercase">SELLERS</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setFilterRole("BUYER")} className="font-bold text-xs rounded-lg uppercase">BUYERS</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setFilterRole("BROKER")} className="font-bold text-xs rounded-lg uppercase">BROKERS</DropdownMenuItem>
                        </DropdownMenuGroup>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

            {/* Dashboard-Style Summary Cards Container */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
               <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${isSuperAdmin ? 'xl:grid-cols-6' : 'xl:grid-cols-5'} gap-3`}>
                  {/* Total Users */}
                  <div
                     className="bg-[#eef2ff] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer"
                     onClick={() => { setFilterRole("ALL"); setFilterStatus("ALL"); }}
                  >
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <Users size={20} className="text-blue-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{stats.total}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Combined Cache</span>
                     </div>
                  </div>

                  {/* Admin Card for Super Admin */}
                  {isSuperAdmin && (
                     <div className="bg-[#ecfeff] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer" onClick={() => setFilterRole("ADMIN")}>
                        <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                           <ShieldCheck size={20} className="text-cyan-600" />
                        </div>
                        <div className="flex flex-col justify-center leading-tight min-w-0">
                           <span className="text-xl font-black text-gray-900">{stats.admins}</span>
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Sub-Admins</span>
                        </div>
                     </div>
                  )}

                  {/* Brokers */}
                  <div className="bg-[#fef3c7] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer" onClick={() => setFilterRole("BROKER")}>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <Briefcase size={20} className="text-amber-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{stats.brokers}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Brokers</span>
                     </div>
                  </div>

                  {/* Builders */}
                  <div className="bg-[#f5f3ff] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer" onClick={() => setFilterRole("BUILDER")}>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <UserCheck size={20} className="text-purple-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{stats.builders}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Builders</span>
                     </div>
                  </div>

                  {/* Sellers */}
                  <div className="bg-[#ecfdf5] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer" onClick={() => setFilterRole("SELLER")}>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <UserCircle size={20} className="text-emerald-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{stats.sellers}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Sellers</span>
                     </div>
                  </div>

                  {/* Buyers */}
                  <div className="bg-[#fff1f2] p-4 rounded-xl shadow-sm flex items-center gap-4 h-[80px] hover:shadow-md transition cursor-pointer col-span-2 md:col-span-1 xl:col-span-1" onClick={() => setFilterRole("BUYER")}>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/70 shadow-sm shrink-0">
                        <Target size={20} className="text-rose-500" />
                     </div>
                     <div className="flex flex-col justify-center leading-tight min-w-0">
                        <span className="text-xl font-black text-gray-900">{stats.buyers}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate sm:whitespace-normal">Buyers</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden shadow-blue-900/5">
               {/* Table Tabs */}
               <div className="flex border-b border-gray-50 bg-[#FBFBFC] px-4">
                  {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                     <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${filterStatus === status ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                           }`}
                     >
                        {status}
                        {filterStatus === status && <div className="absolute bottom-0 left-8 right-8 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-500" />}
                     </button>
                  ))}
               </div>

               {/* User List Table */}
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-gray-50/50 text-left">
                        <tr>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Name</th>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</th>
                           {/* <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</th> */}
                           <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Date</th>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                           <tr>
                              <td colSpan={5} className="px-8 py-20 text-center">
                                 <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching User Records...</p>
                                 </div>
                              </td>
                           </tr>
                        ) : filteredUsers.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                                 No users found matching your criteria.
                              </td>
                           </tr>
                        ) : (
                           filteredUsers.map((user) => (
                              <tr key={user._id} className="hover:bg-blue-50/10 transition-colors group">
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                          {user.name?.charAt(0) || "U"}
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900 leading-none">{user.name}</p>
                                          <p className="text-xs text-gray-400 font-medium mt-1">{user.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${user.role === "BUILDER" ? "bg-purple-50 text-purple-600" :
                                       user.role === "SELLER" ? "bg-emerald-50 text-emerald-600" :
                                          user.role === "BROKER" ? "bg-amber-50 text-amber-600" :
                                             "bg-rose-50 text-rose-600"
                                       }`}>
                                       {user.role}
                                    </span>
                                 </td>
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                       <Phone size={13} className="text-gray-400 shrink-0" />
                                       {user.phone ? user.phone : <span className="text-gray-300 font-medium">—</span>}
                                    </div>
                                 </td>
                                 {/* <td className="px-8 py-5">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                       user.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                          "bg-red-50 text-red-600 border-red-100"
                                       }`}>
                                       {user.status}
                                    </span>
                                 </td> */}
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                       <Clock size={14} className="text-gray-300" />
                                       {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       {user.status === "PENDING" && (
                                          <>
                                             <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(user._id, "approve")}
                                                disabled={processingId === user._id}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-xl h-9 px-4 shadow-lg shadow-emerald-500/10"
                                             >
                                                {processingId === user._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} className="mr-1.5" />}
                                                Approve
                                             </Button>
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(user._id, "reject")}
                                                disabled={processingId === user._id}
                                                className="border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] rounded-xl h-9 px-4"
                                             >
                                                {processingId === user._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} className="mr-1.5" />}
                                                Reject
                                             </Button>
                                          </>
                                       )}
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setSelectedUserDetails(user)}
                                          className="font-black text-[10px] rounded-xl h-9 px-4 text-gray-500 hover:text-blue-600 border-gray-200 hover:bg-blue-50"
                                       >
                                          View Details
                                       </Button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
               <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
               />
            </div>
         </div>

         <Dialog open={!!selectedUserDetails} onOpenChange={(open) => !open && setSelectedUserDetails(null)}>
            <DialogContent className="max-w-md sm:max-w-lg">
               <DialogHeader>
                  <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
               </DialogHeader>
               {selectedUserDetails && (
                  <div className="space-y-4 py-4 px-2">
                     <div className="flex items-center gap-4 border-b pb-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-2xl">
                           {selectedUserDetails.name?.charAt(0) || "U"}
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-gray-900">{selectedUserDetails.name}</h2>
                           <p className="text-sm text-gray-500 font-medium">{selectedUserDetails.email}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</p>
                           <p className="font-semibold text-gray-900 capitalize">{selectedUserDetails.role?.toLowerCase() || 'User'}</p>
                        </div>
                        {/* <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                           <p className="font-semibold text-gray-900">{selectedUserDetails.status}</p>
                        </div> */}
                        {/* <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registered Date</p>
                           <p className="font-semibold text-gray-900">{new Date(selectedUserDetails.createdAt).toLocaleDateString()}</p>
                        </div> */}
                        <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</p>
                           <p className="font-semibold text-gray-900 text-xs break-all">{selectedUserDetails.phone || "N/A"}</p>
                        </div>
                        {/* <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User ID</p>
                            <p className="font-semibold text-gray-900 text-xs break-all">{selectedUserDetails._id}</p>
                         </div> */}
                     </div>
                  </div>
               )}
            </DialogContent>
         </Dialog>
      </>
   );
}
