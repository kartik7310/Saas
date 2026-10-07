import Link from "next/link";

// ============================================================
// BREADCRUMB COMPONENT
// Matches image: light blue-gray bar with "Home / View All Properties"
// ============================================================

export default function Breadcrumb({ items }: any) {
    // items = [{ label: "Home", href: "/" }, { label: "View All Properties" }]
    return (
        <div style={{ backgroundColor: "#d6e4f0" }} className="py-4 px-6">
            <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-sm text-gray-600 mt-2">
                {items.map((item: any, index: any) => (
                    <span key={index} className="flex items-center gap-1.5">
                        {index > 0 && <span className="text-gray-400">/</span>}
                        {item.href ? (
                            <Link href={item.href} className="hover:text-[#1a3c6e] transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-700">{item.label}</span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}