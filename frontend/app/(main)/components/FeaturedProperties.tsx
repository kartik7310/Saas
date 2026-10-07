"use client";
import { useState, useEffect, useRef } from "react";
import { Bed, Bath, Maximize, Loader2, SearchX, MapPin, ExternalLink, Sparkles, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import Link from "next/link";

interface FeaturedPropertiesProps {
    role?: "BUILDER" | "SELLER" | "BROKER";
    title?: string;
    filters?: any;
    direction?: "left" | "right";
}



function FeaturedCardImage({ property }: { property: any }) {
    const photos = property.media?.photos?.length ? property.media.photos : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80"];
    const [imgIdx, setImgIdx] = useState(0);
    const alt = property.residential?.propertyTitle || property.title || "Property";

    useEffect(() => {
        if (photos.length <= 1) return;
        const timer = setInterval(() => {
            setImgIdx((prev) => (prev + 1) % photos.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [photos.length]);

    return (
        <div className="relative w-full h-52 sm:h-56 md:h-64 overflow-hidden bg-gray-100 shrink-0">
            {photos.map((photo: string, i: number) => (
                <img
                    key={i}
                    src={photo}
                    alt={alt}
                    className={`absolute inset-0 z-10 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${i === imgIdx ? "opacity-100" : "opacity-0"}`}
                />
            ))}
            {/* Image dots indicator */}
            {photos.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-1">
                    {photos.map((_: string, i: number) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === imgIdx ? "bg-white scale-125 shadow" : "bg-white/50"}`} />
                    ))}
                </div>
            )}
            {/* Top-left: RENT / SALE badge */}
            <div className="absolute top-2 left-2 z-30">
                <span className={`text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider ${property.purpose === 'RENT' ? 'bg-blue-600' : 'bg-red-600'}`}>
                    {property.purpose === 'RENT' ? 'RENT' : 'SALE'}
                </span>
            </div>
            {/* Top-right: FEATURED badge */}
            <div className="absolute top-2 right-2 z-30">
                <span className="bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-0.5">
                    ★ FEATURED
                </span>
            </div>
            {/* Bottom overlay: property type + possession */}
            <div className="absolute bottom-2 inset-x-2 flex justify-between items-center z-30">
                <span className="bg-[#003d29] text-white text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-widest border border-white/20">
                    {property.residential?.propertyType || property.commercial?.propertyCategory?.replace("_", " ") || "APARTMENT"}
                </span>
                <span className="bg-[#00a651] text-white text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-wider">
                    {(property.residential?.possessionStatus || "READY TO MOVE").replace(/_/g, " ")}
                </span>
            </div>
        </div>
    );
}

export default function FeaturedProperties({ role, title, filters = {}, direction = "left" }: FeaturedPropertiesProps) {
    const [properties, setProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const visibleCount = 4;

    const handleScroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 400; // card width + gap
            scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchProperties = async () => {
            setIsLoading(true);
            try {
                // Determine API endpoint: Priority to featured-properties if role is present
                let endpoint = "/featured-properties";
                const params = new URLSearchParams();

                if (role) {
                    params.append("role", role);
                }

                // Add other potential filters from props
                if (filters) {
                    for (const [key, value] of Object.entries(filters)) {
                        if (value) params.append(key, String(value));
                    }
                }

                const res = await api(`${endpoint}?${params.toString()}`);

                // Handle different response structures (FeaturedProperty returns {success, data}, properties returns {results})
                const data = res.data || res.results || res;

                if (Array.isArray(data)) {
                    setProperties(data);
                    setStartIndex(0);

                    // Scroll to featured section if filter is applied
                    if (Object.keys(filters).length > 0 && sectionRef.current) {
                        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            } catch (err) {
                console.error("Error fetching featured properties:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProperties();
    }, [role, JSON.stringify(filters)]);

    const goUp = () => setStartIndex((i) => Math.max(0, i - 1));
    const goDown = () => setStartIndex((i) => Math.min(properties.length - visibleCount, i + 1));

    const visibleProperties = properties.slice(startIndex, startIndex + visibleCount);

    const displayTitle = title || (role ? `${role.charAt(0) + role.slice(1).toLowerCase()} Featured Properties` : "Featured Properties");

    if (isLoading) {
        return (
            <div className="bg-white py-16 flex flex-col items-center justify-center border-b border-gray-100">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                <p className="text-gray-400 font-medium text-xs uppercase tracking-widest">Updating {displayTitle}...</p>
            </div>
        );
    }

    if (properties.length === 0) {
        return null; // Always hide if empty, no placeholders
    }


    // Enforce max 10 properties and duplicate for seamless scroll
    const baseProperties = properties.slice(0, 10);

    // Repeat properties enough times to fill the screen width and prevent gaps
    // We aim for a healthy number of scrolls before reset
    const repetition = baseProperties.length > 0 ? (baseProperties.length < 5 ? 8 : 4) : 0;
    const sliderProperties = baseProperties.length > 0
        ? Array(repetition).fill(baseProperties).flat()
        : [];

    // Dynamic duration based on total items to keep speed consistent
    const duration = Math.max(40, baseProperties.length * repetition * 4);

    // Calculate the exact percentage to shift for a seamless loop
    const shiftPercentage = baseProperties.length > 0 ? (100 / repetition) : 0;

    return (
        <section ref={sectionRef} className="relative w-full bg-white pt-3 pb-6 overflow-hidden border-b border-gray-100">
            {/* Cityscape Background Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.03] grayscale pointer-events-none"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop')",
                }}
            />

            {/* Marquee text layer */}
            <div className="overflow-hidden mb-3 relative z-10">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(6)].map((_, i) => (
                        <span key={i} className="text-gray-900 text-xl md:text-2xl font-black tracking-tight mx-4">
                            {displayTitle} <span className="text-purple-600 mx-2">★</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Cards Slider - Continuous infinite scroll */}
            <div className="relative w-full z-20 pb-8 group/slider">
                {/* Navigation Buttons */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 z-40 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        onClick={() => handleScroll('left')}
                        className="p-3 bg-white/90 hover:bg-purple-600 hover:text-white backdrop-blur-md rounded-full border border-gray-200 text-gray-800 transition-all shadow-xl pointer-events-auto"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        onClick={() => handleScroll('right')}
                        className="p-3 bg-white/90 hover:bg-purple-600 hover:text-white backdrop-blur-md rounded-full border border-gray-200 text-gray-800 transition-all shadow-xl pointer-events-auto"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div
                    ref={scrollRef}
                    className="overflow-x-auto scrollbar-hide group/container"
                >
                    <div
                        className={`flex gap-6 px-6 w-max ${direction === "right" ? "animate-scroll-cards-reverse" : "animate-scroll-cards"
                            }`}
                        style={{
                            animationDuration: `${duration}s`,
                            "--shift-percent": `-${shiftPercentage}%`
                        } as React.CSSProperties}
                    >
                        {sliderProperties.map((property, i) => (
                            <div
                                key={`${property._id}-${i}`}
                                className="w-[280px] sm:w-[300px] md:w-[340px] shrink-0 bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col shadow-lg relative"
                            >
                                <Link href={`/properties/${property._id}`} className="absolute inset-0 z-20" />

                                {/* IMAGE ON TOP */}
                                <FeaturedCardImage property={property} />

                                {/* CONTENT AT BOTTOM */}
                                <div className="flex flex-col flex-1 px-4 py-3 relative z-20 gap-2">
                                    {/* Title + BOOK VC */}
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="text-gray-900 font-bold text-sm leading-snug line-clamp-1 flex-1">
                                            {property.residential?.propertyTitle || property.commercial?.propertyName || property.title || "Property Title"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Link
                                                href={`/properties/${property._id}`}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors relative z-30"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink size={12} className="text-blue-500" />
                                            </Link>
                                            <Link
                                                href={`/book-vc?id=${property._id}&title=${encodeURIComponent(property.residential?.propertyTitle || property.commercial?.propertyName || property.title || "Property")}&city=${encodeURIComponent(property.location?.city || "")}&img=${encodeURIComponent(property.media?.photos?.[0] || "")}&owner=${encodeURIComponent(property.createdBy?.name || "Representative")}`}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-[9px] font-black text-white transition-all relative z-30 shadow-md shadow-purple-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Video size={10} /> Book VC
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-1 text-gray-500 text-[10px] font-medium">
                                        <MapPin size={10} className="text-purple-500 shrink-0 mt-0.5" />
                                        <span className="truncate">
                                            {[property.location?.locality, property.location?.city].filter(Boolean).join(", ") || "Ghaziabad, Uttar Pradesh"}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 mt-auto pt-2" />

                                    {/* Price + specs row */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <p className="text-gray-400 text-[8px] uppercase font-black tracking-widest leading-none mb-1">
                                                Starting Price
                                            </p>
                                            <p className="text-purple-700 font-black text-lg leading-none">
                                                {formatPrice(property.listingType === "COMMERCIAL"
                                                    ? (property.pricing?.expectedPrice || property.pricing?.expectedRent || 0)
                                                    : (property.pricing?.startingPrice || 150000))}
                                            </p>
                                        </div>

                                        {/* BHK + Area */}
                                        <div className="flex items-center gap-3 text-gray-500 text-[10px] font-bold">
                                            <span className="flex items-center gap-1">
                                                <Bed size={12} className="text-gray-400" />
                                                {property.residential?.bhkType || "3BHK"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Maximize size={12} className="text-gray-400" />
                                                {property.residential?.carpetArea || "1000"} SF
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                @keyframes scroll-cards {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(var(--shift-percent)); }
                }
                .animate-scroll-cards {
                    display: flex;
                    width: max-content;
                    animation-name: scroll-cards;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                @keyframes scroll-cards-reverse {
                    0% { transform: translateX(var(--shift-percent)); }
                    100% { transform: translateX(0); }
                }
                .animate-scroll-cards-reverse {
                    display: flex;
                    width: max-content;
                    animation-name: scroll-cards-reverse;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                .group\/container:hover .animate-scroll-cards,
                .group\/container:hover .animate-scroll-cards-reverse {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}