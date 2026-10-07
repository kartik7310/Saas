"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Page {currentPage} of {totalPages}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="h-10 px-4 rounded-xl border-gray-200 text-gray-500 font-bold text-xs uppercase hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <ChevronLeft size={14} />
          Previous
        </Button>
        <div className="flex items-center gap-1 mx-2">
            {/* Simple page numbers could be added here if needed, but Prev/Next is often sufficient for admin tables */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = currentPage;
                if (totalPages <= 5) pageNum = i + 1;
                else {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                }
                
                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        disabled={isLoading}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                            currentPage === pageNum 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        {pageNum}
                    </button>
                );
            })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="h-10 px-4 rounded-xl border-gray-200 text-gray-500 font-bold text-xs uppercase hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
