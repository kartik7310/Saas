"use client";
import { useState } from "react";
import { Check, MoveLeft, MoveRight } from "lucide-react";
import { allProperties } from "../../mock-data/mockData2";

export default function FacilitiesSection() {
  // Slider state manage karne ke liye
  const miniGallery = allProperties.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);

  const stats = [
    { label: "Completed Property", value: "80%" },
    { label: "Satisfied Customers", value: "99%" },
    { label: "Home ownership", value: "50%" },
  ];

  const features = [
    "Living rooms are pre-wired for Surround",
    "Luxurious interior design and amenities",
    "Private balconies with stunning views",
    "A rare combination of inspired architecture",
  ];

  // Next aur Previous functions
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % miniGallery.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + miniGallery.length) % miniGallery.length);
  };

  return (
    <section className="py-20 bg-white px-6 md:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Side: Content */}
        <div className="space-y-6">
          <div>
            <span className="text-purple-600 font-bold tracking-[0.15em] uppercase text-[12px]">
              Our Top Facilities
            </span>
            <h2 className="text-2xl md:text-[42px] font-black mt-3 text-gray-900 leading-[1.2]">
              Making living spaces More <br className="hidden md:block" /> Beautiful
            </h2>
            <p className="text-gray-500 mt-4 text-[15px] max-w-lg leading-relaxed opacity-80">
              Over 39,000 people work for us in more than 70 countries all over the This breadth of global coverage, combined with specialist services.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 border-b border-gray-100 pb-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</h3>
                <p className="text-gray-400 text-[10px] md:text-[11px] uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Features List */}
          <ul className="grid grid-cols-1 gap-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600 text-[14px]">
                <Check size={14} className="text-purple-600 stroke-[3px]" />
                {feature}
              </li>
            ))}
          </ul>

          {/* Slider Controls & Mini Gallery */}
          <div className="flex items-center gap-6 pt-4">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all active:scale-95"
              >
                <MoveLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all active:scale-95"
              >
                <MoveRight size={18} />
              </button>
            </div>

            <div className="flex gap-2 overflow-hidden">
              {miniGallery.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(i)}
                  className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all duration-300 ${i === activeIndex ? 'border-purple-600 scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={item.image} alt="thumb" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Image */}
        <div className="relative">
          <div className="rounded-[30px] md:rounded-[40px] overflow-hidden shadow-xl h-[300px] md:h-[550px] transition-all duration-500">
            <img
              key={activeIndex} // Key change hone par animation trigger hogi
              src={miniGallery[activeIndex].image}
              alt="Interior"
              className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
            />
          </div>
        </div>

      </div>
    </section>
  );
}