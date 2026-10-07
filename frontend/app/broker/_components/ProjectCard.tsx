"use client";
import Image from "next/image";
import { Pencil, Sparkles, Tag, MapPin, Home, Layout, ArrowUpCircle, User } from "lucide-react";
import { Project, BadgeType } from "@/types/dashboard";
import { ProjectBadge } from "./Projectbadge";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
    project: Project;
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
    onPromote?: (id: string) => void;
}

export default function ProjectCard({ project, onView, onEdit, onPromote }: ProjectCardProps) {
    const { _id, media, title, location, pricing, leadsCount, status, propertyApprovedStatus, isFeatured, listingType, creatorRole } = project;
    
    const image = media?.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80";
    const city = location?.city || "N/A";

    const isCommercial = listingType === "COMMERCIAL" || !!project.commercial;
    const pricingLabel = isCommercial ? "Expected Price" : "Starting Price";
    const priceValue = isCommercial
        ? (pricing?.expectedPrice || pricing?.expectedRent)
        : pricing?.startingPrice;

    const priceText = formatPrice(priceValue);

    let displayStatus: any = status;
    if (propertyApprovedStatus === "APPROVED") {
        displayStatus = "PUBLISHED";
    } else if (propertyApprovedStatus === "REJECTED") {
        displayStatus = "REJECTED";
    } else if (propertyApprovedStatus === "PENDING") {
        displayStatus = "PENDING";
    }

    return (
        <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row group min-h-[250px]">

            {/* ── 1. Property Image Section ── */}
            <div className="relative w-full lg:w-[320px] shrink-0 min-h-[200px] lg:min-h-full bg-slate-50 p-3">
                <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 group-hover:border-blue-500 transition-colors shadow-sm bg-white">
                    <Image
                        src={image}
                        alt={title || "Property Image"}
                        fill
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="320px"
                    />
                    {/* Status Badge Overlay */}
                    <div className="absolute top-2 left-2 z-10">
                        <span className={cn(
                            "text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-md text-white whitespace-nowrap",
                            displayStatus === "PUBLISHED" ? "bg-emerald-500" :
                            displayStatus === "PENDING" ? "bg-amber-500" : "bg-red-500"
                        )}>
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                            {displayStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 2. Content Section ── */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    {/* HEADER SECTION */}
                    <div className="flex flex-col mb-5">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tighter mb-1 leading-none">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                PROPERTY ID: <span className="text-slate-500">{_id.substring(_id.length - 8).toUpperCase()}</span>
                            </p>
                        </div>
                    </div>

                    {/* SPECS BADGES ROW (Theme Wise) */}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        {/* TYPE SLOT */}
                        <div className="px-4 py-1 bg-[#f5f9ff] border border-[#e3efff] rounded-xl flex flex-col min-w-[100px]">
                            <span className="text-[8px] font-black text-[#5698ff] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Home className="w-2.5 h-2.5" /> TYPE
                            </span>
                            <span className="text-xs font-black text-[#2563eb] uppercase tracking-tight">
                                {project.residential?.propertyType || project.commercial?.propertyCategory?.replace("_", " ") || "Residential"}
                            </span>
                        </div>

                        {/* CONFIG SLOT */}
                        <div className="px-4 py-1 bg-[#f1faf6] border border-[#e0f3eb] rounded-xl flex flex-col min-w-[100px]">
                            <span className="text-[8px] font-black text-[#00c581] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Layout className="w-2.5 h-2.5" /> CONFIG
                            </span>
                            <span className="text-xs font-black text-[#007f52] uppercase tracking-tight">
                                {project.residential?.bhkType ? `${project.residential.bhkType} BHK` : "N/A"}
                            </span>
                        </div>

                        {/* LOCATION SLOT */}
                        <div className="px-4 py-1 bg-[#fffaf1] border border-[#fff3e0] rounded-xl flex flex-col min-w-[100px]">
                            <span className="text-[8px] font-black text-[#ff9800] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <MapPin className="w-2.5 h-2.5" /> LOCATION
                            </span>
                            <span className="text-xs font-black text-[#c07300] uppercase tracking-tight">
                                {location?.locality || city}
                            </span>
                        </div>

                        {/* POSSESSION SLOT */}
                        <div className="px-4 py-1 bg-[#fdf2f8] border border-[#fce7f3] rounded-xl flex flex-col min-w-[100px]">
                            <span className="text-[8px] font-black text-[#db2777] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <ArrowUpCircle className="w-2.5 h-2.5" /> STATUS
                            </span>
                            <span className="text-xs font-black text-[#9d174d] uppercase tracking-tight">
                                {(project.residential?.possessionStatus || "Ready").replace(/_/g, " ")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FOOTER: PRICE & LEADS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100/80">
                    <div className="flex items-start gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-300" />
                        <div>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">{pricingLabel}</p>
                            <p className="text-sm font-black text-slate-800 tracking-tighter leading-none">{priceText}</p>
                        </div>
                    </div>

                    {leadsCount !== undefined && (
                        <div className="flex items-start gap-2">
                            <User className="w-3.5 h-3.5 text-slate-300" />
                            <div>
                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">TOTAL LEADS</p>
                                <p className="text-sm font-black text-slate-800 tracking-tighter leading-none">{leadsCount}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 3. Action Area ── */}
            <div className="w-full lg:w-[140px] shrink-0 border-l border-slate-100/80 bg-slate-50/10 flex flex-col items-center justify-center p-4 gap-3">
                <Button
                    onClick={() => onView?.(_id)}
                    variant="outline"
                    className="w-full h-10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 border-slate-200"
                >
                    View
                </Button>
                <Button
                    onClick={() => onEdit?.(_id)}
                    variant="outline"
                    className="w-full h-10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 border-slate-200 flex items-center justify-center gap-2"
                >
                    <Pencil size={12} />
                    Edit
                </Button>
                {displayStatus === "PUBLISHED" && (
                    isFeatured ? (
                        <div className="w-full h-10 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center text-amber-600 font-black tracking-widest text-[9px] uppercase gap-1.5 shadow-sm">
                            <Sparkles size={12} />
                            <span>Featured</span>
                        </div>
                    ) : (
                        <Button
                            onClick={() => onPromote?.(_id)}
                            className="w-full h-10 bg-indigo-600 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                            <Sparkles size={12} />
                            PROMOTE
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}