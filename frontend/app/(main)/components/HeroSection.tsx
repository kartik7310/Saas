"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { featuredProjects } from "../../mock-data/mockData2";
import HeroSearchFilters from "./HeroSearchFilters";

const YOUTUBE_URL = "https://youtube.com/@link2builder?si=0OhdEsLakmibnCTr";
const AUTO_SLIDE_INTERVAL = 4000;

export default function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [key, setKey] = useState(0);

    const goTo = (index: number) => {
        setCurrent(index);
        setKey((k) => k + 1);
    };

    const prev = () => goTo(current === 0 ? featuredProjects.length - 1 : current - 1);
    const next = () => goTo(current === featuredProjects.length - 1 ? 0 : current + 1);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((c) => {
                const nextIndex = c === featuredProjects.length - 1 ? 0 : c + 1;
                setKey((k) => k + 1);
                return nextIndex;
            });
        }, AUTO_SLIDE_INTERVAL);
        return () => clearInterval(timer);
    }, []);

    const active = featuredProjects[current];

    return (
        <section className="relative w-full h-[280px] md:h-[400px] bg-gray-900 md:overflow-hidden flex flex-col">

            {/* Background image — right to left */}
            {featuredProjects.map((project, i) => (
                <div
                    key={`bg-${project.id}-${i === current ? key : i}`}
                    className={`absolute inset-0 bg-cover bg-center ${i === current ? "animate-slideLeft" : "opacity-0"}`}
                    style={{ backgroundImage: `url('${project.image}')` }}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent z-10" />


            {/* Text — bottom to top */}
            {/* <div className="relative z-20 flex flex-col justify-center h-full px-6 md:px-16 max-w-2xl pt-12 md:pt-16">
                <p
                    key={`badge-${key}`}
                    className="text-purple-300 text-xs md:text-sm font-semibold tracking-widest uppercase mb-2 animate-slideUp"
                    style={{ animationDelay: "0ms" }}
                >
                    Your Luxury Residence
                </p>
                <h1
                    key={`h1-${key}`}
                    className="text-white text-3xl md:text-5xl font-black leading-tight mb-3 animate-slideUp"
                    style={{ animationDelay: "150ms" }}
                >
                    Talk to Verified Builders 100% Free, Before You Visit
                </h1>
                <p
                    key={`p-${key}`}
                    className="text-gray-300 text-sm md:text-base mb-5 animate-slideUp"
                    style={{ animationDelay: "300ms" }}
                >
                    Talk First. Compare Better. Visit Smart. Decide with confidence.
                </p>
                <div
                    key={`btn-${key}`}
                    className="animate-slideUp"
                    style={{ animationDelay: "450ms" }}
                >
                    <Link
                        href="/properties"
                        className="inline-flex w-fit bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 md:px-8 md:py-3 rounded-full transition-colors text-sm md:text-base"
                    >
                        Explore Properties
                    </Link>
                </div>
            </div> */}


            {/* Bottom bar - Search Filters */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-3 md:px-16 py-2 md:py-3 bg-[#6B6BF5]">
                <HeroSearchFilters />
            </div>


        </section>
    );
}