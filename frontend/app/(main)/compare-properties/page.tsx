"use client";
import { useEffect, useState } from "react";
import CompareGrid from "./_components/CompareGrid"
// import { AddCompareProjectModal } from "./_components/AddCompareProjectModal"
import { Button } from "@/components/ui/button"
import { getCompareList, clearCompare } from "@/lib/compareStorage";
import { api } from "@/lib/api";

export default function ComparePage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompareData = async () => {
            const list = getCompareList();
            if (list.length === 0) {
                setData([]);
                setLoading(false);
                return;
            }

            try {
                const idsParam = list.join(",");
                const response = await api(`/properties/compare?ids=${idsParam}`);
                setData(response || []);
            } catch (error) {
                console.error("Error fetching compare data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompareData();

        window.addEventListener("compareUpdated", fetchCompareData as any);
        return () => {
            window.removeEventListener("compareUpdated", fetchCompareData as any);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="max-w-7xl mx-auto py-20 px-4 mt-16 text-center">
                <h1 className="text-2xl font-bold text-gray-700 mb-4">No properties selected for comparison</h1>
                <p className="text-gray-500 mb-8">Go back to the properties listing to add some properties to compare.</p>
                <Button variant="outline" onClick={() => window.location.href = '/properties'}>
                    Browse Properties
                </Button>
            </div>
        );
    }

    return (

        <div className="max-w-7xl mx-auto py-10 px-4 mt-16">

            <div className="mb-6 mx-4 md:ml-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900">
                        Compare Projects
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Compare multiple projects side-by-side for price, area, amenities and connectivity details.
                    </p>
                </div>
                
                {data.length > 0 && (
                    <Button 
                        onClick={() => clearCompare()}
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold"
                    >
                        Clear Comparison
                    </Button>
                )}
            </div>

            <CompareGrid data={data} />

            <div className="flex justify-center mt-6">

                {/* <AddCompareProjectModal>
                    <Button variant="link" className="text-blue-600 cursor-pointer">
                        + Add More Projects
                    </Button>
                </AddCompareProjectModal> */}

            </div>

        </div>

    )
}
