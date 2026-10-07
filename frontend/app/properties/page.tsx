"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PropertyFilters from "./_components/PropertyFilters";
import PropertyGrid from "./_components/PropertyGrid";
import Pagination from "./_components/Pagination";
import { api } from "@/lib/api";

const ITEMS_PER_PAGE = 9;

function PropertiesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const initialized = useRef(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [properties, setProperties] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Initialize filters from URL
    const [filters, setFilters] = useState(() => {
        const f: any = {};
        searchParams.forEach((value, key) => {
            if (key !== "page" && key !== "limit") {
                f[key] = value;
            }
        });
        return f;
    });

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                ...filters
            });

            // Clean up empty params
            for (const [key, value] of Object.entries(filters)) {
                if (!value) params.delete(key);
            }

            const response = await api(`/properties?${params.toString()}`);
            setProperties(response.results || []);
            setTotalPages(response.totalPages || 1);
            
            // Sync URL
            if (mounted && initialized.current) {
                // Wrap in requestAnimationFrame to ensure router is ready
                requestAnimationFrame(() => {
                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                });
            }
            initialized.current = true;
        } catch (err: any) {
            console.error("Error fetching properties:", err);
            setError(err.message || "Failed to load properties.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, pathname, router]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    function handleFilter(newFilters: any) {
        setFilters(newFilters);
        setCurrentPage(1);
    }

    function handlePageChange(page: any) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <main className="min-h-screen bg-white mt-17">

            {/* Main content area */}
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Page heading */}
                <h1 className="text-2xl font-black text-gray-900 tracking-wide mb-5">
                    VIEW ALL PROPERTIES
                </h1>

                {/* Filters bar */}
                <div className="mb-8">
                    <PropertyFilters onFilter={handleFilter} />
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-8 text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3c6e]"></div>
                    </div>
                ) : (
                    <>
                        {/* Property cards grid */}
                        <PropertyGrid properties={properties} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center py-20 min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3c6e]"></div>
            </div>
        }>
            <PropertiesContent />
        </Suspense>
    );
}