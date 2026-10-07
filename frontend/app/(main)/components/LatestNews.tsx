"use client";
import Image from "next/image";
import { CalendarDays, User } from "lucide-react";

const bigPost = {
    image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
    author: "Admin",
    date: "Jun 24, 2024",
    title: "What to Look for When Buying a Pre-Owned Car Cars Which is Right for You",
    desc: "From luxury and economy cars and find out which best suits your lifestyle economy cars and find",
};

const smallPosts = [
    {
        id: 1,
        image:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
        author: "Admin",
        date: "Jun 24, 2024",
        title: "What to Look for When Buying a",
        desc: "From luxury and economy cars and find out which best",
    },
    {
        id: 2,
        image:
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        author: "Admin",
        date: "Jun 24, 2024",
        title: "What to Look for When Buying a",
        desc: "From luxury and economy cars and find out which best",
    },
];

export default function LatestNews() {
    return (
        <section className="bg-white py-14">
            <div className="mx-auto max-w-6xl px-4">

                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600">Latest News</p>
                        <h2 className="mt-2 text-3xl font-bold text-black">
                            Our Latest News & Blog
                        </h2>
                    </div>

                    <button className="w-fit rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                        View All News
                    </button>
                </div>

                {/* Layout */}
                <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">

                    {/* Big Card */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-6">
                        <div className="overflow-hidden rounded-2xl">
                            <Image
                                src={bigPost.image}
                                alt="blog"
                                width={1200}
                                height={800}
                                className="h-[320px] w-full object-cover"
                            />
                        </div>

                        {/* Meta */}
                        <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-indigo-600" />
                                <span>By {bigPost.author}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-indigo-600" />
                                <span>{bigPost.date}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="mt-4 text-2xl font-bold text-black leading-snug">
                            {bigPost.title}
                        </h3>

                        {/* Desc */}
                        <p className="mt-3 text-gray-600">{bigPost.desc}</p>

                        <button className="mt-5 flex items-center gap-2 text-indigo-600 font-semibold">
                            Read More.. <span className="text-lg">↗</span>
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-6">
                        <div className="space-y-8">
                            {smallPosts.map((post, idx) => (
                                <div key={post.id}>
                                    <div className="flex flex-col gap-5 md:flex-row">

                                        {/* Image */}
                                        <div className="w-full md:w-[220px]">
                                            <div className="overflow-hidden rounded-2xl">
                                                <Image
                                                    src={post.image}
                                                    alt="blog"
                                                    width={600}
                                                    height={400}
                                                    className="h-[160px] w-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">

                                            {/* Meta */}
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-indigo-600" />
                                                    <span>By {post.author}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-indigo-600" />
                                                    <span>{post.date}</span>
                                                </div>
                                            </div>

                                            <h3 className="mt-3 text-xl font-bold text-black leading-snug">
                                                {post.title}
                                            </h3>

                                            <p className="mt-2 text-gray-600 text-sm">
                                                {post.desc}
                                            </p>

                                            <button className="mt-3 flex items-center gap-2 text-indigo-600 font-semibold">
                                                Read More <span className="text-lg">↗</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    {idx === 0 && (
                                        <div className="mt-8 h-[1px] w-full bg-gray-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}