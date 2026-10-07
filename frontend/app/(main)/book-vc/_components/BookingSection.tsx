"use client"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthModal } from "@/lib/AuthModalContext"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { TimePicker } from "@/components/ui/time-picker"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

export default function BookingWidget(props: any) {
    const { user } = useAuth()
    const { openLogin } = useAuthModal()
    const router = useRouter()
    const searchParams = useSearchParams()

    const property = props.propertyData;

    const propertyName = property?.residential?.propertyTitle
        || property?.location?.projectName
        || property?.title
        || searchParams.get('title')
        || "Property";

    const propertyLocation = property?.location?.city
        || searchParams.get('city')
        || "N/A";

    const propertyImage = property?.media?.photos?.[0]
        || searchParams.get('img')
        || "/images/building.png";

    // Representative is the person who listed the property (builder/seller/broker)
    const ownerName = property?.createdBy?.name
        || property?.residential?.builderName
        || searchParams.get('owner')
        || "Property Representative";

    const {
        dates,
        times,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        name,
        setName,
        phone,
        setPhone,
        otherOwnerNames,
        setOtherOwnerNames,
        rescheduleMeetingId,
    } = props

    const [isBooking, setIsBooking] = useState(false);
    const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
    const [userMeetings, setUserMeetings] = useState<any[]>([]);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictType, setConflictType] = useState<'PROPERTY' | 'BUYER'>('PROPERTY');
    const [conflictingPropertyName, setConflictingPropertyName] = useState("");
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    // If rescheduling, show the guiding modal once
    useEffect(() => {
        if (rescheduleMeetingId) {
            setShowRescheduleModal(true);
        }
    }, [rescheduleMeetingId]);

    // Fetch user's own upcoming meetings to detect buyer conflicts
    useEffect(() => {
        const fetchUserMeetings = async () => {
            if (!user) return;
            try {
                const data = await api('/meetings/upcoming');
                // Filter for relevant meetings that could conflict
                const activeMeetings = data.filter((m: any) => 
                    ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"].includes(m.status) &&
                    m._id !== rescheduleMeetingId
                );
                setUserMeetings(activeMeetings);
            } catch (err) {
                console.error("Failed to fetch user meetings", err);
            }
        };

        fetchUserMeetings();
    }, [user, selectedDate, rescheduleMeetingId]);

    // Fetch availability when date changes
    useEffect(() => {
        const fetchAvailability = async () => {
            const propId = property?._id || searchParams.get('id');
            if (!propId || !selectedDate) return;

            setIsCheckingAvailability(true);
            try {
                // Send as YYYY-MM-DD string to avoid timezone shifts in the query parameter
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                const data = await api(`/meetings/availability/${propId}?date=${dateStr}`);
                setOccupiedSlots(data);
            } catch (err) {
                console.error("Failed to fetch availability", err);
            } finally {
                setIsCheckingAvailability(false);
            }
        };

        fetchAvailability();
    }, [selectedDate, property?._id, searchParams]);

    // Helper to construct a reliable Date object from date and time string (Targeting UTC "Wall Time")
    const getMeetingDateTime = (d: any, t: string | null) => {
        if (!d || !t) return null;
        try {
            // Calendar 'd' might be local 00:00:00. 
            // We want to extract just the Year, Month, Day and treat it as UTC.
            const baseDate = new Date(d);
            const [timeStr, period] = t.split(' ');
            let [hours, minutes] = timeStr.split(':').map(Number);

            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            // Create a NEW date starting from Year/Month/Day in local time
            const dt = new Date(
                baseDate.getFullYear(), 
                baseDate.getMonth(), 
                baseDate.getDate(),
                hours,
                minutes,
                0,
                0
            );
            
            return dt;
        } catch (e) {
            return null;
        }
    };

    // Check if the selected time is in the past
    const isPastSelection = () => {
        if (!selectedTime || !selectedDate) return false;
        const selectedDateTime = getMeetingDateTime(selectedDate, selectedTime);
        if (!selectedDateTime) return false;

        const gracePeriod = 60 * 1000; // 1 minute
        return selectedDateTime.getTime() < (new Date().getTime() - gracePeriod);
    };

    const isPastTime = isPastSelection();

    // Check if the selected time conflicts with existing bookings
    const getConflict = () => {
        const selectedDateTime = getMeetingDateTime(selectedDate, selectedTime);
        if (!selectedDateTime) return null;

        const oneHour = 60 * 60 * 1000;
        const buffer = 1000;
        const selectedTimeMs = selectedDateTime.getTime();

        // 1. Check Property Conflicts
        const propertyConflict = occupiedSlots.find(slot => {
            const slotTime = new Date(slot.slotStartTime || slot.date).getTime();
            return Math.abs(selectedTimeMs - slotTime) < (oneHour - buffer);
        });

        if (propertyConflict) return { type: 'PROPERTY' as const, meeting: propertyConflict };

        // 2. Check Buyer Conflicts (User's other meetings)
        const buyerConflict = userMeetings.find(meeting => {
            const slotTime = new Date(meeting.slotStartTime || meeting.date).getTime();
            return Math.abs(selectedTimeMs - slotTime) < (oneHour - buffer);
        });

        if (buyerConflict) return { type: 'BUYER' as const, meeting: buyerConflict };

        return null;
    };

    const conflict = getConflict();

    const handleBooking = async () => {
        if (!user) {
            openLogin()
            return
        }

        if (!selectedDate || !selectedTime || !name || !phone) {
            toast.error("Please fill all details, choose a date and a time.");
            return;
        }

        if (isPastTime) {
            toast.error("Cannot book a meeting in the past. Please select a future time.");
            return;
        }

        const conflictInfo = getConflict();

        if (conflictInfo) {
            setConflictType(conflictInfo.type);
            if (conflictInfo.type === 'BUYER') {
                setConflictingPropertyName(conflictInfo.meeting.propertyTitle || "another property");
            }
            setShowConflictModal(true);
            return;
        }

        setIsBooking(true);
        try {
            const meetingDateTime = getMeetingDateTime(selectedDate, selectedTime);
            if (!meetingDateTime) throw new Error("Invalid date or time selected.");

            const endpoint = rescheduleMeetingId ? `/meetings/${rescheduleMeetingId}/reschedule` : "/meetings";
            const method = rescheduleMeetingId ? "PATCH" : "POST";
            
            await api(endpoint, {
                method: method,
                body: JSON.stringify({
                    propertyId: property?._id || searchParams.get('id'),
                    attendeeName: name,
                    attendeePhone: phone,
                    date: meetingDateTime.toISOString(), // Send the FULL combined timestamp
                    time: selectedTime,
                    otherOwnerNames: otherOwnerNames
                })
            });
            toast.success(rescheduleMeetingId ? "Meeting rescheduled! Waiting for admin approval." : "Meeting request sent! Waiting for admin approval.");
            const propId = property?._id || searchParams.get('id');
            router.push(rescheduleMeetingId ? "/my-meetings" : `/properties/${propId}`)
        } catch (error: any) {
            // If backend caught a conflict we missed locally
            if (error.message?.includes("overlaps") || error.message?.includes("already booked")) {
                toast.error(error.message);
                // Also trigger modal for better visibility
                if (error.message.includes("You already have a booking")) {
                    setConflictType('BUYER');
                    setShowConflictModal(true);
                }
            } else {
                toast.error(error.message || "Failed to book meeting. Please try again.");
            }
        } finally {
            setIsBooking(false);
        }
    }

    return (

        <div className="bg-gray-100 py-10">

            <div className="bg-gray-50 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 px-4">

                {/* LEFT BOOKING AREA */}
                <div className="lg:col-span-3 bg-[#f5f7fa] border rounded-lg overflow-hidden">

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">

                        {/* STEP 1 DATE */}
                        <div className="p-6 w-full">

                            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
                                <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm">
                                    1
                                </span>
                                Step 1: Select Date
                            </div>

                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={{ before: new Date() }}
                                className="rounded-lg border w-full bg-white shadow-sm"
                            />

                        </div>


                        {/* STEP 2 TIME */}
                        <div className="p-6">

                            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
                                <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm">
                                    2
                                </span>
                                Step 2: Select Time
                            </div>

                            <p className="text-[12px] text-gray-500 mb-6 bg-blue-50 p-2 rounded border border-blue-100 italic">
                                Choose a time slot that works best for you.
                            </p>

                            <TimePicker
                                value={selectedTime || "10:00 AM"}
                                onChange={setSelectedTime}
                                disabled={isCheckingAvailability}
                            />

                            {isPastTime && (
                                <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded text-[11px] text-orange-600 animate-pulse">
                                    ⚠️ <strong>Past Time:</strong> You cannot book a meeting for a time that has already passed.
                                </div>
                            )}

                            {occupiedSlots.length > 0 && !conflict && !isPastTime && (
                                <div className="mt-4 p-2 bg-[#f0f9ff] border border-blue-200 rounded text-[11px] text-[#0369a1] font-medium flex items-center gap-2">
                                    <span className="text-blue-500">✅</span>
                                    Slot Available: 1-hour gap verified.
                                </div>
                            )}

                            <p className="text-xs text-gray-400 mt-6 text-center italic">
                                Available 7 days a week
                            </p>

                        </div>


                        {/* STEP 3 FORM */}
                        <div className="p-6">

                            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
                                <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm">
                                    3
                                </span>
                                Enter Details
                            </div>

                            <Input
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mb-3 bg-white"
                            />

                            <div className="mb-4">
                                <Input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={phone}
                                    maxLength={10}
                                    minLength={10}
                                    pattern="[5-9][0-9]{9}"
                                    title="Mobile number must be 10 digits starting with 5, 6, 7, 8, or 9"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setPhone(val);
                                    }}
                                    className={`bg-white ${phone && !/^[5-9]\d{9}$/.test(phone) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                />
                                {phone && !/^[5-9]\d{9}$/.test(phone) && (
                                    <p className="text-red-500 text-[10px] font-semibold mt-1 px-1">
                                        Must be 10 digits starting with 5,6,7,8 or 9
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Interested in other property owners? (Optional)</label>
                                <textarea
                                    placeholder="e.g. DLF Builder, ABC Realty, Mr. Sharma"
                                    value={otherOwnerNames}
                                    onChange={(e) => setOtherOwnerNames(e.target.value)}
                                    className="w-full min-h-[80px] p-3 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                    </div>

                </div>



                {/* SUMMARY CARD */}
                <div className="bg-white rounded-md shadow-xl lg:-mt-16 lg:-ml-6 w-full lg:w-[300px] h-fit overflow-hidden">

                    {/* Header */}
                    <div className="bg-yellow-50 px-6 py-5 border-b">
                        <h3 className="font-semibold text-gray-700">
                            Appointment Summary
                        </h3>
                    </div>

                    <div className="p-4">

                        {/* Property — Dynamic from database */}
                        <div className="flex gap-3 items-center mb-6">

                            <img
                                src={propertyImage}
                                alt={propertyName}
                                className="w-12 h-12 rounded object-cover"
                            />

                            <div>
                                <p className="font-semibold text-gray-800 line-clamp-1">
                                    {propertyName}
                                </p>

                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {propertyLocation}
                                </p>
                            </div>

                        </div>

                        <div className="border-t border-gray-200 my-3"></div>


                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm mb-3">
                            <span className="text-gray-400">📅</span>
                            <p className="font-medium">
                                {selectedDate
                                    ? new Date(selectedDate).toLocaleDateString("en-IN", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    : "Select Date"}
                            </p>
                        </div>


                        {/* Time */}
                        <div className="flex items-center gap-2 text-sm mb-4">
                            <span className="text-gray-400">🕒</span>
                            <p className="font-medium text-blue-900">{selectedTime || "Select Time"}</p>
                        </div>


                        <div className="border-t border-gray-200 my-3"></div>


                        {/* Agent / Property Representative — Dynamic from database */}
                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {ownerName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <p className="text-sm font-semibold truncate max-w-[150px]">
                                    {ownerName}
                                </p>

                                <p className="text-xs text-gray-500">
                                    Property Representative
                                </p>
                            </div>

                        </div>


                        <Button
                            className="w-full bg-red-700 hover:bg-red-900 text-white py-5 px-5"
                            onClick={handleBooking}
                            disabled={isBooking || isPastTime || !selectedDate || !selectedTime || !name || !phone || !/^[5-9]\d{9}$/.test(phone)}
                        >
                            {isBooking ? "Booking..." : isPastTime ? "Past Selection" : "Book Video Call"}
                        </Button>

                    </div>

                </div>

            </div>


            {/* Bottom Button */}
            <div className="max-w-7xl mx-auto flex justify-center mt-8 pb-10 px-4">

                <Button
                    variant="default"
                    className="bg-red-700 hover:bg-red-900 text-white py-6 px-10 shadow-lg"
                    onClick={handleBooking}
                    disabled={isBooking || isPastTime || !selectedDate || !selectedTime || !name || !phone || !/^[5-9]\d{9}$/.test(phone)}
                >
                    {isBooking ? "Booking..." : isPastTime ? "Past Selection" : "Book Video Call"}
                </Button>

            </div>


            <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
                            <span>⚠️</span> {conflictType === 'PROPERTY' ? 'Slot Already Booked' : 'Scheduling Conflict'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 py-4">
                            {conflictType === 'PROPERTY' ? (
                                <>
                                    This time slot is already booked for <strong>{propertyName}</strong> by another buyer.
                                </>
                            ) : (
                                <>
                                    You already have a video call scheduled for <strong>{conflictingPropertyName}</strong> at this time. 
                                    A buyer cannot book multiple properties in the same time slot.
                                </>
                            )}
                            <br /><br />
                            Please select a different date or time to schedule your video call.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => setShowConflictModal(false)}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8"
                        >
                            Select Another Slot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-blue-600 flex items-center gap-2">
                            <span>📅</span> Reschedule Video Call
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 py-4">
                            Your previous meeting request for <strong>{propertyName}</strong> was not approved. 
                            <br /><br />
                            Please select a <strong>new date and time slot</strong> to reschedule your video call. Your details have been pre-filled for your convenience.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button 
                            type="button" 
                            onClick={() => setShowRescheduleModal(false)}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8"
                        >
                            Select New Slot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>

    )
}
