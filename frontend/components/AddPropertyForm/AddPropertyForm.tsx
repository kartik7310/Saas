"use client";

import { useState, useEffect } from "react";
// import Sidebar from "./Sidebar";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Location from "./steps/Step2Location";
import Step3Media from "./steps/Step3Media";
import Step4Amenities from "./steps/Step4Amenities";
import Step5Pricing from "./steps/Step5Pricing";
import Step6Publish from "./steps/Step6Publish";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner"; // Assuming sonner is used for notifications
import {
  residentialStep1Schema,
  residentialStep2Schema,
  residentialStep3Schema,
  residentialStep5Schema
} from "@/lib/validations/property";
import { z } from "zod";
import { useRouter } from "next/navigation";

const steps = [
  "Basic Info",
  "Location",
  "Media",
  "Amenities",
  "Pricing",
  "Publish",
];

const initialFormData = {
  listingType: "RESIDENTIAL",
  status: "DRAFT",
  location: {
    projectName: "",
    address: "",
    city: "",
    locality: "",
    landmark: "",
    googleMapLink: "",
  },
  media: {
    photos: [],
    videos: [],
    floorPlans: [],
    virtualTour: "",
  },
  liveMeeting: {
    enabled: false,
    vcEnabled: false,
    availableSlots: "",
    salesManager: "",
  },
  pricing: {
    startingPrice: "",
    pricePerSqft: "",
    bookingAmount: "",
    availableUnits: "",
  },
  residential: {
    propertyTitle: "",
    builderName: "",
    propertyType: "",
    bhkType: "",
    carpetArea: "",
    possessionStatus: "",
    amenities: [],
    amenityImages: [],
    amenitiesDescription: "",
  },
};

export default function AddPropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();


  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("residential_property_form_data");
    const savedStep = localStorage.getItem("residential_property_form_step");
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));

      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (currentStep < steps.length) {

      localStorage.setItem("residential_property_form_data", JSON.stringify(formData));
      localStorage.setItem("residential_property_form_step", currentStep.toString());
    } else {
      localStorage.removeItem("residential_property_form_data");
      localStorage.removeItem("residential_property_form_step");
    }
  }, [formData, currentStep]);

  // Helper to update nested fields
  const updateNestedField = (path: string, value: any) => {
    setFormData((prev: any) => {
      const keys = path.split('.');
      const next = { ...prev };
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const validateStep = (step: number) => {
    let schema: any = null;
    let dataToValidate: any = null;

    if (step === 1) {
      schema = residentialStep1Schema;
      dataToValidate = formData.residential;
    } else if (step === 2) {
      schema = residentialStep2Schema;
      dataToValidate = formData.location;
    } else if (step === 3) {
      schema = residentialStep3Schema;
      dataToValidate = { photos: formData.media?.photos || [] };
    } else if (step === 5) {
      schema = residentialStep5Schema;
      dataToValidate = formData.pricing;
    }

    if (!schema) return true;

    try {
      schema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: any = {};
        const errorMessages: string[] = [];

        err.issues.forEach((e: any) => {
          const field = e.path.length > 0 ? e.path[e.path.length - 1] : "_form";
          newErrors[field] = e.message;
          errorMessages.push(e.message);
        });

        setErrors(newErrors);
        toast.error("Please fix the following:", {
          description: errorMessages.join(", "),
        });
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handlePublish = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      // 1. Map data to match backend enums and parse numbers
      const mappedData = JSON.parse(JSON.stringify(formData));
      mappedData.title = formData.residential.propertyTitle;
      mappedData.status = "PUBLISHED";
      mappedData.purpose = "SELL";

      // Map Enums
      const typeMap: any = { "Apartment": "APARTMENT", "Villa": "VILLA", "Builder Floor": "BUILDER_FLOOR", "Plot": "PLOT", "PENTHOUSE": "PENTHOUSE" };
      mappedData.residential.propertyType = typeMap[formData.residential.propertyType] || "APARTMENT";

      const bhkMap: any = { "1": "1BHK", "2": "2BHK", "3": "3BHK", "4": "4BHK", "4+": "4BHK+", "1BHK": "1BHK", "2BHK": "2BHK", "3BHK": "3BHK", "4BHK+": "4BHK+" };
      mappedData.residential.bhkType = bhkMap[formData.residential.bhkType] || "2BHK";

      const possessionMap: any = { "Ready to Move": "READY_TO_MOVE", "Under Construction": "UNDER_CONSTRUCTION", "New Launch": "NEW_LAUNCH" };
      mappedData.residential.possessionStatus = possessionMap[formData.residential.possessionStatus] || "READY_TO_MOVE";

      const slotMap: any = { "Today": "TODAY", "Tomorrow": "TOMORROW", "Custom": "CUSTOM" };
      mappedData.liveMeeting.availableSlots = slotMap[formData.liveMeeting.availableSlots] || "TODAY";

      // Parse Numbers
      if (mappedData.pricing) {
        mappedData.pricing.startingPrice = Number(formData.pricing.startingPrice) || 1;
        mappedData.pricing.pricePerSqft = Number(formData.pricing.pricePerSqft) || 1;
        mappedData.pricing.bookingAmount = Number(formData.pricing.bookingAmount) || 0;
        mappedData.pricing.availableUnits = Number(formData.pricing.availableUnits) || 1;
      }
      if (mappedData.residential) {
        mappedData.residential.carpetArea = Number(formData.residential.carpetArea) || 1;
      }

      // 2. Submit to backend
      await api("/properties", {
        method: "POST",
        body: JSON.stringify(mappedData),
      });

      // 3. Clear local storage and show success
      localStorage.removeItem("residential_property_form_data");
      localStorage.removeItem("residential_property_form_step");
      setCurrentStep(6);
      toast.success("Property published successfully!");
    } catch (error: any) {
      console.error("Publish error:", error);
      toast.error(error.message || "An error occurred during publishing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-4 py-6">
      {/* Main Form Area */}
      <div className="w-full">


        {/* Stepper Header */}
        <div className="mb-8 relative">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isPast = stepNumber < currentStep;

              return (
                <div key={label} className="relative flex flex-col items-center z-10">
                  <div
                    className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-black transition-all duration-300 border-2 ${isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                      : isPast
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-400"
                      }`}
                  >
                    {isPast ? <Check className="h-4 w-4 md:h-5 md:w-5 stroke-[3px]" /> : stepNumber}
                  </div>
                  <span
                    className={`absolute top-10 md:top-12 whitespace-nowrap text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors hidden sm:block ${isActive ? "text-slate-800" : "text-slate-400"
                      }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Connecting Lines */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content Wrapper */}
        <div className="mt-15 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentStep === 1 && (
            <Step1BasicInfo
              formData={formData}
              updateNestedField={updateNestedField}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <Step2Location
              formData={formData}
              updateNestedField={updateNestedField}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <Step3Media
              formData={formData}
              updateNestedField={updateNestedField}
              errors={errors}
            />
          )}
          {currentStep === 4 && <Step4Amenities formData={formData} updateNestedField={updateNestedField} />}
          {currentStep === 5 && (
            <Step5Pricing
              formData={formData}
              updateNestedField={updateNestedField}
              errors={errors}
            />
          )}
          {currentStep === 6 && <Step6Publish />}

          {/* Navigation Buttons (High Fidelity) */}
          {!isLastStep && (
            <div className="flex items-center justify-between mt-12 bg-white/50 backdrop-blur-sm p-3 md:p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="h-9 md:h-10 px-4 md:px-8 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-[11px] md:text-sm hover:bg-slate-50 transition-all flex items-center gap-1 md:gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous Step</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                )}
              </div>
              <button
                onClick={currentStep === steps.length - 1 ? handlePublish : nextStep}
                disabled={isSubmitting}
                className="h-9 md:h-10 px-5 md:px-10 rounded-xl bg-blue-600 text-white font-black text-[11px] md:text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 md:gap-3 ml-auto group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Publishing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      {currentStep === steps.length - 1 ? "Finish & Publish" : "Next Step"}
                    </span>
                    <span className="sm:hidden">
                      {currentStep === steps.length - 1 ? "Publish" : "Next"}
                    </span>
                    <div className="h-5 w-5 md:h-6 md:w-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
