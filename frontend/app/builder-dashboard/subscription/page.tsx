"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Loader2, Sparkles, Plus } from "lucide-react";
import { api } from "@/lib/api";
import SubscriptionItemCard, { SubscriptionItem } from "@/components/Dashboard/SubscriptionItemCard";
import Link from "next/link";

export default function SubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, ACTIVE, EXPIRED
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setIsLoading(true);
            const res = await api("/subscriptions/my");
            if (res.success) {
                setSubscriptions(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch subscriptions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesFilter = filter === "ALL" || sub.status === filter;
        const matchesSearch = sub.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading subscriptions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subscription</h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Manage your membership and upgrade features</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search properties..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all w-full md:w-64"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 h-10">
                        <Filter className="w-4 h-4 text-slate-400 mr-2" />
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-2"
                        >
                            <option value="ALL">All Plans</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {filteredSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSubscriptions.map((sub) => (
                        <SubscriptionItemCard key={sub.id} subscription={sub} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6 group hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-10 h-10 text-indigo-200 group-hover:text-indigo-500 transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No subscriptions found</h3>
                    <p className="text-slate-500 text-sm font-medium mb-8 text-center max-w-xs">
                        You haven't featured any properties yet. Upgrade your listings to get maximum visibility.
                    </p>
                    <Link 
                        href="/projects" 
                        className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2"
                    >
                        Explore Plans
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
