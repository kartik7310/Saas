import { User } from "lucide-react";

export default function LeadItem({ lead }: any) {
    return (
        <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition">

            <div className="flex items-center gap-3">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                </div>

                {/* Lead Info */}
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-800">
                        {lead.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {lead.phone}
                    </p>
                </div>

            </div>

        </div>
    );
}