"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
    Waves,
    Dumbbell,
    Home,
    Baby,
    Trees,
    Trophy,
    Footprints,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Phone,
    User,
    Layout,
    Grid,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyGrid from "../_components/PropertyGrid";
import { api } from "@/lib/api";
import { toast } from "sonner";
import RoleSwitchModal from "@/components/RoleSwitchModal";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/lib/AuthModalContext";
import { formatPrice } from "@/lib/utils";

const TABS = ["OVERVIEW", "AMENITIES", "VIDEO TOUR", "FLOOR PLANS", "ABOUT BUILDER"];

// Amenities Icon Mapping
const amenityIcons: Record<string, any> = {
    "Swimming Pool": <Waves size={16} />,
    "Gym": <Dumbbell size={16} />,
    "Gymnasium": <Dumbbell size={16} />,
    "Club House": <Home size={16} />,
    "Clubhouse": <Home size={16} />,
    "Kids Play Area": <Baby size={16} />,
    "Green Space": <Trees size={16} />,
    "Landscaped Gardens": <Trees size={16} />,
    "Sports Facilities": <Trophy size={16} />,
    "Jogging Track": <Footprints size={16} />,
    "Security Guard": <ShieldCheck size={16} />,
    "24/7 Security": <ShieldCheck size={16} />,
    "Parking Lot": <Home size={16} />, // Fallback icon
    "Community Hall": <Home size={16} />,
};

export default function PropertyDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { openLogin } = useAuthModal();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("OVERVIEW");
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    const [similarProperties, setSimilarProperties] = useState<any[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const [buyerMobile, setBuyerMobile] = useState("");
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const fetchProperty = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await api(`/properties/${id}`);
            setProperty(data);
        } catch (err: any) {
            console.error("Error fetching property:", err);
            setError(err.message || "Failed to load property details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchProperty();
    }, [fetchProperty, id]);

    useEffect(() => {
        const fetchSimilarProperties = async () => {
            const ownerId = property?.createdBy?._id || property?.createdBy;
            if (ownerId) {
                setLoadingSimilar(true);
                try {
                    const data = await api(`/properties?owner=${ownerId}&limit=8`);
                    const filtered = (data.results || []).filter((p: any) => p._id !== id).slice(0, 4);
                    setSimilarProperties(filtered);
                } catch (err) {
                    console.error("Error fetching similar properties:", err);
                } finally {
                    setLoadingSimilar(false);
                }
            }
        };
        fetchSimilarProperties();
    }, [property, id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4">
                <p className="text-red-500 font-bold">{error || "Property not found."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-[#1e3a5f] text-white px-6 py-2 rounded shadow-md"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Data Extraction Helpers
    const photos = property.media?.photos?.length ? property.media.photos : [
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80"
    ];
    const title = property.residential?.propertyTitle || property.location?.projectName || property.title || "Property Detail";
    const isCommercial = property.listingType === "COMMERCIAL";
    const price = isCommercial
        ? (property.pricing?.expectedPrice || 0)
        : (property.pricing?.startingPrice || 0);
    const pricingLabel = isCommercial ? "Expected Price" : "Starting Price";

    // Robust type labeling
    const propertyType = isCommercial
        ? (property.commercial?.propertyCategory || "Commercial Portfolio")
        : (property.residential?.propertyType || property.residential?.bhkType || "Residential Listing");

    const bhkText = property.residential?.bhkType || "";
    const purpose = property.purpose || (isCommercial ? (property.commercial?.propertyPurpose === "RENT_LEASE" ? "RENT" : "SELL") : "SELL");

    const area = property.residential?.carpetArea || property.commercial?.carpetArea || "N/A";
    const amenitiesList = property.residential?.amenities || property.commercial?.amenities || [];
    const amenityImages = property.residential?.amenityImages || property.commercial?.amenityImages || [];
    const floorPlans = property.media?.floorPlans || [];

    // Video handling
    const videoUrl = property.media?.uploadedVideo?.url ||
        property.media?.adminYoutubeLink ||
        (property.media?.videos?.length ? property.media.videos[0] : null);

    const prevImg = () =>
        setCurrentImg((p) => (p - 1 + photos.length) % photos.length);
    const nextImg = () =>
        setCurrentImg((p) => (p + 1) % photos.length);

    return (
        <div className="min-h-screen relative pt-10 pb-10">
            {/* ── Background Sky/Cityscape (Top Only) ── */}
            <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden -z-10 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4f9]/40 via-white/80 to-[#f0f4f9]" />
            </div>

            <div className={`max-w-6xl -mt-6 mx-auto px-4 flex flex-col gap-6 relative ${user?.role?.toUpperCase() === 'BUILDER' ? '' : 'lg:grid lg:grid-cols-12'}`}>

                {/* ── LEFT COLUMN ── */}
                <div className={`${user?.role?.toUpperCase() === 'BUILDER' ? 'max-w-4xl mx-auto w-full' : 'lg:col-span-8'} flex flex-col gap-6`}>

                    {/* Top Row: Gallery & Info */}
                    <div className="bg-white rounded p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 z-10">
                        {/* Gallery */}
                        <div className="relative w-full md:w-2/3 aspect-[16/10] bg-gray-50 rounded overflow-hidden group shadow-inner border border-gray-100">
                            {/* Blurred Background for Aspect Ratio Gaps */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-30 pointer-events-none"
                                style={{ backgroundImage: `url(${photos[currentImg]})` }}
                            />
                            
                            <img
                                src={photos[currentImg]}
                                alt={title || "Property Image"}
                                className="relative z-10 w-full h-full object-contain transition-all duration-500"
                            />
                            
                            {/* Hover Overlay with 4-Square Button */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                                <button
                                    onClick={() => setLightboxOpen(true)}
                                    className="bg-white/95 hover:bg-white text-gray-900 px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 pointer-events-auto shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                >
                                    <Grid size={18} />
                                    View All Photos
                                </button>
                            </div>

                            {/* Arrows - Floating Box style (Always Visible) */}
                            {photos.length > 1 && (
                                <div className="absolute bottom-4 left-4 bg-white/95 p-1.5 rounded-lg flex items-center gap-1 shadow-md z-30 pointer-events-auto">
                                    <button onClick={prevImg} className="hover:bg-gray-100 text-gray-800 p-1.5 rounded transition-colors active:scale-95">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5" />
                                    <button onClick={nextImg} className="hover:bg-gray-100 text-gray-800 p-1.5 rounded transition-colors active:scale-95">
                                        <ChevronRight size={16} />
                                    </button>
                                    <button className="ml-1 text-gray-600 px-2 py-1 text-[11px] font-bold">
                                        {currentImg + 1} / {photos.length}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Info */}
                        <div className="w-full md:w-1/3 flex flex-col pt-2">
                            <div className="flex gap-1.5 flex-wrap mb-4">
                                {property.status === "PUBLISHED" && (
                                    <span className="bg-[#1e3a5f] text-white text-[10px] font-bold px-3 py-1 rounded tracking-wider">PUBLISHED</span>
                                )}
                                <span className="bg-white text-gray-600 border border-gray-200 text-[10px] font-bold px-3 py-1 rounded">RERA Approved</span>
                                <span className={`text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider ${purpose === 'RENT' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                    {purpose === 'RENT' ? 'FOR RENT' : 'FOR SALE'}
                                </span>
                                <span className="bg-[#E87722] text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">{property.listingType}</span>
                            </div>

                            <div className="mb-4">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{pricingLabel}</div>
                                <div className="text-xl font-bold text-gray-900 leading-tight">
                                    {formatPrice(price)}
                                </div>
                                <div className="text-sm text-gray-600 mt-3 space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Layout size={14} className="text-[#1e3a5f]" />
                                        <span className="font-bold text-gray-800">{isCommercial ? propertyType.replace(/_/g, " ") : `${propertyType} Available`}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-3.5 h-3.5 border-[1.5px] border-[#1e3a5f] rounded-[2px] mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{area} sq.ft. Area</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Carpet Area</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy size={14} className="text-[#E87722]" />
                                        <span className="font-bold text-gray-800">{amenitiesList.length}+ Amenities</span>
                                    </div>

                                    {/* District and State shown prominently */}
                                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {[property.location?.city, property.location?.district, property.location?.state].filter(p => !!p).join(", ")}
                                        </p>
                                        <p className="text-[11px] text-gray-500 italic flex items-center gap-1.5">
                                            <span>📍 {property.location?.locality || "Local area"}</span>
                                        </p>
                                    </div>

                                    {/* Google Map Link */}
                                    {property.location?.googleMapLink && (
                                        <a
                                            href={property.location.googleMapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase tracking-widest mt-2 group"
                                        >
                                            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <Layout size={10} />
                                            </div>
                                            Open in Maps
                                        </a>
                                    )}
                                </div>
                            </div>

                            {user?.role?.toUpperCase() !== "BUILDER" && (
                                <Button
                                    onClick={() => {
                                        if (!user) {
                                            toast.error("Please login to contact the builder.");
                                            openLogin();
                                            return;
                                        }
                                        if (user.role?.toUpperCase() !== "BUYER") {
                                            setShowRoleModal(true);
                                            return;
                                        }
                                        const ownerName = property.residential?.builderName || property.userId?.name || "the owner";
                                        const locString = [property.location?.locality, property.location?.city, property.location?.district].filter(p => !!p).join(", ");
                                        router.push(`/book-vc?id=${property._id}&title=${encodeURIComponent(title || '')}&city=${encodeURIComponent(locString)}&img=${encodeURIComponent(photos[0] || '')}&owner=${encodeURIComponent(ownerName)}`);
                                    }}
                                    className="mt-auto w-full bg-[#3b5998] hover:bg-[#2d4373] text-white text-[12px] font-bold py-6 rounded tracking-widest transition-all shadow-[0_4px_12px_rgba(59,89,152,0.3)]"
                                >
                                    BOOK VC
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabs Row */}
                    <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-hide">
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-8 py-4 text-[11px] font-bold tracking-widest transition-all uppercase ${activeTab === tab ? "text-[#1e3a5f] bg-white" : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e3a5f]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === "OVERVIEW" && (
                                <div className="flex flex-col gap-8">
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        Located in {property.location?.city || property.location?.district}, this {property.listingType.toLowerCase()} property offers a premium {property.residential?.propertyType || property.commercial?.propertyCategory || "listing"} with modern architecture and high-quality finishes. The project, named "{property.location?.projectName || "Elite Residency"}", is strategically situated in {property.location?.locality || property.location?.city} with excellent connectivity.
                                    </p>

                                    {property.location?.googleMapLink && (
                                        <a
                                            href={property.location.googleMapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider transition-colors w-fit p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 group"
                                        >
                                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Layout size={12} className="text-blue-600" />
                                            </div>
                                            View Property on Google Maps
                                        </a>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 border border-gray-100 rounded overflow-hidden shadow-sm">
                                        <div className="flex flex-col items-center justify-center py-5 px-2 border-r border-gray-100 bg-[#1e3a5f] text-white">
                                            <div className="font-bold text-sm tracking-tight">{isCommercial ? propertyType.replace(/_/g, " ") : propertyType}</div>
                                            <div className="text-[11px] mt-1 text-white/70 uppercase tracking-wider">{isCommercial ? "Category" : "Available"}</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center py-5 px-2 border-r border-gray-100 bg-white text-gray-800">
                                            <div className="font-bold text-sm tracking-tight">{area} sq.ft.</div>
                                            <div className="text-[11px] mt-1 text-gray-500 uppercase tracking-wider">Area</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center py-5 px-1 border-r border-gray-100 bg-white text-gray-800">
                                            <div className="font-bold text-sm tracking-tight">{(property.residential?.possessionStatus || "READY").replace(/_/g, " ")}</div>
                                            <div className="text-[11px] mt-1 text-gray-500 uppercase tracking-wider">Status</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center py-5 px-2 bg-white text-gray-800">
                                            <div className="font-bold text-sm tracking-tight">{amenitiesList.length}</div>
                                            <div className="text-[11px] mt-1 text-gray-500 uppercase tracking-wider">Amenities</div>
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    <div>
                                        <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[#1e3a5f] rounded-full" />
                                            PROPERTY DETAILS
                                        </h3>
                                        <div className="border border-gray-100 rounded overflow-x-auto shadow-sm">
                                            <table className="min-w-[600px] lg:min-w-0 w-full text-[12px] border-collapse text-left">
                                                <tbody>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Property Type</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{property.residential?.propertyType || property.commercial?.propertyCategory || "N/A"}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Listing Type</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{property.listingType}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">{isCommercial ? "Category" : "BHK / Config"}</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{isCommercial ? propertyType.replace(/_/g, " ") : bhkText}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Purpose</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{purpose === 'RENT' ? 'For Rent' : 'For Sale'}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Possession</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{(property.residential?.possessionStatus || "READY").replace(/_/g, " ")}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Area</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{area} sq.ft.</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">City</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{property.location?.city || "N/A"}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">District</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{property.location?.district || "N/A"}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Locality</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{property.location?.locality || "N/A"}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Landmark</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{property.location?.landmark || "N/A"}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">State</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{property.location?.state || "N/A"}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Facing</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{property.residential?.facing || property.commercial?.facing || "N/A"}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Floors</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">
                                                            {((property.residential?.totalFloors || property.commercial?.totalFloors)) ? (
                                                                <>
                                                                    {property.residential?.floorNumber ?? property.commercial?.floorNumber ?? "0"} / {property.residential?.totalFloors || property.commercial?.totalFloors}
                                                                    <span className="text-[10px] text-gray-400 ml-1">(Current/Total)</span>
                                                                </>
                                                            ) : "N/A"}
                                                        </td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Floor Plans</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">
                                                            {property.media?.floorPlans?.length || 0} Available
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b border-gray-100">
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Age of Prop.</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">{property.residential?.propertyAge || property.commercial?.propertyAge || "New"}</td>
                                                        <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Status</td>
                                                        <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">
                                                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] border border-green-100">
                                                                {property.status || "LIVE"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {isCommercial && (
                                                        <tr className="border-b border-gray-100">
                                                            <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Sub-Type</td>
                                                            <td className="py-3 px-4 text-gray-800 font-bold w-[30%] border-r border-gray-100">
                                                                {property.commercial?.shopType || property.commercial?.officeType || "Standard"}
                                                            </td>
                                                            <td className="py-3 px-4 bg-[#f8fafc] text-gray-500 w-[20%] border-r border-gray-100 font-bold uppercase tracking-tighter">Purpose</td>
                                                            <td className="py-3 px-4 text-gray-800 font-bold w-[30%]">{property.commercial?.propertyPurpose?.replace("_", " ") || "N/A"}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-gray-400 font-medium italic">
                                        Disclaimer: Rates and availability are subject to change without notice. Please contact the builder/seller directly for the latest information.
                                    </p>
                                </div>
                            )}

                            {activeTab === "AMENITIES" && (
                                <div className="flex flex-col gap-10">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                        {amenitiesList.length > 0 ? amenitiesList.map((item: string, i: number) => (
                                            <div key={i} className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#1e3a5f] transition-all group">
                                                <div className="p-3 bg-white rounded-full text-[#1e3a5f] shadow-sm group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                                                    {amenityIcons[item] || <Home size={20} />}
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-700 tracking-tight text-center">
                                                    {item}
                                                </span>
                                            </div>
                                        )) : (
                                            <div className="col-span-4 text-center py-10 text-gray-400 italic text-sm">No specific amenities listed.</div>
                                        )}
                                    </div>

                                    {/* Amenity Images Gallery */}
                                    {amenityImages.length > 0 && (
                                        <div className="mt-4 pt-10 border-t border-gray-100">
                                            <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-[#E87722] rounded-full" />
                                                Amenity Images
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {amenityImages.map((url: string, i: number) => (
                                                    <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => {
                                                        // Fallback logic to show in main gallery or just open in new tab
                                                        window.open(url, '_blank');
                                                    }}>
                                                        <img src={url} alt={`Amenity ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "VIDEO TOUR" && (
                                <div className="flex flex-col items-center">
                                    {videoUrl ? (
                                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-gray-200">
                                            {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                                                <iframe
                                                    src={videoUrl.includes("v=") ? `https://www.youtube.com/embed/${videoUrl.split('v=')[1].split('&')[0]}` : `https://www.youtube.com/embed/${videoUrl.split('/').pop()}`}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video src={videoUrl} controls className="w-full h-full" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                                            <Layout size={40} className="opacity-20" />
                                            <p className="text-sm font-medium italic">No video tour available for this property.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "FLOOR PLANS" && (
                                <div className="grid grid-cols-2 gap-6">
                                    {floorPlans.length > 0 ? floorPlans.map((img: string, i: number) => (
                                        <div key={i} className="border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow bg-gray-50">
                                            <img src={img} alt={`Floor Plan ${i + 1}`} className="w-full h-auto object-contain bg-white" />
                                            <div className="p-3 text-[11px] font-bold text-gray-600 text-center uppercase tracking-widest bg-white border-t border-gray-100">
                                                Floor Plan {i + 1}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 text-center py-10 text-gray-400 italic text-sm">Floor plans are not available for this property.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === "ABOUT BUILDER" && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-5 p-6 bg-[#f8fafc] rounded-lg border border-gray-100">
                                        <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white">
                                            <User size={30} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-wider">
                                                {property.residential?.builderName || "Elite Builders Group"}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Listed by {property.userId?.name || "Admin"}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        Our commitment to excellence and innovation has made us a leading name in the real estate industry. We strive to provide prime living spaces that combine luxury, comfort, and sustainability. For more details about our other projects or specific documentation for "{title}", please contact us using the inquiry form.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (Sidebar) ── */}
                {user?.role?.toUpperCase() !== "BUILDER" && (
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Contact Form */}
                        <div className="bg-white rounded shadow-sm border border-gray-100 p-6 flex flex-col sticky top-24">
                            <h3 className="text-center text-[12px] font-bold text-gray-800 uppercase tracking-[2px] mb-6">
                                BOOK VC
                            </h3>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!user) {
                                    toast.error("Please login to send an inquiry.");
                                    openLogin();
                                    return;
                                }
                                if (user.role?.toUpperCase() !== "BUYER") {
                                    setShowRoleModal(true);
                                    return;
                                }
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    propertyId: id,
                                    buyerName: formData.get("buyerName"),
                                    buyerMobile: buyerMobile,
                                    message: formData.get("message"),
                                };

                                try {
                                    const response = await api("/leads", {
                                        method: "POST",
                                        body: JSON.stringify(data),
                                    });
                                    toast.success(response.message || "Your inquiry has been sent to the property owner.");
                                    (e.target as HTMLFormElement).reset();
                                    setBuyerMobile("");
                                } catch (err: any) {
                                    toast.error(err.message || "Failed to send inquiry.");
                                }
                            }} className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    name="buyerName"
                                    required
                                    placeholder="Your Name"
                                    className="w-full h-11 border border-gray-200 rounded px-4 text-xs font-medium outline-none focus:border-[#1e3a5f] transition-colors placeholder:text-gray-400"
                                />
                                <div className="mb-4">
                                    <input
                                        type="tel"
                                        name="buyerMobile"
                                        required
                                        maxLength={10}
                                        minLength={10}
                                        pattern="[5-9][0-9]{9}"
                                        title="Mobile number must be 10 digits starting with 5, 6, 7, 8, or 9"
                                        placeholder="Your Mobile"
                                        value={buyerMobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setBuyerMobile(val);
                                        }}
                                        className={`w-full h-11 border rounded px-4 text-xs font-medium outline-none transition-colors placeholder:text-gray-400 ${buyerMobile && !/^[5-9]\d{9}$/.test(buyerMobile) ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#1e3a5f]'}`}
                                    />
                                    {buyerMobile && !/^[5-9]\d{9}$/.test(buyerMobile) && (
                                        <p className="text-red-500 text-[10px] font-semibold mt-1 px-1">
                                            Must be 10 digits starting with 5,6,7,8 or 9
                                        </p>
                                    )}
                                </div>
                                <textarea
                                    name="message"
                                    placeholder="Your Message"
                                    rows={4}
                                    className="w-full border border-gray-200 rounded p-4 text-xs font-medium outline-none focus:border-[#1e3a5f] transition-colors placeholder:text-gray-400 resize-none"
                                    defaultValue={`Hi, I am interested in "${title}". Please provide more information.`}
                                />
                                <button type="submit" disabled={buyerMobile ? !/^[5-9]\d{9}$/.test(buyerMobile) : false} className="w-full bg-[#1e3a5f] hover:bg-[#16304f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-[11px] font-bold py-3.5 rounded tracking-widest transition-all shadow-md">
                                    SEND INQUIRY
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <h2 className="text-[13px] font-bold text-gray-800 uppercase tracking-widest mb-6 px-2 border-l-4 border-[#1e3a5f] pl-4">More Properties by {property.createdBy?.name || property.residential?.builderName || "this Owner"}</h2>
                {loadingSimilar ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
                    </div>
                ) : similarProperties.length > 0 ? (
                    <PropertyGrid properties={similarProperties} />
                ) : (
                    <p className="text-gray-500 italic text-sm py-4">No other properties found from this owner.</p>
                )}
            </div>

            {/* Fullscreen Lightbox */}
            {lightboxOpen && photos.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex justify-between items-center p-4 md:p-6 text-white absolute top-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex flex-col">
                            <p className="text-white font-bold text-sm">Property Gallery</p>
                            <p className="text-white/50 text-[10px] uppercase tracking-widest">{currentImg + 1} / {photos.length}</p>
                        </div>
                        <button onClick={() => setLightboxOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center w-full h-full pt-16 pb-24 px-4 md:px-16">
                        <button onClick={prevImg} className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                            <ChevronLeft size={24} />
                        </button>

                        <div className="w-full h-full flex items-center justify-center relative">
                            <img
                                src={photos[currentImg]}
                                alt="Gallery View"
                                className="max-w-[90vw] max-h-[70vh] object-contain drop-shadow-2xl rounded-xl"
                            />
                        </div>

                        <button onClick={nextImg} className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Thumbnails */}
                    <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-2 overflow-x-auto scrollbar-hide">
                        {photos.map((url: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImg(idx)}
                                className={`relative w-16 h-12 md:w-20 md:h-14 rounded overflow-hidden shrink-0 transition-all ${currentImg === idx ? 'ring-2 ring-white scale-110 z-10' : 'opacity-40 hover:opacity-100'}`}
                            >
                                <img src={url} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
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
