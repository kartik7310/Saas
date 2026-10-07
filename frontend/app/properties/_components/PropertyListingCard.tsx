"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCompareList, toggleCompare } from "@/lib/compareStorage";
import { formatPrice } from "@/lib/utils";

export default function PropertyListingCard({ property }: any) {
    const [isCompared, setIsCompared] = useState(false);
    const [compareCount, setCompareCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const checkCompare = () => {
            const list = getCompareList();
            setIsCompared(list.includes(property._id));
            setCompareCount(list.length);
        };
        checkCompare();

        window.addEventListener("compareUpdated", checkCompare as any);
        return () => window.removeEventListener("compareUpdated", checkCompare as any);
    }, [property._id]);

    const handleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(property._id);
    };

    // Determine title
    const title = property.residential?.propertyTitle ||
        property.location?.projectName ||
        property.title ||
        "Property Listing";

    // Determine price label and value
    const isCommercial = property.listingType === "COMMERCIAL" || !!property.commercial;
    const priceLabel = isCommercial ? "Expected Price" : "Starting Price";
    const priceValue = isCommercial
        ? (property.pricing?.expectedPrice || property.pricing?.expectedRent)
        : property.pricing?.startingPrice;

    const formattedPrice = priceValue
        ? formatPrice(priceValue)
        : "Price Options Available";

    // Determine BHK and Area
    const bhk = property.residential?.bhkType || "";
    const area = property.residential?.carpetArea || property.commercial?.carpetArea;
    const areaText = area ? `${area} sq.ft.` : "";

    // Image fallback
    const imageUrl = property.media?.photos?.[0] ||
        property.image ||
        "/images/building.png";

    // Amenities fallback
    const amenities = property.residential?.amenities?.length
        ? `${property.residential.amenities.length}+ Amenities`
        : (property.amenities || "");

    return (
        <div className="bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full flex flex-col relative w-full">

            {/* Compare Toggle */}
            <div className="absolute top-2 right-2 z-10">
                <button
                    onClick={handleCompare}
                    disabled={!isCompared && compareCount >= 3}
                    className={`text-xs font-semibold px-3 py-1.5 rounded shadow cursor-pointer transition-colors ${isCompared
                        ? "bg-green-600 text-white hover:bg-green-700 border border-green-700"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                >
                    {isCompared ? "✓ Added" : "+ Compare"}
                </button>
            </div>

            {/* Property Image */}
            <div className="overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={title || "Property Image"}
                    className="w-full object-cover hover:scale-105 transition-transform duration-300"
                    style={{ height: "180px" }}
                />
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col flex-grow">

                {/* Title & Badge */}
                <div className="flex items-center justify-between gap-2 mb-2 w-full">
                    <h3 
                        className="font-bold text-gray-900 text-base truncate flex-1 min-w-0 cursor-pointer hover:text-blue-600 transition-colors"
                        title={title}
                    >
                        {title}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0 ${property.purpose === 'RENT' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {property.purpose === 'RENT' ? 'FOR RENT' : 'FOR SALE'}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0 ${isCommercial ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {property.listingType || (isCommercial ? 'COMMERCIAL' : 'RESIDENTIAL')}
                        </span>
                    </div>
                </div>

                {/* Subtitle / Type & Status row */}
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>{property.residential?.propertyType || property.commercial?.propertyCategory?.replace("_", " ")}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-600 uppercase">
                        {(property.residential?.possessionStatus || "Ready").replace(/_/g, " ")}
                    </span>
                </div>

                {/* BHK | Area | Floor row */}
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1 font-medium">
                    {bhk && <span>{bhk}</span>}
                    {bhk && (areaText || property.residential?.floorNumber !== undefined) && <span className="text-gray-300">|</span>}
                    {areaText && <span>{areaText}</span>}
                    {areaText && property.residential?.floorNumber !== undefined && <span className="text-gray-300">|</span>}
                    {property.residential?.floorNumber !== undefined && (
                        <span>F: {property.residential.floorNumber}/{property.residential.totalFloors || "G"}</span>
                    )}
                </div>

                {/* Amenities */}
                <p className="text-gray-600 text-sm font-semibold mb-3">
                    {amenities}
                </p>

                {/* Push content to bottom */}
                <div className="mt-auto">
                    {/* Divider */}
                    <div className="border-t border-gray-100 mb-3" />

                    {/* Price + CTA row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">{priceLabel}</span>
                            <p className="text-gray-900 text-sm font-bold leading-none">
                                {formattedPrice}
                            </p>
                        </div>
                        <button
                            className="text-white text-xs font-bold px-4 py-2 rounded transition-opacity hover:opacity-90 whitespace-nowrap cursor-pointer flex-shrink-0"
                            style={{ backgroundColor: "#1a3c6e" }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/properties/${property._id}`);
                            }}
                        >
                            VIEW DETAILS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
