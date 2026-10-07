"use client";

import { useEffect, useState } from "react";
import MeetingItem from "./MeetingItem";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function UpcomingMeetings() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const data = await api("/meetings/upcoming");
                const now = new Date();
                const todayStr = now.toDateString();

                // Filter for today's meetings that are still in the future
                const filtered = data.filter((m: any) => {
                    const mDate = new Date(m.date);
                    if (mDate.toDateString() !== todayStr) return false;

                    try {
                        // Parse time "10:00 AM" or "10:00 PM"
                        const timeStr = m.time || "";
                        const [time, modifier] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':');
                        
                        let h = parseInt(hours, 10);
                        let min = parseInt(minutes, 10);

                        if (modifier === 'PM' && h < 12) h += 12;
                        if (modifier === 'AM' && h === 12) h = 0;
                        
                        const mDateTime = new Date(m.date);
                        mDateTime.setHours(h, min, 0, 0);
                        
                        return mDateTime > now;
                    } catch (err) {
                        return true; // Fallback to show if parsing fails
                    }
                });

                // Transform to match exactly what MeetingItem expects
                const formatted = filtered.map((m: any) => ({
                    id: m._id,
                    name: m.attendeeName,
                    type: m.title || "Video Call",
                    time: m.time,
                    date: m.date
                }));
                // Only show top 3 on dashboard to match UI layout
                setMeetings(formatted.slice(0, 3));
            } catch (error) {
                console.error("Failed to load meetings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    return (
        <div className="bg-white border rounded-2xl p-6 w-full lg:w-[420px] flex-shrink-0 shadow-sm">
            <div className="flex justify-between mb-4">
                <div>
                    <h2 className="font-semibold text-lg text-gray-800">
                        Upcoming Meetings
                    </h2>
                    <p className="text-xs text-gray-500">
                        Today
                    </p>
                </div>
                <Link href="/seller/meetings" className="text-blue-600 text-sm">
                    View Calendar
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            ) : meetings.length > 0 ? (
                <div className="space-y-1">
                    {meetings.map((meeting) => (
                        <MeetingItem key={meeting.id} meeting={meeting} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-sm text-gray-500 py-4">
                    No upcoming meetings today.
                </div>
            )}
        </div>
    );
}