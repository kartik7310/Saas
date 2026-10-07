"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Zap, Star, Loader2, Sparkles, ShieldCheck, AlertCircle, Info, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

interface PromotionModalProps {
    propertyId: string | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const PLANS = [
    {
        id: "7_DAYS",
        name: "Eco-Boost",
        days: 7,
        price: 99,
        amount: 9900, // paise
        description: "Perfect for quick visibility",
        icon: Zap,
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        id: "15_DAYS",
        name: "Pro-Promote",
        days: 15,
        price: 149,
        amount: 14900, // paise
        description: "Maximize your reach",
        icon: Star,
        color: "text-purple-500",
        bg: "bg-purple-50",
        popular: true
    },
    {
        id: "30_DAYS",
        name: "Elite-Exposure",
        days: 30,
        price: 249,
        amount: 24900, // paise
        description: "Full month of priority rotation",
        icon: Sparkles,
        color: "text-amber-500",
        bg: "bg-amber-50"
    }
];

export default function PromotionModal({ propertyId, onClose, onSuccess }: PromotionModalProps) {
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<string>("15_DAYS");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
    const [availability, setAvailability] = useState<{
        available: boolean;
        daysToWait?: number;
        nextAvailableAt?: string;
        message?: string;
    } | null>(null);

    useEffect(() => {
        if (propertyId) {
            checkAvailability();
        }
    }, [propertyId]);

    const checkAvailability = async () => {
        setIsLoadingAvailability(true);
        try {
            const res = await api(`/payments/check-feature-availability?propertyId=${propertyId}`);
            if (res.success) {
                setAvailability(res);
            }
        } catch (err) {
            console.error("Error checking availability:", err);
        } finally {
            setIsLoadingAvailability(false);
        }
    };

    if (!propertyId) return null;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePromote = async () => {
        try {
            if (!user) {
                toast.error("Please login to promote your property");
                return;
            }

            setIsProcessing(true);

            // 1. Create Order on Backend
            const orderData = await api("/payments/create-feature-order", {
                method: "POST",
                body: JSON.stringify({ planType: selectedPlan })
            });

            if (!orderData?.success) {
                throw new Error(orderData?.message || "Failed to create order");
            }

            // 2. Load Razorpay Script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Failed to load Razorpay SDK");
                return;
            }

            const plan = PLANS.find(p => p.id === selectedPlan);
            if (!plan) return;

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: "INR",
                name: "LinkToBuilder",
                description: `Feature Property for ${plan.days} Days`,
                image: "/logo.png",
                order_id: orderData.order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await api("/payments/verify-feature-payment", {
                            method: "POST",
                            body: JSON.stringify({
                                propertyId,
                                planType: selectedPlan,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (verifyRes.success) {
                            toast.success("Success! Your property is now featured.");
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                onClose();
                            }
                        } else {
                            toast.error(verifyRes.message || "Verification failed");
                        }
                    } catch (err: any) {
                        toast.error(err.message || "Failed to verify payment");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ""
                },
                theme: {
                    color: "#4f46e5",
                },
                modal: {
                    ondismiss: () => setIsProcessing(false)
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error("Promotion Error:", error);
            toast.error(error.message || "Failed to initiate promotion");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Content */}
            <div className="relative w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="p-8 md:p-10">
                    {isLoadingAvailability ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Checking status...</p>
                        </div>
                    ) : availability && !availability.available ? (
                        /* WAIT SCREEN */
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Slots Full</h2>
                                    <p className="text-sm text-gray-500 font-medium">Waitlist Status</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                    Each role (Builder, Broker, Seller) has a maximum limit of <span className="text-indigo-600 font-bold">10 featured properties</span> at once.
                                </p>
                                
                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-dotted border-gray-200">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Available in</p>
                                        <p className="text-lg font-black text-gray-900 leading-none">After {availability.daysToWait} Days</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-3">
                                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-700 font-medium italic">
                                        Someone's property upgradation will expire on {new Date(availability.nextAvailableAt!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}. You can feature yours once a slot opens.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={onClose}
                                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all"
                            >
                                Got it
                            </Button>
                        </div>
                    ) : (
                        /* PROMOTION OPTIONS */
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Feature Property</h2>
                                    <p className="text-sm text-gray-500 font-medium">Boost your listing's visibility</p>
                                </div>
                            </div>

                            <div className="space-y-3 mt-8">
                                {PLANS.map((plan) => (
                                    <div 
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 group ${
                                            selectedPlan === plan.id 
                                                ? "border-indigo-600 bg-indigo-50/30" 
                                                : "border-gray-100 bg-white hover:border-gray-200"
                                        }`}
                                    >
                                        {plan.popular && (
                                            <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                                Most Popular
                                            </span>
                                        )}

                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${plan.bg} ${plan.color} transition-transform group-hover:scale-110`}>
                                                <plan.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                                <p className="text-[11px] text-gray-500 font-medium">{plan.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-gray-900">₹{plan.price}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{plan.days} Days</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        Instant activation after successful payment
                                    </p>
                                </div>

                                <Button
                                    onClick={handlePromote}
                                    disabled={isProcessing}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/10 active:scale-[0.98] transition-all"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Promote Now"
                                    )}
                                </Button>
                                <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Secured by Razorpay</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

