


"use client"
import { Home, Facebook, Instagram, X, Linkedin } from "lucide-react";
import Link from "next/link";
import { useAuthModal } from "@/lib/AuthModalContext";
import { usePropertyCount } from "@/lib/usePropertyCount";
import LegalModal from "@/components/LegalModal";
import termsData from "@/lib/termsData.json";
import privacyData from "@/lib/privacyData.json";
import refundData from "@/lib/refundData.json";
import { useState } from "react";

const Footer = () => {
    const { openLogin, openSignup } = useAuthModal();
    const { formatted: propCount } = usePropertyCount();
    const [legalType, setLegalType] = useState<"TERMS" | "PRIVACY" | "REFUND" | null>(null);

    const getLegalData = () => {
        if (legalType === "TERMS") return termsData;
        if (legalType === "PRIVACY") return privacyData;
        if (legalType === "REFUND") return refundData;
        return termsData;
    };

    return (
        <footer className="w-full -mt-8">
            <LegalModal 
                isOpen={legalType !== null} 
                onClose={() => setLegalType(null)} 
                data={getLegalData()} 
            />
            {/* Top Footer */}
            <div className="relative bg-[#F7F7FB]">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-[#F7F7FB] to-white opacity-80" />

                <div className="relative mx-auto max-w-6xl px-5 py-12 md:py-16">

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">

                        {/* Brand */}
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2">

                                <img
                                    src="/images/linktwobuilderlogo.jpeg"
                                    alt="Link2Builder"
                                    className="h-20 w-auto object-contain"
                                />
                            </div>

                            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                                Talk First. Compare Better. Visit Smart. Decide with confidence.
                            </p>

                            {/* Social */}
                            <div className="mt-4 flex items-center gap-4 text-gray-400">
                                <Facebook className="h-5 w-5 cursor-pointer hover:text-indigo-600 transition" />
                                <Instagram className="h-5 w-5 cursor-pointer hover:text-indigo-600 transition" />
                                <X className="h-5 w-5 cursor-pointer hover:text-indigo-600 transition" />
                                <Linkedin className="h-5 w-5 cursor-pointer hover:text-indigo-600 transition" />
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-bold text-black uppercase">
                                Quick Links
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-gray-600">
                                <li>
                                    <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                                </li>
                                <li>
                                    <Link href="/properties" className="hover:text-indigo-600 transition-colors">Properties</Link>
                                </li>
                                <li>
                                    <Link href="/compare-properties" className="hover:text-indigo-600 transition-colors">Compare Properties</Link>
                                </li>
                                <li>
                                    <button onClick={() => openLogin()} className="hover:text-indigo-600 transition-colors">Log In</button>
                                </li>
                                <li>
                                    <button onClick={() => openSignup()} className="hover:text-indigo-600 transition-colors">Sign Up</button>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="col-span-1">
                            <h3 className="text-sm font-bold text-black uppercase">
                                Legal
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-gray-600">
                                <li>
                                    <button 
                                        onClick={() => setLegalType("TERMS")} 
                                        className="hover:text-indigo-600 transition-colors text-left"
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setLegalType("PRIVACY")} 
                                        className="hover:text-indigo-600 transition-colors text-left"
                                    >
                                        Privacy Policy
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => setLegalType("REFUND")} 
                                        className="hover:text-indigo-600 transition-colors text-left"
                                    >
                                        Refund Policy
                                    </button>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-black py-4 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs md:text-sm text-gray-400">
                        ©2024 Link2Builder. All rights reserved
                    </p>
                    <a
                        href="https://www.arekiv.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        Powered by{" "}
                        <span className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Arekiv Global Research Platform Pvt. Ltd.
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
