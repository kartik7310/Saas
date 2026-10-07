"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  LayoutGrid,
  FileText,
  BadgeCheck,
  ExternalLink,
  ChevronLeft,
  ChevronDown,
  Info,
  MoreVertical,
  Check,
  CheckCircle,
  HomeIcon,
  Search,
  MessageCircle,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";


export default function PropertyAuditDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionComments, setRejectionComments] = useState("");

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      const data = await api(`/properties/${id}`);
      setProperty(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch property details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await api(`/admin/audit/update-property-status/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "APPROVED" }),
      });
      toast.success("Property approved successfully");
      setShowRejectModal(false);
      fetchProperty();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve property");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please select a rejection reason");
      return;
    }
    try {
      setIsProcessing(true);
      await api(`/admin/audit/update-property-status/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason,
          rejectionComments
        }),
      });
      toast.success("Property rejected");
      setShowRejectModal(false);
      fetchProperty();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject property");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white gap-4">
        <h2 className="text-xl font-bold">Property Not Found</h2>
        <Button onClick={() => router.push("/admin-dashboard/property-audit")}>Go Back</Button>
      </div>
    );
  }

  const isApproved = property.propertyApprovedStatus === "APPROVED";
  const isRejected = property.propertyApprovedStatus === "REJECTED";
  const isPending = property.propertyApprovedStatus === "PENDING";

  return (
    <>
      {/* <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="p-1.5 bg-blue-600 rounded text-white shadow-sm">
                <HomeIcon size={14} />
              </div>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => router.push("/admin-dashboard/property-audit")}>Approve / Reject Listings</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-400">{property.title || property.residential?.propertyTitle || "Pacific Heights"}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              <span>Siludie Property</span>
              <span>-</span>
              <span>Listings</span>
            </div>
          </div> */}

      <div className="p-8 max-w-[1440px] mx-auto space-y-6">

        {/* Main Information Layout - full width, no right card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-start">

          {/* Property Visuals */}
          <div className="w-full md:w-[380px] space-y-4">
            <div className="aspect-[1.5/1] rounded-xl bg-gray-100 overflow-hidden shadow-md">
              {property.media?.photos?.[0] ? (
                <img src={property.media.photos[0]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Building size={64} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-50 border border-gray-100 overflow-hidden cursor-pointer hover:border-blue-600 transition-all">
                  {property.media?.photos?.[i] && <img src={property.media.photos[i]} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          </div>

          {/* Property Details Summary */}
          <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{property.title || property.residential?.propertyTitle || "Pacific Heights"}</h1>
                <span className={`text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider ${property?.purpose === 'RENT' ? 'bg-blue-600' : 'bg-red-600'}`}>
                  {property?.purpose === 'RENT' ? 'RENT' : 'SALE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Home size={14} /></div>
                  <span className="text-sm font-bold text-gray-700">{property.residential?.builderName || "Skyline Builders"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100"><MapPin size={14} /></div>
                  <span className="text-sm font-medium text-gray-500">{property.location?.city || "San Francisco, CA"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100"><Phone size={14} /></div>
                  <span className="text-sm font-medium text-gray-500">+1 415-123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100"><CheckCircle2 size={14} /></div>
                  <span className="text-sm font-medium text-gray-500">Residential</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100"><Mail size={14} /></div>
                  <span className="text-sm font-medium text-gray-500 truncate">john.smith@skyline.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100"><LayoutGrid size={14} /></div>
                  <span className="text-sm font-medium text-gray-500">High-Rise Apartments</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">Status:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${isPending ? 'text-[#EAB308]' : isApproved ? 'text-emerald-500' : 'text-red-500'}`}>
                    {property.propertyApprovedStatus}
                  </span>
                  <span className="text-gray-300 font-bold">•</span>
                  <span className="text-sm font-bold text-gray-400">{new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                    {property?.media?.photos?.[i] && <img src={property.media.photos[i]} className="w-full h-full object-cover" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Removed: Overview/Amenities/Floor Plans/RERA tabs, Audit Score, Floor Plans section */}

      {/* Floating Approve/Reject Action Panel */}
      {isPending && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_20px_50px_rgba(45,55,72,0.15)] w-[250px] overflow-hidden">
            <div className="bg-[#F8FAFC] px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                  <XCircle size={15} />
                </div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Reject Listing</h2>
              </div>
              <XCircle size={20} className="text-gray-300 hover:text-gray-500 cursor-pointer transition-colors" />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Please select a reason to reject:</p>
                <div className="space-y-3">
                  {[
                    { id: "INCOMPLETE", label: "Incomplete or Inaccurate Details" },
                    { id: "INVALID_PRICING", label: "Invalid Pricing/Information" },
                    { id: "POOR_IMAGES", label: "Poor Quality Images" },
                    { id: "DUPLICATE", label: "Duplicate Listing" }
                  ].map((reason) => (
                    <label key={reason.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={reason.id}
                          checked={rejectionReason === reason.id}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-4 h-4 appearance-none border-2 border-gray-200 rounded-full checked:border-blue-600 checked:border-[4px] transition-all"
                        />
                      </div>
                      <span className={`text-xs font-bold transition-all ${rejectionReason === reason.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Comments</p>
                <textarea
                  className="w-full h-24 bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none placeholder:text-gray-300"
                  placeholder="Add specific details for the builder..."
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-emerald-500/10"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-red-500/10"
                >
                  Reject Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}