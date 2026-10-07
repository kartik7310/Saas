"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    MapPin,
    Calendar,
    Home,
    IndianRupee,
    Square,
    CheckCircle
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function CompareCard({ project, remove, isBestPrice, isBestArea, isOverallBest }: any) {
    const router = useRouter()

    return (
        <div className={`bg-white border-2 rounded-lg overflow-hidden flex flex-col h-full relative transition-all duration-300 ${isOverallBest ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02] z-10' : 'border-gray-100 shadow-sm'}`}>
            
            {/* Recommendation Banner */}
            {isOverallBest && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold text-center py-1.5 px-4 shadow-sm flex items-center justify-center gap-1.5 w-full">
                    <CheckCircle size={14} />
                    Platform Recommended
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
                <span className="text-sm font-semibold text-gray-700 truncate mr-2" title={project.title}>
                    {project.title || "-"}
                </span>
                <button
                    onClick={() => remove(project.id)}
                    className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0"
                >
                    ✕
                </button>
            </div>

            {/* Image */}
            <div className="p-3">
                <img
                    src={project.image || "/images/building.png"}
                    className="w-full h-[140px] rounded-md object-cover"
                    alt={project.title}
                />
            </div>

            <div className="flex-grow">
                {/* Location */}
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border-t">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">{project.city || "-"}</span>
                </div>

                {/* Possession / Type */}
                <div className="flex items-center gap-2 px-4 py-2 border-t text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{project.possessionStatus || project.type || "-"}</span>
                </div>

                {/* Price */}
                <div className={`flex items-center gap-2 px-4 py-3 border-t text-lg ${isBestPrice ? 'text-green-600 font-bold bg-green-50/50' : 'font-semibold'}`}>
                    {formatPrice(project.price)}
                    {isBestPrice && <span className="ml-auto text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Best</span>}
                </div>

                {/* Area */}
                <div className={`flex items-center gap-2 px-4 py-3 border-t text-sm ${isBestArea ? 'text-green-600 font-bold bg-green-50/50' : 'text-gray-600'}`}>
                    <Square size={16} className={isBestArea ? "text-green-600" : "text-gray-400"} />
                    {project.area ? `${project.area} sq.ft.` : "-"}
                    {isBestArea && <span className="ml-auto text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Best</span>}
                </div>

                {/* BHK */}
                <div className="flex items-center gap-2 px-4 py-2 border-t text-sm text-gray-600">
                    <Home size={16} className="text-gray-400" />
                    {project.bhk || project.type || "-"}
                </div>

                {/* Amenities */}
                <div className="px-4 py-3 border-t">
                    <div className="text-sm text-gray-500 mb-2 font-medium">Amenities</div>
                    {project.amenities && project.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {project.amenities.slice(0, 4).map((am: string, i: number) => (
                                <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded border border-gray-200">
                                    {am}
                                </span>
                            ))}
                            {project.amenities.length > 4 && (
                                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded border border-gray-200">
                                    +{project.amenities.length - 4}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400">-</div>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="p-4 border-t mt-auto flex items-center justify-between gap-2">
                <Button
                    onClick={() => router.push(`/properties/${project.id}`)}
                    variant="outline"
                    className="flex-1 py-5 font-bold"
                >
                    View Details
                </Button>
                <Button
                    onClick={() => router.push(`/book-vc?id=${project.id}&title=${encodeURIComponent(project.title || '')}&city=${encodeURIComponent(project.city || '')}&img=${encodeURIComponent(project.image || '')}`)}
                    className="flex-1 bg-red-600 hover:bg-red-700 py-5 font-bold"
                >
                    Book VC
                </Button>
            </div>
        </div>
    )
}