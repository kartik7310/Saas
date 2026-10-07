import { FileText, CalendarPlus, UserCheck } from "lucide-react";

const steps = [
    {
        icon: <FileText className="h-10 w-10 text-indigo-500 mb-3 transition-colors duration-500 group-hover:text-white" />,
        title: "1. Select Project",
        subtitle: "Browse through our verified listings and select a property that matches your criteria.",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
        icon: <CalendarPlus className="h-10 w-10 text-fuchsia-500 mb-3 transition-colors duration-500 group-hover:text-white" />,
        title: "2. Book VC Slot",
        subtitle: "Schedule a convenient virtual video tour with the builder directly from the platform.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
        icon: <UserCheck className="h-10 w-10 text-rose-500 mb-3 transition-colors duration-500 group-hover:text-white" />,
        title: "3. Meet Builder Live",
        subtitle: "Discuss details and finalize everything in a live meeting from the comfort of your home.",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
];

const HowItWorks = () => {
    return (
        <section className="w-full py-10 md:py-20 px-4 bg-white overflow-hidden border-b border-gray-100">
            <div className="max-w-5xl mx-auto flex flex-col items-center">

                <div className="flex flex-col items-center justify-center mb-6 md:mb-16 text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-16 md:w-20 bg-gray-200" />
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 whitespace-nowrap tracking-tight">How It Works</h2>
                        <div className="h-px w-16 md:w-20 bg-gray-200" />
                    </div>
                    <p className="text-gray-500 max-w-2xl text-lg px-4 hidden md:block">
                        Your dream property is just three simple steps away. We've streamlined the journey to make buying real estate effortless and transparent.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 py-4 md:py-8 px-4 w-full relative">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative group shrink-0 rounded-full w-64 h-64 md:w-[17rem] md:h-[17rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center hover:scale-[1.12] transition-all duration-500 cursor-pointer overflow-hidden z-10 hover:z-50 hover:shadow-2xl hover:border-transparent"
                        >
                            {/* Hover Background Image Reveal */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${step.image})` }}
                            >
                                {/* Dark overlay to keep text readable */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-0"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center justify-center text-center px-8">
                                {step.icon}
                                <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-white transition-colors duration-500 mb-2">{step.title}</h3>
                                <p className="text-sm font-medium text-gray-500 group-hover:text-gray-200 transition-colors duration-500">
                                    {step.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HowItWorks;