"use client";
import HeroSection from '@/components/HeroSection';
import React, { useState, useEffect, Suspense } from 'react';
import BookingWidget from '../../_components/BookingSection';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useAuth, getRoleRoute } from '@/lib/AuthContext';
import RoleSwitchModal from '@/components/RoleSwitchModal';

const RescheduleContent = () => {
    const params = useParams();
    const meetingId = params.id;

    const [property, setProperty] = useState<any>(null);
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [showRoleModal, setShowRoleModal] = useState(false);

    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [otherOwnerNames, setOtherOwnerNames] = useState("");

    useEffect(() => {
        if (!isLoading && user && user.role?.toUpperCase() !== "BUYER") {
            setShowRoleModal(true);
        }
    }, [user, isLoading]);

    useEffect(() => {
        const fetchData = async () => {
            if (!meetingId) {
                setLoading(false);
                return;
            }
            try {
                // We need to get meeting details first to know the propertyId
                const meetings = await api('/meetings/upcoming');
                const existingMeeting = meetings.find((m: any) => m._id === meetingId);
                
                if (existingMeeting) {
                    setMeeting(existingMeeting);
                    setName(existingMeeting.attendeeName || "");
                    setPhone(existingMeeting.attendeePhone || "");
                    setOtherOwnerNames(existingMeeting.otherOwnerNames || "");
                    
                    if (existingMeeting.propertyId) {
                        const propData = await api(`/properties/${existingMeeting.propertyId._id || existingMeeting.propertyId}`);
                        setProperty(propData);
                    }
                }
            } catch (err) {
                console.error("Error fetching data for reschedule:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [meetingId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#1e3a5f]" />
            </div>
        );
    }

    const propertyName = property?.residential?.propertyTitle || property?.location?.projectName || property?.title || "Property";
    const propertyImage = property?.media?.photos?.[0] || "/images/building.png";
    const ownerName = property?.createdBy?.name || "Property Representative";

    return (
        <div className='bg-gray-50 mt-17'>
            <div className="bg-gray-50 pb-8">
                <HeroSection
                    propertyName={propertyName}
                    propertyImage={propertyImage}
                    ownerName={ownerName}
                />
            </div>
            <div className='bg-gray-50'>
                <div className='bg-gray-50 flex flex-col justify-center'>
                    <h1 className="text-3xl font-semibold text-blue-900 font-bold ml-16">
                        Reschedule Video Call
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-16">
                        Pick a new time slot for your meeting regarding {propertyName}.
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
                        rescheduleMeetingId={meetingId}
                    />
                </div>
            </div>
            <RoleSwitchModal
                isOpen={showRoleModal}
                onClose={() => {
                    setShowRoleModal(false);
                    router.push(getRoleRoute(user.role));
                }}
                title="Switch Account Required"
                description="To reschedule a video call, you need to be in your Buyer account."
                targetRoles={["BUYER"]}
            />
        </div>
    );
};

const ReschedulePage = () => {
    return (
        <Suspense fallback={<div className="flex justify-center py-20 min-h-screen"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>}>
            <RescheduleContent />
        </Suspense>
    );
};

export default ReschedulePage;
