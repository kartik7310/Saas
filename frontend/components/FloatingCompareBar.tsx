"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCompareList, removeFromCompare, clearCompare } from "@/lib/compareStorage";
import { Button } from "@/components/ui/button";

export function FloatingCompareBar() {
    const [compareList, setCompareList] = useState<string[]>([]);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setCompareList(getCompareList());
        
        const handleUpdate = (e: any) => {
            setCompareList(e.detail);
        };
        
        window.addEventListener("compareUpdated", handleUpdate);
        return () => window.removeEventListener("compareUpdated", handleUpdate);
    }, []);

    // Only show the compare bar on the properties browsing page
    if (compareList.length === 0 || pathname !== "/properties") return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-3 z-50 animate-in slide-in-from-bottom-2 duration-300 flex items-center justify-between px-6 lg:px-20">
            <div className="flex gap-4 items-center overflow-x-auto">
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Compare Properties:</span>
                {compareList.map((id, index) => (
                    <div key={id} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-900">Property #{index + 1}</span>
                        <button 
                            onClick={() => removeFromCompare(id)}
                            className="text-gray-400 hover:text-red-500 flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex pl-4 space-x-2 shrink-0">
                <Button 
                    onClick={() => clearCompare()}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                >
                    Clear All
                </Button>
                <Button 
                    onClick={() => router.push("/compare-properties")}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                    Compare ({compareList.length})
                </Button>
            </div>
        </div>
    );
}
