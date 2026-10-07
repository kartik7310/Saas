"use client";
import { useState, useEffect } from "react";
import HeroSection from "./components/HeroSection";
// import CitiesSection from "./components/CitiesSection";
import WhyChooseSection from "./components/WhyChooseUs";
import SearchProperty from "./components/SearchProperty";
import FeaturedProperties from "./components/FeaturedProperties";
import FacilitiesSection from "./components/FacilitiesSection";
import PropertiesSection from "./components/PropertiesSection";
import StatsCounterSection from "./components/StatsCounterSection";
import TestimonialSection from "./components/TestimonialSection";
import HowItWorks from "./components/HowItWorks";
import { api } from "@/lib/api";

export default function Home() {
  const [hasFeatured, setHasFeatured] = useState(false);

  useEffect(() => {
    const checkFeatured = async () => {
      try {
        const res = await api('/featured-properties');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHasFeatured(true);
        }
      } catch (err) {
        console.warn("Featured check skipped:", err);
      }
    };
    checkFeatured();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Global Subtle Watermark Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />


      <div className="relative z-10">
        <HeroSection />
        {/* <HowItWorks /> */}
        {/* <CitiesSection /> */}

        {/* {hasFeatured && <SearchProperty />} */}

        <FeaturedProperties role="BUILDER" title="Builder Featured Properties" direction="left" />
        <FeaturedProperties role="SELLER" title="Seller Featured Properties" direction="right" />
        <FeaturedProperties role="BROKER" title="Broker Featured Properties" direction="left" />

        {hasFeatured && <PropertiesSection />}

        <WhyChooseSection />
        <StatsCounterSection />
        <TestimonialSection />
      </div>
    </main>
  );
}

