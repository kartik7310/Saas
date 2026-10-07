"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export interface SubscriptionItem {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  planType: string;
  startDate: string;
  expiryDate: string;
  status: string;
}

interface SubscriptionItemCardProps {
  subscription: SubscriptionItem;
}

export default function SubscriptionItemCard({ subscription }: SubscriptionItemCardProps) {
  const pathname = usePathname();
  const { propertyId, propertyName, propertyImage, planType, startDate, expiryDate, status } = subscription;

  const isExpiringSoon = () => {
    if (status !== "ACTIVE") return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const getStatusStyles = () => {
    if (status === "EXPIRED") return "bg-red-50 text-red-600 border-red-100";
    if (isExpiringSoon()) return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  };

  // Determine dashboard prefix for redirection
  const dashboardPrefix = pathname.startsWith("/builder-dashboard") 
    ? "/builder-dashboard" 
    : pathname.startsWith("/seller") 
      ? "/seller" 
      : "/broker";

  return (
    <Link 
      href={`${dashboardPrefix}/projects`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.99]"
    >
      {/* Property Image Section */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={propertyImage}
          alt={propertyName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Status Badge Over Image */}
        <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm backdrop-blur-md ${getStatusStyles()}`}>
          {isExpiringSoon() ? "Expiring Soon" : status}
        </div>
        
        {/* Plan Type Badge Over Image */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-sm backdrop-blur-md">
          {planType}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
            {propertyName}
          </h3>
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
        </div>

        <div className="space-y-3 mt-auto">
          {/* Dates Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Started
              </p>
              <p className="text-xs font-bold text-slate-700">
                {format(new Date(startDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Expires
              </p>
              <p className={`text-xs font-bold ${status === "EXPIRED" ? "text-red-500" : "text-slate-700"}`}>
                {format(new Date(expiryDate), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Action Footer (Visual only since entire card is clickable) */}
          <div className="pt-2 flex items-center justify-center">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform duration-300">
              View Property Details &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
