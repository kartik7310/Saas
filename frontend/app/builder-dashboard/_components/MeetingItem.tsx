import { ChevronRight, MessageCircle } from "lucide-react";

export default function MeetingItem({ meeting }: any) {
    return (
        <div className="flex items-center justify-between border-b py-3 last:border-none">

            {/* Left Section */}
            <div className="flex items-center gap-3">

                {/* Chat Icon */}
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
                    <MessageCircle size={16} className="text-gray-600" />
                </div>

                {/* Meeting Info */}
                <div>
                    <p className="text-sm font-medium text-gray-800">
                        {meeting.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {meeting.type}
                    </p>
                </div>

            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                    {meeting.time}
                </span>

                <ChevronRight size={18} className="text-gray-400" />
            </div>

        </div>
    );
}