
import Image from "next/image";
import { Building2, Landmark, DollarSign } from "lucide-react";

const features = [

  {
    icon: <Landmark className="text-purple-600" size={28} />,
    title: "Mortgage Services",
    desc: "We help you find the best mortgage options with trusted financial partners.",
  },
  {
    icon: <DollarSign className="text-purple-600" size={28} />,
    title: "Financing made easy",
    desc: "Simple and transparent financing solutions to help you purchase your dream property.",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="w-full py-12 md:py-20 px-6 md:px-16 bg-white">
      <div className="flex flex-col lg:flex-row gap-12 items-center">

        {/* Left — Property Images */}
        <div className="relative w-full lg:w-1/2 flex-shrink-0 h-[350px] md:h-[500px]">

          {/* Back Image */}
          <div className="absolute top-0 left-0 w-[55%] h-[85%] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
              alt="Luxury House"
              fill
              className="object-cover"
            />
          </div>

          {/* Front Image */}
          <div className="absolute bottom-0 right-0 w-[65%] h-[75%] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <Image
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994"
              alt="Modern Property"
              fill
              className="object-cover"
            />
          </div>

          {/* Icon circle */}
          <div className="absolute bottom-[18%] left-[30%] z-10 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center">
            <Building2 className="text-purple-600" size={28} />
          </div>
        </div>

        {/* Right — Text Content */}
        <div className="w-full lg:w-1/2">
          <p className="text-purple-600 font-semibold text-sm mb-2">
            Why choose us
          </p>

          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-3">
            We Bring Your Dream Homes to Reality
          </h2>

          <p className="text-gray-400 text-sm mb-8">
            We offer perfect real estate services
          </p>

          {/* Features */}
          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <div key={i}>
                <div className="flex gap-4 items-start">

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                {i < features.length - 1 && (
                  <hr className="mt-6 border-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}