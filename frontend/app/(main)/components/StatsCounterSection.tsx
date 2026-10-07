"use client";
import Image from "next/image";

export default function StatsCircles() {
  const BANKS = [
    {
      id: 1,
      name: "HDFC Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
    },
    {
      id: 2,
      name: "ICICI Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg",
    },
    {
      id: 3,
      name: "Axis Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg",
    },
    {
      id: 4,
      name: "SBI Bank",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg",
    },
  ];

  return (
    <section id="bank-partners" className="bg-white py-20 -mt-15">
      <div className="mx-auto max-w-6xl px-4">

        {/* Heading */}
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-sm font-bold text-purple-600 tracking-widest uppercase mb-2">Trusted By</h2>
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Our Financer Partners
          </h3>

        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 justify-items-center lg:flex lg:justify-center">

          {BANKS.map((bank, index) => (
            <div
              key={bank.id}
              className={`relative flex items-center justify-center z-0 hover:z-20 ${index !== 0 ? "lg:-ml-20" : ""
                }`}
            >
              <div className="group relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px] lg:h-[250px] lg:w-[250px] overflow-hidden rounded-full border border-slate-200 bg-white flex flex-col items-center justify-center text-center transition duration-300 hover:bg-sky-200">

                {/* Hover Background */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-25 transition duration-300"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center">

                  <Image
                    src={bank.logo}
                    alt={bank.name}
                    width={70}
                    height={70}
                    className="object-contain mb-3"
                  />

                  <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">
                    {bank.name}
                  </p>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}