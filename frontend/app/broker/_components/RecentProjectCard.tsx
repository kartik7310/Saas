import Image from "next/image";
import { Pencil } from "lucide-react";
import { Project } from "@/types/dashboard";
import { formatPrice } from "@/lib/utils";

interface RecentProjectCardProps {
    project: Project;
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
}

export default function RecentProjectCard({ project, onView, onEdit }: RecentProjectCardProps) {
    const { _id, media, title, location, pricing, listingType } = project;

    const image = media?.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80";
    const city = location?.city || "N/A";
    
    // Robust pricing label logic
    const isCommercial = listingType === "COMMERCIAL" || !!project.commercial;
    const priceLabel = isCommercial ? "Expected Price" : "Starting Price";
    const priceValue = pricing?.expectedPrice || pricing?.startingPrice || pricing?.expectedRent;
    const formattedPrice = formatPrice(priceValue);

    return (
        <div className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full">
            {/* Image */}
            <div className="relative w-full aspect-[4/3]">
                <Image
                    src={image}
                    alt={title || "Property Image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 text-left">
                <h3 className="text-[17px] font-bold text-gray-900 truncate">
                    {title}
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 line-clamp-1">
                    {city}
                </p>
                <div className="flex flex-col mt-3">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">{priceLabel}</span>
                    <p className="text-gray-900 text-sm font-bold leading-none">
                        {formattedPrice}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-5">
                    <button
                        onClick={() => onView?.(_id)}
                        className="flex-1 h-10 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        View
                    </button>
                    <button
                        onClick={() => onEdit?.(_id)}
                        className="flex-1 h-10 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}
