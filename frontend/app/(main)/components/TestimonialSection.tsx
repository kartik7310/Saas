"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
    {
        id: 1,
        name: "Arjun Sharma",
        role: "Real Estate Investor",
        text: "Being a first-time investor, I was quite nervous. But LinkToBuilder made the process of finding a luxury flat in Mumbai so smooth. The transparency is exactly what is needed in the Indian market today.",
        stars: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
    },
    {
        id: 2,
        name: "Priya Reddy",
        role: "Software Professional",
        text: "Searching for a villa in Hyderabad that actually looks like the photos was a challenge. The verified listings and site visit options saved me so much time. Highly recommend for working families!",
        stars: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
    },
    {
        id: 3,
        name: "Vikram Malhotra",
        role: "Business Owner",
        text: "The team is very proactive. They helped me find the perfect commercial office space in Gurgaon within my budget. The detailed property analytics were very helpful for my business planning.",
        stars: 5,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80",
    },
    {
        id: 4,
        name: "Sneha Kapoor",
        role: "Home Buyer",
        text: "Wonderful experience! Finding my dream home in Pune was very easy with their smart filters. I could compare different locations and BHK types side-by-side. Best property site in India!",
        stars: 5,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80",
    },
];


export default function TestimonialSection() {
    const [isPaused, setIsPaused] = useState(false);
    const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

    return (
        <section className="bg-[#0a0f2b] w-full py-10 lg:py-16 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center w-full">

                {/* Left Image */}
                <div className="relative w-full self-stretch flex items-center">
                    <div className="relative rounded-tr-[240px] rounded-br-[240px] overflow-hidden border-r-[12px] border-y-[12px] border-slate-800/40 w-full h-[450px] lg:h-[550px]">
                        <Image
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
                            alt="Modern House"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Right Content */}
                <div className="w-full text-white px-8 lg:pl-16 lg:pr-8 py-8">
                    <span className="text-indigo-400 font-semibold text-xs uppercase tracking-[0.2em]">
                        Testimonials
                    </span>

                    <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-8 leading-tight">
                        What Our Clients Say
                    </h2>

                    <div 
                        className="relative flex overflow-hidden cursor-pointer"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div
                            className="flex gap-6 w-fit animate-marquee"
                            style={{
                                animationDuration: "80s",
                                animationPlayState: isPaused ? "paused" : "running",
                            }}
                        >
                            {duplicatedTestimonials.map((item, index) => (
                                <div
                                    key={`${item.id}-${index}`}
                                    className="min-w-[280px] md:min-w-[380px] bg-white text-slate-800 p-8 rounded-2xl shadow-2xl"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                        />

                                        <div>
                                            <h4 className="font-bold text-base leading-tight">
                                                {item.name}
                                            </h4>
                                            <p className="text-slate-500 text-xs">{item.role}</p>

                                            <div className="flex text-orange-400 text-[10px] mt-1">
                                                {"★".repeat(item.stars)}
                                            </div>
                                        </div>

                                        {/* Quote Icon */}
                                        <div className="ml-auto text-indigo-600/10">
                                            <svg
                                                className="w-10 h-10 fill-current"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 leading-relaxed text-sm italic">
                                        "{item.text}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}