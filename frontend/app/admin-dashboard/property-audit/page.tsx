"use client";

import { useEffect, useState } from "react";
import {
   Building,
   MapPin,
   Phone,
   Mail,
   CheckCircle,
   LayoutGrid,
   CheckCircle2,
   XCircle,
   Loader2,
   ChevronRight,
   AlertCircle,
   FileText,
   BadgeCheck,
   X,
   Eye,
   ChevronLeft,
   ChevronRight as ChevronRightIcon,
   Calendar,
   User as UserIcon,
   Search,
   ListFilter,
   Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Pagination from "@/components/admin/Pagination";
import { formatPrice } from "@/lib/utils";
import PropertyViewModal from "@/components/PropertyViewModal";


export default function PropertyAuditWorkspace() {
   const [properties, setProperties] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isProcessing, setIsProcessing] = useState(false);
   const [showRejectPanel, setShowRejectPanel] = useState(false);
   const [selectedProperty, setSelectedProperty] = useState<any>(null);
   const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null);
   const [rejectionReason, setRejectionReason] = useState("");
   const [rejectionComments, setRejectionComments] = useState("");

   const [searchTerm, setSearchTerm] = useState("");
   const [typeFilter, setTypeFilter] = useState("ALL");
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [stats, setStats] = useState({
      total: 0,
      residential: 0,
      commercial: 0,
   });

   // Gallery States
   const [isGalleryOpen, setIsGalleryOpen] = useState(false);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   const fetchPending = async () => {
      try {
         setIsLoading(true);
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "10",
            listingType: typeFilter,
            search: searchTerm
         });
         const data = await api(`/admin/audit/pending-properties?${params.toString()}`);
         setProperties(data.properties || []);
         setTotalPages(data.totalPages || 1);
         if (data.stats) setStats(data.stats);
      } catch (err: any) {
         toast.error(err.message || "Failed to fetch pending properties");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchPending();
   }, [currentPage, typeFilter]);

   // Debounce search
   useEffect(() => {
      const timer = setTimeout(() => {
         if (currentPage !== 1) setCurrentPage(1);
         else fetchPending();
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const filteredProperties = properties; // Now handled by backend

   // Admin video management
   const [ytLinks, setYtLinks] = useState<Record<string, string>>({});
   const handleYtChange = (id: string, val: string) => setYtLinks(prev => ({ ...prev, [id]: val }));

   const updateYoutubeLink = async (propertyId: string, link: string) => {
      try {
         await api(`/admin/audit/update-media/${propertyId}`, {
            method: "PATCH",
            body: JSON.stringify({ youtubeLink: link })
         });
         toast.success("YouTube link saved");
         fetchPending();
      } catch (err: unknown) {
         toast.error((err as Error).message || "Failed to save YouTube link");
      }
   };

   const deleteVideo = async (propertyId: string) => {
      if (!confirm("Delete this video from the server?")) return;
      try {
         await api(`/admin/audit/property-video/${propertyId}`, { method: "DELETE" });
         toast.success("Video deleted");
         fetchPending();
      } catch (err: unknown) {
         toast.error((err as Error).message || "Failed to delete video");
      }
   };

   // Stats are now fetched from backend

   const statCards = [
      { label: "Pending All", count: stats.total, filter: "ALL", icon: FileText, bg: "#eef2ff", iconColor: "text-blue-500" },
      { label: "Residential", count: stats.residential, filter: "RESIDENTIAL", icon: Home, bg: "#ecfdf5", iconColor: "text-emerald-500" },
      { label: "Commercial", count: stats.commercial, filter: "COMMERCIAL", icon: Building, bg: "#fffbeb", iconColor: "text-amber-500" },
   ];

   const handleApprove = async (id: string) => {
      try {
         setIsProcessing(true);
         await api(`/admin/audit/update-property-status/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "APPROVED" }),
         });
         toast.success("Property approved successfully");
         setProperties(prev => prev.filter(p => p._id !== id));
      } catch (err: any) {
         toast.error(err.message || "Failed to approve property");
      } finally {
         setIsProcessing(false);
      }
   };

   const handleReject = async () => {
      if (!selectedProperty) return;
      if (!rejectionReason) {
         toast.error("Please select a rejection reason");
         return;
      }
      try {
         setIsProcessing(true);
         await api(`/admin/audit/update-property-status/${selectedProperty._id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "REJECTED", rejectionReason, rejectionComments }),
         });
         toast.success("Property rejected");
         setProperties(prev => prev.filter(p => p._id !== selectedProperty._id));
         setShowRejectPanel(false);
         setSelectedProperty(null);
         setRejectionReason("");
         setRejectionComments("");
      } catch (err: any) {
         toast.error(err.message || "Failed to reject property");
      } finally {
         setIsProcessing(false);
      }
   };

   const openRejectPanel = (prop: any) => {
      setSelectedProperty(prop);
      setShowRejectPanel(true);
   };

   const openDetails = (prop: any) => {
      setViewingPropertyId(prop._id);
   };

   const openGallery = (property: any) => {
      const mediaList = [
         ...(property.media?.photos || []).map((url: string) => ({ type: "photo", url })),
         ...(property.media?.videos || []).map((url: string) => ({ type: "video", url })),
         ...(property.media?.floorPlans || []).map((url: string) => ({ type: "photo", url })),
         ...(property.residential?.amenityImages || property.commercial?.amenityImages || []).map((url: string) => ({ type: "photo", url }))
      ];

      if (mediaList.length > 0) {
         setSelectedProperty({ ...property, mediaList });
         setCurrentImageIndex(0);
         setIsGalleryOpen(true);
      } else {
         toast.error("No media available for this property");
      }
   };

   const nextImage = () => {
      if (selectedProperty?.mediaList) {
         setCurrentImageIndex((prev) =>
            prev === selectedProperty.mediaList.length - 1 ? 0 : prev + 1
         );
      }
   };

   const prevImage = () => {
      if (selectedProperty?.mediaList) {
         setCurrentImageIndex((prev) =>
            prev === 0 ? selectedProperty.mediaList.length - 1 : prev - 1
         );
      }
   };

   // Helper for video embeds
   const getEmbedUrl = (url: string) => {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
         const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
         return `https://www.youtube.com/embed/${id}`;
      }
      return url;
   };

   if (isLoading) {
      return (
         <div className="flex h-screen items-center justify-center bg-white">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
         </div>
      );
   }

   if (properties.length === 0) {
      return (
         <div className="flex-1 flex items-center justify-center p-8 w-full">
            <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-xl text-center max-w-md">
               <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
               </div>
               <h2 className="text-2xl font-black text-gray-900">Queue All Set!</h2>
               <p className="text-gray-500 mt-2 font-medium">No property listings awaiting approval.</p>
               <Button
                  onClick={fetchPending}
                  variant="outline"
                  className="mt-8 h-12 rounded-xl px-8 border-gray-200 font-bold text-xs uppercase tracking-widest"
               >
                  Refresh Items
               </Button>
            </div>
         </div>
      );
   }

   const REJECTION_REASONS = [
      { id: "INCOMPLETE", label: "Incomplete or Inaccurate Details" },
      { id: "INVALID_PRICING", label: "Invalid Pricing/Information" },
      { id: "POOR_IMAGES", label: "Poor Quality Images" },
      { id: "DUPLICATE", label: "Duplicate Listing" },
   ];

   return (
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 w-full">

         {/* Integrated Control Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                     <FileText size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Audit Terminal</span>
               </div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">Property Audit Queue</h1>
               <p className="text-gray-500 text-sm font-medium">Review and verify new listings before they go live.</p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                  <input
                     type="text"
                     placeholder="Search by title, city..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-64 shadow-sm font-medium"
                  />
               </div>
            </div>
         </div>

         {/* Dashboard-Style Summary Cards Container */}
         <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {statCards.map((item, idx) => (
                  <div
                     key={idx}
                     className="relative group cursor-pointer transition-all duration-300"
                     onClick={() => setTypeFilter(item.filter)}
                  >
                     <div
                        className={`flex items-center gap-4 p-4 rounded-xl shadow-sm h-[80px] hover:shadow-md transition-all ${typeFilter === item.filter ? "shadow-md bg-opacity-90 ring-1 ring-gray-900/5" : ""
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

         <div className="grid grid-cols-1 gap-6 pb-20">
            {filteredProperties.map((property) => (
               <div
                  key={property._id}
                  className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row group min-h-[250px]"
               >
                  {/* Visual Header (Framed Image) */}
                  <div className="relative w-full lg:w-[360px] shrink-0 min-h-[180px] lg:min-h-full bg-slate-50 p-3">
                     <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 group-hover:border-blue-500 transition-colors shadow-sm bg-white">
                        {property.media?.photos?.[0] ? (
                           <img
                              src={property.media.photos[0]}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                           />
                        ) : (
                           <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300">
                              <Building size={40} />
                           </div>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex gap-2">
                           <span className="bg-amber-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                              PENDING AUDIT
                           </span>
                           <span className={`text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-md ${property?.purpose === 'RENT' ? 'bg-blue-600' : 'bg-red-600'}`}>
                              {property?.purpose === 'RENT' ? 'RENT' : 'SALE'}
                           </span>
                        </div>

                        {/* Gallery Actions Overlay Only */}
                        <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/10 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center z-20">
                           <button
                              onClick={() => openGallery(property)}
                              className="p-3 bg-white rounded-full text-blue-600 shadow-2xl scale-50 group-hover:scale-100 transition-all duration-300 transform -translate-y-2 hover:bg-blue-600 hover:text-white cursor-pointer"
                           >
                              <LayoutGrid size={24} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Information Area */}
                  <div className="p-6 flex-1 flex flex-col lg:flex-row items-stretch justify-between gap-6">
                     {/* Left Column: Title & Specifics */}
                     <div className="flex-1 flex flex-col justify-between w-full space-y-3">
                        <div className="flex items-start justify-between">
                           <div className="space-y-1">
                              <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
                                 {property.title || property.residential?.propertyTitle || property.commercial?.propertyTitle || "New Property Listing"}
                              </h3>
                              <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Property ID: {property._id?.slice(-8).toUpperCase()}</p>
                           </div>
                        </div>

                        {/* Highlight Bar */}
                        <div className="grid grid-cols-3 gap-2 py-3">
                           <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                              <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><ListFilter size={10} /> Category</p>
                              <p className="text-xs font-black text-blue-700 uppercase">{property.listingType || "RESIDENTIAL"}</p>
                           </div>
                           <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={10} /> Location</p>
                              <p className="text-xs font-black text-emerald-700 truncate">
                                 {[property.location?.locality, property.location?.city, property.location?.district, property.location?.state].filter(Boolean).join(", ") || "N/A"}
                              </p>
                           </div>
                            <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                               <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                  <Search size={10} /> {property.listingType === "COMMERCIAL" ? "Expected Price" : "Starting Price"}
                               </p>
                               <p className="text-xs font-black text-amber-700 whitespace-nowrap">
                                  {formatPrice(property.listingType === "COMMERCIAL" ? (property.pricing?.expectedPrice || 0) : (property.pricing?.startingPrice || 0))}
                               </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-auto pt-4 border-t border-gray-50">
                           <div className="space-y-1.5 border-l-4 border-blue-500 pl-3">
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><UserIcon size={12} /> Submitter</p>
                              <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{property.residential?.builderName || property.commercial?.builderName || "Direct Owner"}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> Submitted On</p>
                              <p className="text-sm font-bold text-gray-600">{new Date(property.createdAt).toLocaleDateString()}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><BadgeCheck size={12} /> Role</p>
                              <p className="text-sm font-bold text-gray-600">{property.createdBy?.role || "USER"}</p>
                           </div>
                        </div>
                     </div>

                     {/* Right Column: Audit Actions */}
                     <div className="flex flex-col items-center justify-center gap-3 w-full lg:w-[200px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-8">
                        <Button
                           onClick={() => openDetails(property)}
                           className="w-full h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg"
                        >
                           <Eye size={16} className="mr-2" />
                           View Details
                        </Button>
                        <div className="flex gap-2 w-full">
                           <Button
                              onClick={() => openRejectPanel(property)}
                              variant="outline"
                              className="flex-1 h-12 rounded-xl font-black text-[9px] uppercase tracking-widest border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2"
                           >
                              <X size={14} />
                              <span>Reject</span>
                           </Button>
                           <Button
                              onClick={() => handleApprove(property._id)}
                              disabled={isProcessing}
                              className="flex-[2] h-12 rounded-xl font-black text-[9px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100 flex items-center justify-center gap-2"
                           >
                              {isProcessing ? (
                                 <Loader2 size={14} className="animate-spin" />
                              ) : (
                                 <CheckCircle2 size={14} />
                              )}
                              <span>Approve</span>
                           </Button>
                        </div>

                        {/* ── Admin Video Controls ── */}
                        <div className="w-full pt-3 border-t border-gray-100 space-y-2">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Admin YT Link</p>
                           <div className="flex gap-1">
                              <input
                                 type="text"
                                 placeholder="YouTube URL"
                                 className="flex-1 h-8 px-2 text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
                                 value={ytLinks[property._id] ?? property.media?.adminYoutubeLink ?? ""}
                                 onChange={(e) => handleYtChange(property._id, e.target.value)}
                              />
                              <button
                                 onClick={() => updateYoutubeLink(property._id, ytLinks[property._id] ?? property.media?.adminYoutubeLink ?? "")}
                                 title="Save YouTube link"
                                 className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer shrink-0"
                              >
                                 <CheckCircle2 size={14} />
                              </button>
                           </div>

                           {property.media?.uploadedVideo?.url && (
                              <div className="flex gap-2">
                                 <a
                                    href={property.media.uploadedVideo.url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 h-8 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                                 >
                                    <ChevronRight size={11} className="rotate-90" />
                                    Download Video
                                 </a>
                                 <button
                                    onClick={() => deleteVideo(property._id)}
                                    title="Delete video from server"
                                    className="w-8 h-8 bg-red-50 text-red-500 border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer shrink-0"
                                 >
                                    <X size={13} />
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
               <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
               />
            </div>
         </div>

         {/* Reject Panel Modal */}
         {showRejectPanel && selectedProperty && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-100">
                           <XCircle size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                           <h2 className="text-lg font-black text-gray-900 leading-none">Reject Listing</h2>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Final Audit Decision
                           </p>
                        </div>
                     </div>
                     <button onClick={() => { setShowRejectPanel(false); setSelectedProperty(null); }} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all"><X size={18} /></button>
                  </div>

                  <div className="p-8 space-y-8">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Rejection Reason:</p>
                        <div className="space-y-3">
                           {REJECTION_REASONS.map((reason) => (
                              <label key={reason.id} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 cursor-pointer group transition-all">
                                 <input type="radio" name="rejectionReason" value={reason.id} checked={rejectionReason === reason.id} onChange={(e) => setRejectionReason(e.target.value)} className="w-4 h-4 accent-blue-600" />
                                 <span className={`text-sm font-bold transition-colors ${rejectionReason === reason.id ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>{reason.label}</span>
                              </label>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-2.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Additional Feedback</p>
                        <textarea className="w-full min-h-[100px] bg-gray-50 rounded-2xl border border-gray-100 p-4 text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none placeholder:text-gray-300" placeholder="Type comments for the user..." value={rejectionComments} onChange={(e) => setRejectionComments(e.target.value)} />
                     </div>

                     <Button onClick={handleReject} disabled={isProcessing} className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-red-100 flex items-center justify-center gap-3">
                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} strokeWidth={2.5} />}
                        Confirm Rejection
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* Property View Modal (unified) */}
         <PropertyViewModal
            propertyId={viewingPropertyId}
            onClose={() => setViewingPropertyId(null)}
         />

         {/* Image Gallery Modal */}
         {isGalleryOpen && selectedProperty && (
            <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-300 overflow-hidden">
               <div className="bg-white w-full max-w-7xl h-full max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/20">
                  {/* Header */}
                  <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-30">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedProperty.title || "Property Gallery"}</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <LayoutGrid size={12} className="text-blue-500" />
                           Media {currentImageIndex + 1} of {selectedProperty.mediaList?.length}
                        </p>
                     </div>
                     <button
                        onClick={() => setIsGalleryOpen(false)}
                        className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 relative flex flex-col bg-white overflow-hidden">
                     
                     {/* Media Display */}
                     <div className="flex-1 relative flex items-center justify-center p-12 md:p-32 overflow-hidden group">
                        <button
                           onClick={(e) => { e.stopPropagation(); prevImage(); }}
                           className="absolute left-6 w-12 h-12 rounded-full bg-white shadow-xl text-gray-900 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 border border-gray-100 hover:bg-gray-50"
                        >
                           <ChevronLeft size={24} />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                           {selectedProperty.mediaList?.[currentImageIndex]?.type === "photo" ? (
                              <img
                                 key={currentImageIndex}
                                 src={selectedProperty.mediaList[currentImageIndex].url}
                                 className="max-w-[80%] max-h-[50vh] object-contain animate-in fade-in zoom-in-95 duration-500 rounded-lg"
                                 alt="Property showcase"
                              />
                           ) : (
                              <div className="w-full max-w-4xl aspect-video flex items-center justify-center">
                                 <iframe
                                    src={getEmbedUrl(selectedProperty.mediaList[currentImageIndex].url)}
                                    className="w-full h-full rounded-2xl shadow-2xl border border-gray-100"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                 />
                              </div>
                           )}
                        </div>

                        <button
                           onClick={(e) => { e.stopPropagation(); nextImage(); }}
                           className="absolute right-6 w-12 h-12 rounded-full bg-white shadow-xl text-gray-900 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 border border-gray-100 hover:bg-gray-50"
                        >
                           <ChevronRightIcon size={24} />
                        </button>
                     </div>
                  </div>

                  {/* Footer / Thumbnails */}
                  <div className="p-6 bg-white border-t border-gray-100 overflow-x-auto">
                     <div className="flex items-center justify-center gap-4 px-4 min-w-max mx-auto">
                        {selectedProperty.mediaList?.map((media: any, index: number) => (
                           <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-300 relative ${index === currentImageIndex ? "border-blue-500 scale-110 shadow-blue-500/20 shadow-xl ring-4 ring-blue-50" : "border-transparent opacity-40 hover:opacity-100 hover:border-gray-200"
                                 }`}
                           >
                              {media.type === "photo" ? (
                                 <img src={media.url} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                       <path d="M8 5v14l11-7z" />
                                    </svg>
                                 </div>
                              )}
                              {media.type === "video" && (
                                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                       <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                       </svg>
                                    </div>
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Backdrop click to close */}
               <div className="absolute inset-0 -z-10" onClick={() => setIsGalleryOpen(false)} />
            </div>
         )}
      </div>
   );
}