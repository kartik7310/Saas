"use client";

import { useState, useEffect } from "react";
import RecentProjectCard from "./RecentProjectCard";
import { Project } from "@/types/dashboard";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PropertyViewModal from "@/components/PropertyViewModal";

export default function RecentProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api("/properties/my");
                setProjects(data.slice(0, 3)); // Only show initial 3 for clean layout
            } catch (error) {
                console.error("Error fetching recent projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <>
            <div className="bg-white rounded-2xl border p-6 shadow-sm flex-1 w-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[20px] font-bold text-[#1e293b]">
                        Recent Projects
                    </h2>
                    <button
                        onClick={() => router.push("/broker/projects")}
                        className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                        View All
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <RecentProjectCard
                                key={project._id}
                                project={project}
                                onView={(id) => setSelectedPropertyId(id)}
                                onEdit={(id) => router.push(`/broker/add-property?id=${id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <p className="text-sm">No recent projects found</p>
                    </div>
                )}

                {/* Add Property */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => router.push("/broker/add-property")}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <span className="text-lg">+</span> Add New Property
                    </button>
                </div>
            </div>

            <PropertyViewModal
                propertyId={selectedPropertyId}
                onClose={() => setSelectedPropertyId(null)}
            />
        </>
    );
}
