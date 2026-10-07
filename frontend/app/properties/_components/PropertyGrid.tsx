"use client";
import { Search, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PropertyListingCard from "./PropertyListingCard";

export default function PropertyGrid({ properties }: any) {
  const router = useRouter();

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-slate-200/80 flex items-center justify-center mb-8 border border-white relative transition-transform hover:scale-110 duration-500">
          <div className="absolute inset-0 bg-purple-50 rounded-3xl opacity-20 blur-xl"></div>
          <Search size={40} className="text-purple-600 relative z-10" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-[12px] font-black text-white">?</span>
          </div>
        </div>

        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter text-center">
          No properties here yet
        </h3>

        <p className="text-slate-500 text-center max-w-sm mb-10 font-bold leading-relaxed text-sm">
          We couldn't find any properties matching your current search. Try changing your filters or searching in a different area!
        </p>

        <div className="flex flex-wrap justify-center gap-4">

          <Link
            href="/"
            className="flex items-center gap-3 bg-white hover:bg-gray-50 text-slate-700 border border-slate-200 font-black px-10 py-4 rounded-2xl transition-all shadow-sm active:scale-95 text-[11px] uppercase tracking-[0.2em]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {properties.map((property: any) => (
        <Link key={property._id} href={`/properties/${property._id}`}>
          <PropertyListingCard property={property} />
        </Link>
      ))}
    </div>
  );
}