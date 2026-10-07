"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }: any) {
    // Build page numbers to show: 1, 2, 3, ..., with active highlighted
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 3); i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-8 mb-4">

            {/* Page numbers */}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded transition-colors ${currentPage === page
                        ? "text-white"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                    style={currentPage === page ? { backgroundColor: "#1a3c6e" } : {}}
                >
                    {page}
                </button>
            ))}

            {/* Ellipsis */}
            {totalPages > 3 && (
                <span className="w-9 h-9 flex items-center justify-center text-sm text-gray-500">
                    ...
                </span>
            )}

            {/* Left arrow (prev) */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
            >
                ←
            </button>

            {/* Right arrow (next) - navy in image */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: currentPage === totalPages ? "#9ca3af" : "#1a3c6e" }}
            >
                →
            </button>
        </div>
    );
}