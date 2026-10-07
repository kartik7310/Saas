import Image from "next/image";

interface HeroSectionProps {
    propertyName?: string;
    propertyImage?: string;
    ownerName?: string;
}

export default function HeroSection({ propertyName, propertyImage, ownerName }: HeroSectionProps) {
    const displayName = propertyName || "Skyline Heights";
    const displayOwner = ownerName || `${displayName}'s representative`;
    const bgImage = propertyImage || "/images/building.png";

    return (
        <section className="relative w-full h-[140px] md:h-[160px] overflow-hidden">

            {/* Background Image */}
            <Image
                src={bgImage}
                alt={displayName}
                fill
                priority
                className="object-cover object-center"
                unoptimized={bgImage.startsWith("http")}
            />

            {/* Left Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b2c4a]/90 via-[#0b2c4a]/60 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex items-center h-full max-w-[1200px] mx-auto px-6 md:px-10">

                <div className="max-w-[520px] text-white">

                    <h1 className="text-[18px] md:text-[34px] font-semibold leading-[1.25] tracking-tight">
                        Book Live Video Call
                        <br />
                        with {displayName}
                    </h1>

                    <p className="mt-2 text-[11px] md:text-[15px] text-gray-200 leading-relaxed line-clamp-2">
                        Schedule a direct video meeting with {displayOwner} for detailed project information
                    </p>

                </div>

            </div>
        </section>
    );
}