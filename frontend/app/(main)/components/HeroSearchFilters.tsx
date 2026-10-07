"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { propertyTypes } from "../../mock-data/mockData2";

export default function HeroSearchFilters() {
  const router = useRouter();

  const [purpose, setPurpose] = useState("Buy");
  const [propertyType, setPropertyType] = useState("");

  const handleSearch = () => {
    let pType = propertyType;
    let lType = "";

    if (["Apartment", "Villa", "Service Appt", "Plot", "Builder Floor", "Studio / 1 RK", "Penthouse"].includes(propertyType)) {
      if (propertyType === "Apartment") pType = "APARTMENT";
      else if (propertyType === "Villa") pType = "VILLA";
      else if (propertyType === "Plot") pType = "PLOT";
      else pType = propertyType.toUpperCase().replace(/[\/\s\-]+/g, "_");
      lType = "RESIDENTIAL";
    } else if (["Shop/Retails", "Office Space"].includes(propertyType)) {
      lType = "COMMERCIAL";
      pType = "";
    }

    const params = new URLSearchParams();
    if (purpose) params.append("purpose", purpose === "Rent" ? "RENT" : "SELL");
    if (lType) params.append("listingType", lType);
    if (pType) params.append("propertyType", pType);

    router.push(`/properties?${params.toString()}`);
  };

  const SF = ({
    label,
    value,
    onChange,
    children,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <div className="flex-1 min-w-0">
      <label className="text-white text-[7px] md:text-[9px] font-black mb-0.5 block tracking-widest uppercase ml-0.5 truncate">
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/95 text-gray-800 text-[11px] md:text-[12px] font-bold px-2 md:px-3 pr-6 md:pr-8 py-2 md:py-2.5 rounded-lg md:rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-md hover:bg-white cursor-pointer"
        >
          {children}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-row items-end gap-2 md:gap-4 w-full max-w-2xl">
        {/* 1. I Want To */}
        <SF label="I Want To" value={purpose} onChange={setPurpose}>
          <option value="Buy">Buy</option>
          <option value="Rent">Rent</option>
        </SF>

        {/* 2. Property Type */}
        <SF label="Property Type" value={propertyType} onChange={setPropertyType}>
          <option value="">Any Type</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </SF>

        {/* Search Button */}
        <div className="shrink-0 self-end">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-1.5 md:gap-3 bg-[#000b21] hover:bg-black text-white font-black text-[10px] md:text-[12px] uppercase tracking-wider md:tracking-[0.2em] px-4 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all shadow-xl active:scale-95 group border border-white/5 whitespace-nowrap"
          >
            <Search size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">SEARCH</span>
            <span className="sm:hidden">GO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
