"use client"
import HeroSection from '@/components/HeroSection'
import React, { useState, useEffect, Suspense } from 'react'
import BookingWidget from './_components/BookingSection';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useAuth, getRoleRoute } from '@/lib/AuthContext';
import { toast } from 'sonner';
import RoleSwitchModal from '@/components/RoleSwitchModal';

const BookingContent = () => {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get('id');

    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [showRoleModal, setShowRoleModal] = useState(false);

    useEffect(() => {
        if (!isLoading && user && user.role?.toUpperCase() !== "BUYER") {
            setShowRoleModal(true);
        }
    }, [user, isLoading]);

    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [otherOwnerNames, setOtherOwnerNames] = useState("");

    // Fetch property data from database
    useEffect(() => {
        const fetchInitialData = async () => {
            const rescheduleId = searchParams.get('rescheduleId');
            let effectivePropertyId = propertyId;

            try {
                // If we are rescheduling, we need to get the property ID from the meeting first
                if (rescheduleId) {
                    const meeting = await api(`/meetings/${rescheduleId}`);
                    if (meeting) {
                        // Pre-fill user details from the old meeting
                        setName(meeting.attendeeName || "");
                        setPhone(meeting.attendeePhone || "");
                        if (meeting.otherOwnerNames) setOtherOwnerNames(meeting.otherOwnerNames);
                        
                        // Extract propertyId (could be string or object)
                        const pid = typeof meeting.propertyId === 'string' ? meeting.propertyId : meeting.propertyId?._id;
                        if (pid) effectivePropertyId = pid;
                    }
                }

                if (!effectivePropertyId) {
                    setLoading(false);
                    return;
                }

                const propData = await api(`/properties/${effectivePropertyId}`);
                setProperty(propData);
            } catch (err) {
                console.error("Error fetching data for Book VC:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [propertyId, searchParams]);

    // Extract dynamic data from the fetched property
    const propertyName = property?.residential?.propertyTitle
        || property?.location?.projectName
        || property?.title
        || searchParams.get('title')
        || "Property";

    const propertyCity = property?.location?.city
        || searchParams.get('city')
        || "";

    const propertyImage = property?.media?.photos?.[0]
        || searchParams.get('img')
        || "/images/building.png";

    // The representative is the person who listed the property
    const ownerName = property?.createdBy?.name
        || property?.residential?.builderName
        || searchParams.get('owner')
        || "Property Representative";

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#1e3a5f]" />
            </div>
        );
    }

    return (
        <div className='bg-gray-50 mt-16 md:mt-20'>
            <div className="bg-gray-50">
                <HeroSection
                    propertyName={propertyName}
                    propertyImage={propertyImage}
                    ownerName={ownerName}
                />
            </div>
            <div className='bg-gray-50'>
                {/* HEADER */}
                <div>
                    <div className='bg-gray-50 flex flex-col justify-center px-4 md:px-16'>

                        <h1 className="text-xl md:text-3xl font-semibold text-blue-900 font-bold">
                            Book Live Video Call with {ownerName}
                        </h1>

                        <p className="text-gray-500 text-xs md:text-sm mt-1">
                            Schedule a direct video meeting with {ownerName}&apos;s representative.
                        </p>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 mt-6">
                        <BookingWidget
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedTime={selectedTime}
                            setSelectedTime={setSelectedTime}
                            name={name}
                            setName={setName}
                            phone={phone}
                            setPhone={setPhone}
                            otherOwnerNames={otherOwnerNames}
                            setOtherOwnerNames={setOtherOwnerNames}
                            propertyData={property}
                        />
                    </div>
                </div>
            </div>
            <RoleSwitchModal
                isOpen={showRoleModal}
                onClose={() => {
                    setShowRoleModal(false);
                    router.push(user ? getRoleRoute(user.role) : '/');
                }}
                title="Switch Account Required"
                description="To book a video call and inquire about properties, you need to be in your Buyer account. Would you like to switch now?"
                targetRoles={["BUYER"]}
            />
        </div>
    )
}

const page = () => {
    return (
        <Suspense fallback={<div className="flex justify-center py-20 min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <BookingContent />
        </Suspense>
    )
}

export default page