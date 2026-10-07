import { LeadStatus } from "@/app/mock-data/mockLeadData";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
    "New": "bg-emerald-100 text-emerald-700",
    "Contacted": "bg-blue-100 text-blue-600",
    "Interested": "bg-orange-100 text-orange-500",
    "Not Interested": "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-md text-[11.5px] font-semibold",
                statusStyles[status]
            )}
        >
            {status}
        </span>
    );
}