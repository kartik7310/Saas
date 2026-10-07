"use client";
import { useState, useEffect } from "react";
import { BedDouble, Square, MapPin, Video, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef } from "react";

const tabs = [
  { id: "rent", label: "Rent", icon: "🏠" },
  { id: "sell", label: "Sell", icon: "🔔" },
];

function PropertyCard({ item, purpose }: { item: any; purpose: string }) {
  const photos = item.media?.photos?.length ? item.media.photos : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400"];
  const [imgIdx, setImgIdx] = useState(0);
  const title = item.residential?.propertyTitle || item.location?.projectName || item.title || "Luxury Property";
  const isCommercial = item.listingType === "COMMERCIAL" || !!item.commercial;
  const price = isCommercial
    ? (item.pricing?.expectedPrice || item.pricing?.expectedRent || 0)
    : (item.pricing?.startingPrice || 0);
  const bhk = item.residential?.bhkType ? item.residential.bhkType.replace(/\D/g, "") : null;
  const area = item.residential?.carpetArea || item.commercial?.carpetArea || "N/A";

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <div className="relative group/card h-full w-[300px] md:w-[350px] shrink-0">
      <Link href={`/properties/${item._id}`} className="absolute inset-0 z-20" />

      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 text-left flex flex-col h-full">
        <div className="relative h-[180px] overflow-hidden bg-gray-50 shrink-0">
          {/* Blurred Background to fill gaps */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-30 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${photos[imgIdx]})` }}
          />
          {photos.map((photo: string, i: number) => (
            <img
              key={i}
              src={photo}
              alt={title}
              className={`absolute inset-0 z-10 w-full h-full object-cover group-hover/card:scale-105 transition-all duration-700 ${i === imgIdx ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          {/* Image dots indicator */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1">
              {photos.map((_: string, i: number) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === imgIdx ? "bg-white scale-125 shadow" : "bg-white/50"}`} />
              ))}
            </div>
          )}
          <div className="absolute top-3 left-3 z-30">
            <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
              ★ Featured
            </span>
          </div>
          <div className="absolute top-3 right-3 z-30">
            <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm ${purpose.toUpperCase() === 'RENT' ? 'bg-blue-600' : 'bg-red-600'}`}>
              {purpose.toUpperCase() === 'RENT' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-gray-900 font-bold text-sm line-clamp-1 flex-1">
              {title}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <MapPin size={10} className="text-purple-500 shrink-0" />
              <span className="truncate max-w-[150px]">
                {item.location?.locality ? `${item.location.locality}, ` : ""}
                {item.location?.city || ""}
                {(!item.location?.locality && !item.location?.city) ? (item.location?.district || "India") : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {item.residential?.propertyType || item.commercial?.propertyCategory?.replace("_", " ") || "Residential"}
            </span>
            <span className="text-[9px] text-emerald-600 font-bold uppercase">
              {(item.residential?.possessionStatus || "READY").replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-[12px] text-gray-500 gap-3">
              {!isCommercial && bhk && (
                <span className="flex items-center gap-1"><BedDouble size={12} /> {bhk} BHK</span>
              )}
              <span className="flex items-center gap-1"><Square size={12} /> {area} sqft</span>
            </div>
            <Link
              href={`/book-vc?id=${item._id}&title=${encodeURIComponent(item.residential?.propertyTitle || item.location?.projectName || item.title || "Property")}&city=${encodeURIComponent(item.location?.locality ? `${item.location.locality}, ${item.location.city || ''}` : (item.location?.city || item.location?.district || ""))}&img=${encodeURIComponent(item.media?.photos?.[0] || "")}&owner=${encodeURIComponent(item.createdBy?.name || "Representative")}`}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black transition-all relative z-30 shadow-md shadow-purple-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Video size={10} /> BOOK VC
            </Link>
          </div>

          <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50">
            <div className="text-purple-700 font-black text-lg">
              {formatPrice(price)}
              {purpose.toUpperCase() === 'RENT' && price > 1 && <span className="text-[10px] text-gray-400 font-normal">/mo</span>}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">
              {item.amenities?.length || 5}+ Amenities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ properties, direction, purpose }: { properties: any[]; direction: "left" | "right"; purpose: string }) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (properties.length === 0) return null;

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 400;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // We need to ensure the content width is at least 2x the viewport width to loop seamlessly.
  const repeatCount = properties.length < 3 ? 12 : properties.length < 6 ? 8 : 4;
  const duplicatedProperties = Array(repeatCount).fill(properties).flat();
  const duration = Math.max(40, properties.length * (repeatCount / 2) * 10);

  return (
    <div
      className="relative w-full overflow-hidden py-4 group/marquee"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-40 opacity-0 group-hover/marquee:opacity-100 transition-opacity duration-300 pointer-events-none">
        <button
          onClick={() => handleScroll('left')}
          className="p-3 bg-white/90 hover:bg-purple-600 hover:text-white backdrop-blur-md rounded-full border border-gray-200 text-gray-800 transition-all shadow-xl pointer-events-auto"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 opacity-0 group-hover/marquee:opacity-100 transition-opacity duration-300 pointer-events-none">
        <button
          onClick={() => handleScroll('right')}
          className="p-3 bg-white/90 hover:bg-purple-600 hover:text-white backdrop-blur-md rounded-full border border-gray-200 text-gray-800 transition-all shadow-xl pointer-events-auto"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
      >
        <div
          className="flex gap-6 w-fit animate-marquee transition-transform duration-500"
          style={{
            animationDuration: `${duration}s`,
            animationDirection: direction === "right" ? "reverse" : "normal",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {duplicatedProperties.map((item, idx) => (
            <PropertyCard key={`${item._id}-${idx}`} item={item} purpose={purpose} />
          ))}
        </div>
      </div>
    </div>
  );
}

const BHK_OPTIONS = [
  { value: "", label: "All BHK" },
  { value: "1BHK", label: "1 BHK" },
  { value: "2BHK", label: "2 BHK" },
  { value: "3BHK", label: "3 BHK" },
  { value: "4BHK", label: "4+ BHK" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "READY_TO_MOVE", label: "Ready to Move" },
  { value: "NEW_LAUNCH", label: "New Launch" },
  { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
];

const ROLE_OPTIONS = [
  { value: "", label: "All Posters" },
  { value: "SELLER", label: "Seller" },
  { value: "BUILDER", label: "Builder" },
  { value: "BROKER", label: "Partner" },
];

function FilterSelect({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative group/sel">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
        <span className="text-sm">{icon}</span>
        <div className="flex flex-col items-start">
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 leading-none mb-0.5">
            {label}
          </span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-[11px] font-bold text-gray-800 bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none min-w-[110px]"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <svg className="w-3 h-3 text-gray-400 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function PropertiesSection() {
  const [activeTab, setActiveTab] = useState("rent");
  const [bhk, setBhk] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [row1, setRow1] = useState<any[]>([]);
  const [row2, setRow2] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("purpose", activeTab.toUpperCase());
        params.set("limit", "20");
        if (bhk) params.set("bhkType", bhk);
        if (status) params.set("possessionStatus", status);
        if (role) params.set("role", role);

        const res = await api(`/featured-properties?${params.toString()}`);
        const items = res.data || res.results || (Array.isArray(res) ? res : []);

        if (Array.isArray(items)) {
          const mid = Math.ceil(items.length / 2);
          setRow1(items.slice(0, mid));
          setRow2(items.slice(mid));
        }
      } catch (err) {
        console.error("Error fetching featured properties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, [activeTab, bhk, status, role]);

  const hasActiveFilters = !!(bhk || status || role);

  return (
    <section className="py-10 bg-[#f8fbff] overflow-hidden">
      <div className="w-full text-center">
        {/* Header */}
        <div className="mb-8 px-6">
          <span className="text-purple-600 font-bold tracking-widest uppercase text-[12px]">
            Our Properties
          </span>
          <h2 className="text-2xl md:text-4xl font-black mt-3 text-gray-900">
            We Bring Dream Homes To Reality
          </h2>
        </div>

        {/* ── Rent / Sell Tabs ── */}
        <div className="flex justify-center gap-4 mb-6 px-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-white p-2 rounded-full shadow-sm flex gap-2 border border-gray-100 flex-nowrap whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm cursor-pointer font-bold transition-all duration-300 ${activeTab === tab.id
                  ? "bg-[#000b21] text-white shadow-lg scale-105"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <span className="text-xs">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Extra Filters Row ── */}
        {/* <div className="flex flex-wrap justify-center gap-3 mb-10 px-6">
          <FilterSelect
            label="No. of Bedrooms"
            icon="🛏️"
            value={bhk}
            options={BHK_OPTIONS}
            onChange={setBhk}
          />
          <FilterSelect
            label="Construction Status"
            icon="🏗️"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
          <FilterSelect
            label="Posted By"
            icon="👤"
            value={role}
            options={ROLE_OPTIONS}
            onChange={setRole}
          />
          {hasActiveFilters && (
            <button
              onClick={() => { setBhk(""); setStatus(""); setRole(""); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 text-[11px] font-black uppercase tracking-widest transition-all"
            >
              ✕ Clear Filters
            </button>
          )}
        </div> */}

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              Updating Collection...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {row1.length > 0 && (
              <div className="relative">
                <MarqueeRow properties={row1} direction="left" purpose={activeTab} />
              </div>
            )}

            {row2.length > 0 && (
              <div className="relative">
                <MarqueeRow properties={row2} direction="right" purpose={activeTab} />
              </div>
            )}

            {!row1.length && !row2.length && (
              <div className="py-20 text-gray-400 font-medium">
                No featured {activeTab} properties found
                {hasActiveFilters ? " for selected filters." : "."}
              </div>
            )}
          </div>
        )}

        <div className="mt-16 px-6">
          <Link
            href="/properties"
            className="inline-block bg-[#000b21] hover:bg-purple-700 text-white font-bold px-12 py-4 rounded-full transition-all shadow-xl hover:shadow-purple-200 hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-widest"
          >
            Explore Global Inventory
          </Link>
        </div>
      </div>
    </section>
  );
}


