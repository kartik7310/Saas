"use client"
import CompareCard from "./CompareCard"
import { removeFromCompare } from "@/lib/compareStorage"

export default function CompareGrid({ data }: any) {
    function removeProject(id: string) {
        removeFromCompare(id);
    }

    // find min price
    const minPrice = Math.min(...data.map((p: any) => (p.price && p.price > 0) ? p.price : Infinity));
    // find max area
    const maxArea = Math.max(...data.map((p: any) => p.area || 0));

    // Determine the overall best property
    const bestPropertyId = data.length > 1 ? data.reduce((best: any, current: any) => {
        const currentScore = 
            (current.price > 0 && current.price === minPrice ? 2 : 0) + 
            (current.area > 0 && current.area === maxArea ? 1 : 0) +
            ((current.amenities?.length || 0) * 0.1);
        
        const bestScore = best ? 
            (best.price > 0 && best.price === minPrice ? 2 : 0) + 
            (best.area > 0 && best.area === maxArea ? 1 : 0) +
            ((best.amenities?.length || 0) * 0.1) : -1;
            
        return currentScore > bestScore ? current : best;
    }, null)?.id : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6">
            {data.map((project: any) => (
                <CompareCard
                    key={project.id}
                    project={project}
                    remove={removeProject}
                    isBestPrice={project.price > 0 && project.price === minPrice && data.length > 1}
                    isBestArea={project.area > 0 && project.area === maxArea && data.length > 1}
                    isOverallBest={project.id === bestPropertyId}
                />
            ))}

            {data.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center min-h-[400px] bg-gray-50/50">
                    <p className="text-gray-500 mb-2">Compare up to 3 properties</p>
                    <a href="/properties" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                        + Add Property
                    </a>
                </div>
            )}
        </div>
    )
}