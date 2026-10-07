"use client";

import { useState, useEffect, useCallback } from "react";
import {
    X, ChevronLeft, ChevronRight, Layout, Trophy, Waves,
    Dumbbell, Home, Baby, Trees, Footprints, ShieldCheck, User, Loader2,
    Image as ImageIcon, Film, LayoutGrid, Building2, Play
} from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/lib/AuthModalContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import RoleSwitchModal from "./RoleSwitchModal";

// â”€â”€ Amenity Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const amenityIcons: Record<string, any> = {
    "Swimming Pool": <Waves size={18} />,
    "Gym": <Dumbbell size={18} />,
    "Gymnasium": <Dumbbell size={18} />,
    "Club House": <Home size={18} />,
    "Clubhouse": <Home size={18} />,
    "Kids Play Area": <Baby size={18} />,
    "Green Space": <Trees size={18} />,
    "Landscaped Gardens": <Trees size={18} />,
    "Sports Facilities": <Trophy size={18} />,
    "Jogging Track": <Footprints size={18} />,
    "Security Guard": <ShieldCheck size={18} />,
    "24/7 Security": <ShieldCheck size={18} />,
    "Parking Lot": <Home size={18} />,
    "Community Hall": <Home size={18} />,
};

const TABS = ["OVERVIEW", "AMENITIES", "MEDIA", "ABOUT BUILDER"];

interface PropertyViewModalProps {
    propertyId: string | null;
    onClose: () => void;
}

export default function PropertyViewModal({ propertyId, onClose }: PropertyViewModalProps) {
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("OVERVIEW");
    const [mediaGallery, setMediaGallery] = useState<{ type: string; url: string; label: string }[]>([]);
    const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const router = useRouter();
    const { user } = useAuth();
    const { openLogin } = useAuthModal();

    const fetchProperty = useCallback(async () => {
        if (!propertyId) return;
        setLoading(true);
        setProperty(null);
        setError(null);
        setCurrentMediaIdx(0);
        setActiveTab("OVERVIEW");
        try {
            const data = await api(`/properties/${propertyId}`);
            setProperty(data);

            // Build unified media gallery from all media fields
            const gallery: { type: string; url: string; label: string }[] = [];
            (data.media?.photos || []).forEach((url: string, i: number) => gallery.push({ type: "photo", url, label: `Photo ${i + 1}` }));
            (data.media?.videos || []).forEach((url: string, i: number) => gallery.push({ type: "video", url, label: `Video ${i + 1}` }));
            (data.media?.floorPlans || []).forEach((url: string, i: number) => gallery.push({ type: "floorplan", url, label: `Floor Plan ${i + 1}` }));

            if (data.media?.adminYoutubeLink) {
                gallery.push({ type: "video", url: data.media.adminYoutubeLink, label: "Official Tour (YT)" });
            }

            if (data.media?.uploadedVideo?.url) {
                gallery.push({ type: "video", url: data.media.uploadedVideo.url, label: "Property Video" });
            }

            (data.residential?.amenityImages || data.commercial?.amenityImages || []).forEach((url: string, i: number) => gallery.push({ type: "amenity", url, label: `Amenity ${i + 1}` }));
            setMediaGallery(gallery);
        } catch (err: any) {
            console.error("Error fetching property for modal:", err);
            setError(err.message || "Failed to load property details.");
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchProperty();
    }, [fetchProperty]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (lightboxOpen) setLightboxOpen(false);
                else onClose();
            }
            if (lightboxOpen) {
                if (e.key === "ArrowRight") setLightboxIdx(p => (p + 1) % mediaGallery.length);
                if (e.key === "ArrowLeft") setLightboxIdx(p => (p - 1 + mediaGallery.length) % mediaGallery.length);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, lightboxOpen, mediaGallery.length]);

    if (!propertyId) return null;

    const isOwner = user && property && (
        (property.createdBy?._id === user._id) ||
        (property.createdBy === user._id) ||
        (property.userId?._id === user._id) ||
        (property.userId === user._id)
    );

    const isAdmin = user && (user.role as string === "ADMIN" || user.role === "SUPER_ADMIN");

    // â”€â”€ Data Extraction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const isCommercial = property?.listingType === "COMMERCIAL";
    const title = property?.residential?.propertyTitle || property?.location?.projectName || property?.title || "Property Detail";
    const price = isCommercial
        ? (property?.pricing?.expectedPrice || 0)
        : (property?.pricing?.startingPrice || 0);
    const pricingLabel = isCommercial ? "Expected Price" : "Starting Price";

    const bhk = property?.residential?.bhkType || (isCommercial ? property?.commercial?.propertyCategory : "N/A");
    const area = property?.residential?.carpetArea || property?.commercial?.carpetArea || "N/A";
    const amenitiesList: string[] = property?.residential?.amenities || property?.commercial?.amenities || [];
    const amenityImages: string[] = property?.residential?.amenityImages || property?.commercial?.amenityImages || [];

    // Combine photos with amenity images to ensure they are visible in the main gallery
    const backendPhotos = property?.media?.photos || [];
    const allPhotos = [...backendPhotos, ...amenityImages];
    const photos = allPhotos.length ? allPhotos : [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
    ];
    const floorPlans: string[] = property?.media?.floorPlans || [];

    // Combine old media.videos with the new video fields so they render in the UI tab
    const videos: string[] = [
        ...(property?.media?.videos || []),
        property?.media?.adminYoutubeLink,
        property?.media?.uploadedVideo?.url
    ].filter(Boolean) as string[];

    const possessionStatus = property?.residential?.possessionStatus || property?.commercial?.possessionStatus || "READY TO MOVE";

    const getEmbedUrl = (url: string) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
            return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    };

    // Badge colors
    const statusColor =
        property?.propertyApprovedStatus === "APPROVED" ? "bg-[#1e3a5f] text-white" :
            property?.propertyApprovedStatus === "PENDING" ? "bg-orange-500 text-white" :
                property?.propertyApprovedStatus === "REJECTED" ? "bg-red-500 text-white" :
                    "bg-gray-700 text-white";

    const openLightbox = (idx: number) => {
        setLightboxIdx(idx);
        setLightboxOpen(true);
    };

    return (
        // â”€â”€ Backdrop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* â”€â”€ Modal Shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* â”€â”€ Close Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-gray-100 rounded-full shadow-sm transition-colors"
                >
                    <X size={18} className="text-gray-600" />
                </button>

                {/* ── Scrollable Content ──────────────────────────────────────────────────────────────────────────────── */}
                <div className="overflow-y-auto flex-1">

                    {loading ? (
                        <div className="flex items-center justify-center h-72">
                            <Loader2 className="w-10 h-10 animate-spin text-[#1e3a5f]" />
                        </div>
                    ) : property ? (
                        <>
                            {/* ── Top Section: Image Gallery + Quick Info ─── */}
                            <div className="p-4 flex flex-col sm:flex-row gap-6 border-b border-gray-100">

                                {/* Gallery */}
                                <div className="relative w-full sm:w-[260px] h-[220px] sm:h-[195px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 group cursor-pointer" onClick={() => openLightbox(0)}>
                                    <img
                                        src={photos[0]}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Media count badge */}
                                    <div className="absolute bottom-2 left-2 z-10 flex gap-2">
                                        <span className={`text-white text-[8px] font-black px-2 py-0.5 rounded-lg shadow-lg uppercase tracking-wider ${property.purpose === 'RENT' ? 'bg-blue-600/90' : 'bg-red-600/90'}`}>
                                            {property.purpose === 'RENT' ? 'RENT' : 'SALE'}
                                        </span>
                                    </div>
                                    {mediaGallery.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <ImageIcon size={10} />
                                            {mediaGallery.length} media
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg">
                                            <LayoutGrid size={18} className="text-gray-700" />
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="flex flex-col flex-1 pt-1">
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded tracking-wider ${statusColor}`}>
                                            {property?.propertyApprovedStatus || "PUBLISHED"}
                                        </span>
                                        <span className="bg-white text-gray-600 border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded">
                                            RERA Approved
                                        </span>
                                        {property?.listingType && (
                                            <span className="bg-[#E87722] text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                                                {property.listingType}
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-3">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{pricingLabel}</div>
                                        <div className="text-[22px] font-bold text-gray-900 leading-tight">
                                            {formatPrice(price)}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="text-[12.5px] text-gray-600 space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Layout size={13} className="text-gray-400 shrink-0" />
                                            <span>{isCommercial ? (bhk || "Commercial").replace(/_/g, " ") : `${bhk} Available`}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border border-gray-400 rounded-[2px] shrink-0" />
                                            <span>{area} sq.ft. Area</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Trophy size={13} className="text-gray-400 shrink-0" />
                                            <span>{amenitiesList.length}+ Amenities</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ImageIcon size={13} className="text-gray-400 shrink-0" />
                                            <span>{mediaGallery.length} media files</span>
                                        </div>
                                    </div>

                                    {/* Book VC Button */}
                                    {!isOwner && !isAdmin && user?.role?.toUpperCase() !== "BUILDER" && (
                                        <Button
                                            onClick={() => {
                                                if (!user) {
                                                    toast.error("Please login to book a video call.");
                                                    openLogin();
                                                    return;
                                                }
                                                if (user?.role?.toUpperCase() !== "BUYER") {
                                                    setShowRoleModal(true);
                                                    return;
                                                }
                                                const ownerName = property?.createdBy?.name || property?.residential?.builderName || "Property Representative";
                                                const propertyTitle = property?.residential?.propertyTitle || property?.location?.projectName || property?.title || "Property";
                                                const propertyImage = property?.media?.photos?.[0] || "";
                                                const propertyCity = property?.location?.city || "";

                                                router.push(`/book-vc?id=${property?._id}&title=${encodeURIComponent(propertyTitle)}&city=${encodeURIComponent(propertyCity)}&img=${encodeURIComponent(propertyImage)}&owner=${encodeURIComponent(ownerName)}`);
                                                onClose();
                                            }}
                                            className="mt-4 sm:mt-auto w-full bg-[#1e3a5f] hover:bg-[#16304f] text-white text-[11px] font-bold py-4 rounded tracking-widest transition-all"
                                        >
                                            BOOK VC
                                        </Button>
                                    )}

                                    <div className="mt-3 sm:mt-auto flex flex-col gap-1.5">
                                        <div className="text-[11px] text-gray-500 font-medium">
                                            📍 {property?.location?.locality}, {property?.location?.city}
                                        </div>
                                        {property?.location?.googleMapLink && (
                                            <a
                                                href={property.location.googleMapLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-[10px] font-bold uppercase tracking-wider transition-colors w-fit"
                                            >
                                                <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
                                                    <Layout size={10} />
                                                </div>
                                                View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-5 py-3.5 text-[10.5px] font-bold tracking-widest transition-all uppercase whitespace-nowrap flex items-center gap-1.5
                                            ${activeTab === tab ? "text-[#1e3a5f] bg-white" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {tab === "MEDIA" && <ImageIcon size={11} />}
                                        {tab}
                                        {tab === "MEDIA" && mediaGallery.length > 0 && (
                                            <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">{mediaGallery.length}</span>
                                        )}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e3a5f]" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* â”€â”€ Tab Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                            <div className="p-4 sm:p-6">

                                {/* OVERVIEW */}
                                {activeTab === "OVERVIEW" && (
                                    <div className="flex flex-col gap-6">
                                        <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                            Located in{" "}
                                            <span className="text-[#1e3a5f] font-bold">{property?.location?.city}</span>,
                                            this {property?.listingType?.toLowerCase()} property offers a premium{" "}
                                            <span className="font-bold uppercase">{property?.residential?.propertyType || property?.commercial?.propertyCategory || "listing"}</span>{" "}
                                            with modern architecture and high-quality finishes. The project, named "{property?.location?.projectName || title}", is strategically
                                            situated in <span className="font-bold">{property?.location?.locality}</span> with excellent connectivity.
                                        </p>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                            <div className="flex flex-col items-center justify-center py-5 px-2 bg-[#1e3a5f] text-white">
                                                <div className="font-bold text-sm text-center px-1">
                                                    {isCommercial ? (bhk || "Commercial").replace(/_/g, " ") : bhk}
                                                </div>
                                                <div className="text-[10px] mt-1 text-white/70 uppercase tracking-wider">
                                                    {isCommercial ? "Category" : "Available"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center py-5 px-2 border-r border-gray-100 bg-white text-gray-800">
                                                <div className="font-bold text-sm">{area} sq.ft.</div>
                                                <div className="text-[10px] mt-1 text-gray-500 uppercase tracking-wider">Area</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center py-5 px-1 border-r border-gray-100 bg-white text-gray-800">
                                                <div className="font-bold text-[11px]">{possessionStatus}</div>
                                                <div className="text-[10px] mt-1 text-gray-500 uppercase tracking-wider">Status</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center py-5 px-2 bg-white text-gray-800">
                                                <div className="font-bold text-sm">{amenitiesList.length}</div>
                                                <div className="text-[10px] mt-1 text-gray-500 uppercase tracking-wider">Amenities</div>
                                            </div>
                                        </div>

                                        {/* Property Details Grid */}
                                        <div>
                                            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-[#1e3a5f] rounded-full" />
                                                Property Details
                                            </h3>
                                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-100">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">Property Type</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{property?.residential?.propertyType || property?.commercial?.propertyCategory || "N/A"}</div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">Listing Type</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{property?.listingType || "N/A"}</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">{isCommercial ? "Category" : "BHK / Config"}</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{bhk}</div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">Area</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{area} sq.ft.</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">City</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px] font-bold">{property?.location?.city || "N/A"}</div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">District</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{property?.location?.district || "N/A"}</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">Locality</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{property?.location?.locality || "N/A"}</div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-1/2 sm:w-[40%] py-3 px-4 bg-[#f8fafc] text-gray-500 font-bold uppercase tracking-tight text-[10px]">State</div>
                                                        <div className="w-1/2 sm:w-[60%] py-3 px-4 text-gray-800 font-bold text-[11px]">{property?.location?.state || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-gray-400 font-medium italic">
                                            Disclaimer: Rates and availability are subject to change without notice. Please contact the builder/seller directly for the latest information.
                                        </p>
                                    </div>
                                )}

                                {/* AMENITIES */}
                                {activeTab === "AMENITIES" && (
                                    <div className="space-y-6">
                                        {amenitiesList.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {amenitiesList.map((item: string, i: number) => (
                                                    <div key={i} className="flex flex-col items-center gap-2.5 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#1e3a5f] hover:shadow-sm transition-all group">
                                                        <div className="p-3 bg-white rounded-full text-[#1e3a5f] shadow-sm group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                                                            {amenityIcons[item] || <Home size={18} />}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                                <Trophy size={36} className="mb-3 opacity-30" />
                                                <p className="text-sm font-medium">No amenities listed</p>
                                            </div>
                                        )}

                                        {/* Amenity Images */}
                                        {amenityImages.length > 0 && (
                                            <div>
                                                <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3">Amenity Photos</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {amenityImages.map((url: string, i: number) => (
                                                        <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                                                            const idx = mediaGallery.findIndex(m => m.url === url && m.type === "amenity");
                                                            if (idx >= 0) openLightbox(idx);
                                                        }}>
                                                            <img src={url} alt={`Amenity ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* MEDIA */}
                                {activeTab === "MEDIA" && (
                                    <div className="space-y-6">
                                        {mediaGallery.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                                <ImageIcon size={36} className="mb-3 opacity-30" />
                                                <p className="text-sm font-medium">No media uploaded</p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Photos */}
                                                {photos.length > 0 && (
                                                    <div>
                                                        <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <ImageIcon size={12} className="text-blue-500" /> Photos ({photos.length})
                                                        </h3>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {photos.map((url: string, i: number) => (
                                                                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-all group" onClick={() => {
                                                                    const idx = mediaGallery.findIndex(m => m.url === url && m.type === "photo");
                                                                    openLightbox(idx >= 0 ? idx : 0);
                                                                }}>
                                                                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Videos */}
                                                {videos.length > 0 && (
                                                    <div>
                                                        <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Film size={12} className="text-purple-500" /> Videos ({videos.length})
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {videos.map((url: string, i: number) => (
                                                                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-100 bg-slate-900 cursor-pointer relative group" onClick={() => {
                                                                    const idx = mediaGallery.findIndex(m => m.url === url && m.type === "video");
                                                                    if (idx >= 0) openLightbox(idx);
                                                                }}>
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                                            <Play size={24} className="text-white ml-1" fill="white" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute bottom-2 left-2 text-white text-[10px] font-bold">Video Tour {i + 1}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Floor Plans */}
                                                {floorPlans.length > 0 && (
                                                    <div>
                                                        <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Building2 size={12} className="text-emerald-500" /> Floor Plans ({floorPlans.length})
                                                        </h3>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {floorPlans.map((url: string, i: number) => (
                                                                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-gray-50 cursor-pointer" onClick={() => {
                                                                    const idx = mediaGallery.findIndex(m => m.url === url && m.type === "floorplan");
                                                                    if (idx >= 0) openLightbox(idx);
                                                                }}>
                                                                    <img src={url} alt={`Floor Plan ${i + 1}`} className="w-full h-auto object-contain bg-white" />
                                                                    <div className="p-2.5 text-[10px] font-bold text-gray-600 text-center uppercase tracking-widest bg-white border-t border-gray-100">
                                                                        Floor Plan {i + 1}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Amenity Images if any */}
                                                {amenityImages.length > 0 && (
                                                    <div>
                                                        <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Trophy size={12} className="text-amber-500" /> Amenity Photos ({amenityImages.length})
                                                        </h3>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {amenityImages.map((url: string, i: number) => (
                                                                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-all group" onClick={() => {
                                                                    const idx = mediaGallery.findIndex(m => m.url === url && m.type === "amenity");
                                                                    if (idx >= 0) openLightbox(idx);
                                                                }}>
                                                                    <img src={url} alt={`Amenity ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* ABOUT BUILDER */}
                                {activeTab === "ABOUT BUILDER" && (
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center gap-4 p-5 bg-[#f8fafc] rounded-xl border border-gray-100">
                                            <div className="w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white shadow-md shrink-0">
                                                <User size={26} />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-bold text-[#1e3a5f] uppercase tracking-wider leading-tight">
                                                    {property?.residential?.builderName || property?.commercial?.builderName || "Elite Builders Group"}
                                                </h4>
                                                <p className="text-[11px] text-gray-500 mt-1 font-semibold uppercase tracking-tight">
                                                    Listed by {property?.createdBy?.name || property?.userId?.name || "Admin"}
                                                </p>
                                                {property?.createdBy?.phone && (
                                                    <p className="text-[11px] text-gray-500 mt-1 font-semibold uppercase tracking-tight">
                                                        Contact: {property.createdBy.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                            Our commitment to excellence and innovation has made us a leading name in the real estate industry. We strive to provide prime living spaces that combine luxury, comfort, and sustainability.
                                        </p>
                                        <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                            For more details about this listing or other projects, please contact us through the inquiry form on the public property page.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-72 text-center px-6">
                            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <X size={24} className="text-red-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-700 mb-1">Could not load property</p>
                            <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
                            <button
                                onClick={fetchProperty}
                                className="mt-4 px-4 py-2 bg-[#1e3a5f] text-white text-xs font-bold rounded-lg hover:bg-[#16304f] transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-72 text-gray-400">
                            <Home size={36} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">Could not load property details.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* â”€â”€ Fullscreen Lightbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {lightboxOpen && mediaGallery.length > 0 && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200" onClick={() => setLightboxOpen(false)}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-black/40 shrink-0" onClick={e => e.stopPropagation()}>
                        <div>
                            <p className="text-white font-bold text-sm">{mediaGallery[lightboxIdx]?.label}</p>
                            <p className="text-white/50 text-[10px] uppercase tracking-widest">{lightboxIdx + 1} / {mediaGallery.length}</p>
                        </div>
                        <button onClick={() => setLightboxOpen(false)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Media Display */}
                    <div className="flex-1 flex items-center justify-center p-12 md:p-24 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightboxIdx(p => (p - 1 + mediaGallery.length) % mediaGallery.length)} className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                            <ChevronLeft size={24} />
                        </button>

                        {mediaGallery[lightboxIdx]?.type === "video" ? (
                            <iframe
                                src={getEmbedUrl(mediaGallery[lightboxIdx].url)}
                                className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <img
                                key={lightboxIdx}
                                src={mediaGallery[lightboxIdx]?.url}
                                className="max-w-[80vw] max-h-[55vh] object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                                alt={mediaGallery[lightboxIdx]?.label}
                            />
                        )}

                        <button onClick={() => setLightboxIdx(p => (p + 1) % mediaGallery.length)} className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Thumbnails */}
                    <div className="shrink-0 p-4 bg-black/40 overflow-x-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2 min-w-max mx-auto justify-center">
                            {mediaGallery.map((media, idx) => (
                                <button key={idx} onClick={() => setLightboxIdx(idx)} className={`w-16 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 relative ${idx === lightboxIdx ? "border-white scale-110 shadow-xl" : "border-transparent opacity-40 hover:opacity-70"}`}>
                                    {media.type === "video" ? (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <Play size={14} fill="white" className="text-white" />
                                        </div>
                                    ) : (
                                        <img src={media.url} className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Role Switch Modal */}
            <RoleSwitchModal 
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                title="Switch to Buyer Account"
                description="To book a video call or send inquiries, you need to be using a Buyer account. Would you like to switch now?"
                targetRoles={["BUYER"]}
            />
        </div>
    );
}

