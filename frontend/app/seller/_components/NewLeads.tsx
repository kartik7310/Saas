"use client";

import LeadItem from "./LeadItem";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function NewLeads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await api("/leads");
                const allLeads = response.data || [];
                const latestLeads = [...allLeads].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setLeads(latestLeads.slice(0, 6));
            } catch (err) {
                console.error("Failed to fetch leads", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    return (
        <div className="bg-white border rounded-xl p-6 flex-1 w-full overflow-hidden">

            <div className="flex justify-between mb-5">
                <h2 className="font-semibold text-gray-800 text-lg">
                    New Leads
                </h2>

                <Link href="/seller/leads" className="text-blue-600 text-sm hover:underline">
                    View All Leads
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm">
                    No new leads found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                    {leads.map((lead) => (
                        <LeadItem 
                            key={lead._id} 
                            lead={{
                                name: lead.buyerName || 'Unknown Contact',
                                phone: lead.buyerMobile || 'No Phone'
                            }} 
                        />
                    ))}
                </div>
            )}

        </div>
    );
}