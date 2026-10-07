"use client";

import { useEffect, useState } from "react";
import {
   Building,
   MapPin,
   Calendar,
   User as UserIcon,
   AlertCircle,
   Home,
   ListFilter,
   Search,
   Eye,
   Phone,
   LayoutGrid,
   MoreVertical,
   X,
   ChevronLeft,
   ChevronRight as ChevronRightIcon,
   Play,
   CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/admin/Pagination";

import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PropertyViewModal from "@/components/PropertyViewModal";

export default function PropertyListingsPage() {
   const router = useRouter();
   const [properties, setProperties] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [total, setTotal] = useState(0);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [stats, setStats] = useState({
      total: 0,
      residential: 0,
      commercial: 0,
   });

   const [searchTerm, setSearchTerm] = useState("");
   const [typeFilter, setTypeFilter] = useState("ALL");

   // Modal/Gallery States
   const [isGalleryOpen, setIsGalleryOpen] = useState(false);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [selectedProperty, setSelectedProperty] = useState<any>(null);
   const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null);

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

   const fetchApprovedProperties = async () => {
      try {
         setIsLoading(true);
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "10",
            listingType: typeFilter === "ALL" ? "" : typeFilter,
            search: searchTerm
         });
         const data = await api(`/properties?${params.toString()}`);
         setProperties(data.results || []);
         setTotal(data.total || 0);
         setTotalPages(data.totalPages || 1);
         if (data.stats) {
            setStats(data.stats);
         }
         setError(null);
      } catch (err: any) {
         setError(err.message || "Failed to fetch approved listings");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchApprovedProperties();
   }, [currentPage, typeFilter]);

   // Debounce search
   useEffect(() => {
      const timer = setTimeout(() => {
         if (currentPage !== 1) setCurrentPage(1);
         else fetchApprovedProperties();
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const filteredProperties = properties; // Now handled by backend

   // Stats are now fetched from backend

   const statCards = [
      { label: "All Inventory", count: stats.total, filter: "ALL", icon: Building, bg: "#eef2ff", iconColor: "text-blue-500" },
      { label: "Residential", count: stats.residential, filter: "RESIDENTIAL", icon: Home, bg: "#ecfdf5", iconColor: "text-emerald-500" },
      { label: "Commercial", count: stats.commercial, filter: "COMMERCIAL", icon: Building, bg: "#fffbeb", iconColor: "text-amber-500" },
   ];

   return (
      <>
         <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">

            {/* Control Center */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="space-y-1">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Inventory</h1>
                  <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                     Managing <span className="text-blue-600 font-black">{total}</span> approved listings on the platform.
                  </p>
               </div>

               <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative group flex-1">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                     <input
                        type="text"
                        placeholder="Search by ID or Builder..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full sm:w-64 shadow-sm"
                     />
                  </div>

                  <div className="relative flex-1">
                     <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-12 border border-gray-200 text-gray-700 font-bold rounded-xl pl-5 pr-10 hover:bg-gray-50 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm cursor-pointer appearance-none w-full"
                     >
                        <option value="ALL">All Types</option>
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="COMMERCIAL">Commercial</option>
                     </select>
                     <ListFilter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                           className={`flex items-center gap-4 p-4 rounded-xl shadow-sm h-[80px] hover:shadow-md transition-all ${
                              typeFilter === item.filter ? "shadow-md bg-opacity-90 ring-1 ring-gray-900/5" : ""
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

            {/* Error Message */}
            {error && (
               <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <p className="font-bold text-sm">{error}</p>
               </div>
            )}

            {/* Loading Grid */}
            {isLoading && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="h-96 bg-white border border-gray-100 rounded-3xl animate-pulse" />
                  ))}
               </div>
            )}

            {!isLoading && !error && (
               <>
                  <div className="flex flex-col gap-5">
                     {filteredProperties.map((property) => (
                        <div
                           key={property._id}
                           className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row group min-h-[250px]"
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

                                 {/* LIVE Badge Overlay */}
                                 <div className="absolute top-2.5 left-2.5 z-10 flex gap-2">
                                    <span className="bg-emerald-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                                       <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                       LIVE
                                    </span>
                                    <span className={`text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-md ${property.purpose === 'RENT' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                       {property.purpose === 'RENT' ? 'RENT' : 'SALE'}
                                    </span>
                                 </div>

                                 {/* Actions Overlay Only */}
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
                                          {property.title || (property.listingType === "RESIDENTIAL" ? property.residential?.propertyTitle : "Premium Real Estate")}
                                       </h3>
                                       <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Property ID: {property._id?.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <button className="text-gray-300 hover:text-blue-600 transition-colors block lg:hidden">
                                       <MoreVertical size={24} />
                                    </button>
                                 </div>

                                 {/* Highlight Bar - Filling the empty space */}
                                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-3">
                                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                       <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><ListFilter size={10} /> Type</p>
                                       <p className="text-xs font-black text-blue-700 uppercase">{property.residential?.propertyType || property.commercial?.propertyCategory?.replace("_", " ") || property.listingType}</p>
                                    </div>
                                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                                       <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={10} /> Location</p>
                                       <p className="text-xs font-black text-emerald-700 truncate">{property.location?.city || "N/A"}</p>
                                    </div>
                                    <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
                                       <p className="text-[9px] text-purple-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><Home size={10} /> Possession</p>
                                       <p className="text-xs font-black text-purple-700 truncate">{(property.residential?.possessionStatus || "READY").replace(/_/g, " ")}</p>
                                    </div>
                                    <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                                       <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5"><Search size={10} /> Price</p>
                                       <p className="text-xs font-black text-amber-700 whitespace-nowrap">{formatPrice(property.listingType === "COMMERCIAL" ? (property.pricing?.expectedPrice || property.pricing?.expectedRent || 0) : (property.pricing?.startingPrice || 0))}</p>

                                    </div>
                                 </div>

                                 {/* Secondary Details row */}
                                 <div className="flex items-center gap-6 text-[11px] font-bold text-gray-500">
                                    {property.residential?.bhkType && (
                                       <div className="flex items-center gap-1.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                          {property.residential.bhkType}
                                       </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                       {property.residential?.carpetArea || property.commercial?.carpetArea || "N/A"} sq.ft.
                                    </div>
                                    {property.residential?.floorNumber !== undefined && (
                                       <div className="flex items-center gap-1.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                          Floor: {property.residential.floorNumber}/{property.residential.totalFloors || "G"}
                                       </div>
                                    )}
                                 </div>

                                 <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-auto pt-4 border-t border-gray-50">
                                    <div className="space-y-1.5 border-l-4 border-blue-500 pl-3">
                                       <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><UserIcon size={12} /> Builder Profile</p>
                                       <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{property.residential?.builderName || property.commercial?.builderName || "Skyline Developers"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                       <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> Date Listed</p>
                                       <p className="text-sm font-bold text-gray-600">{new Date(property.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                       <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1"><Phone size={12} /> Contact Info</p>
                                       <p className="text-sm font-bold text-gray-600">{property.createdBy?.phone || "N/A"}</p>
                                    </div>
                                 </div>
                              </div>

                              {/* Right Column: Actions */}
                              <div className="flex flex-row lg:flex-col items-center justify-center gap-4 w-full lg:w-[180px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-8">
                                    <Button
                                       onClick={() => setViewingPropertyId(property._id)}
                                       className="w-full h-10 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all mb-2"
                                    >
                                       <Eye size={16} className="mr-2" />
                                       View Details
                                    </Button>
                                 </div>
                              </div>
                           </div>
                     ))}

                     {filteredProperties.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center gap-4 bg-white border border-gray-100 rounded-[3rem] shadow-sm">
                           <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <Home size={48} opacity={0.4} />
                           </div>
                           <div className="text-center">
                              <h3 className="text-2xl font-black text-gray-900">Inventory Empty</h3>
                              <p className="text-gray-500 font-medium max-w-sm mx-auto mt-2">New properties will appear here automatically after they are listed by builders or sellers.</p>
                           </div>
                        </div>
                     )}
                  </div>
                  <Pagination 
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={setCurrentPage}
                     isLoading={isLoading}
                  />
               </>
            )}
         </div>

         {/* Property Details Modal */}
         <PropertyViewModal 
            propertyId={viewingPropertyId}
            onClose={() => setViewingPropertyId(null)}
         />

         {/* Image Gallery Modal */}
         {isGalleryOpen && selectedProperty && (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-300 overflow-hidden">
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
                     <div className="flex-1 relative flex items-center justify-center p-8 md:p-12 overflow-hidden group">
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
                                    <Play size={24} />
                                 </div>
                              )}
                              {media.type === "video" && (
                                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                       <Play size={12} fill="white" className="text-white" />
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
      </>
   );
}
