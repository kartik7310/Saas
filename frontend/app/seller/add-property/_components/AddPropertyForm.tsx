"use client";

import { useState, useEffect } from "react";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Location from "./steps/Step2Location";
import Step3Media from "./steps/Step3Media";
import Step4Amenities from "./steps/Step4Amenities";
import Step5Pricing from "./steps/Step5Pricing";
import Step6Publish from "./steps/Step6Publish";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  residentialStep1Schema,
  residentialStep2Schema,
  residentialStep3Schema,
  residentialStep5Schema
} from "../_lib/validations";
import { z } from "zod";
import { useRouter } from "next/navigation";

export default function AddPropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    listingType: "RESIDENTIAL",
    status: "DRAFT",
    location: { projectName: "", address: "", city: "", state: "", stateId: "", district: "", districtId: "", locality: "", landmark: "", googleMapLink: "" },
    media: { photos: [], videos: [], floorPlans: [], virtualTour: "" },
    liveMeeting: { enabled: false, vcEnabled: false, availableSlots: "", salesManager: "" },
    pricing: { startingPrice: "", pricePerSqft: "", bookingAmount: "", availableUnits: "", totalFloorPrice: "" },
    residential: { propertyTitle: "", builderName: "", propertyType: "", bhkType: "", carpetArea: "", possessionStatus: "", amenities: [], amenityImages: [] },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  const steps = [
    "Basic Info",
    "Location",
    "Media",
    "Amenities & Pricing",
    "Publish",
  ];

  useEffect(() => {
    const savedData = localStorage.getItem("residential_property_form_data");
    const savedStep = localStorage.getItem("residential_property_form_step");
    if (savedData) {
      try { setFormData(JSON.parse(savedData)); } catch (e) {}
    }
    if (savedStep) { setCurrentStep(parseInt(savedStep)); }
  }, []);

  useEffect(() => {
    if (currentStep < 6) {
      localStorage.setItem("residential_property_form_data", JSON.stringify(formData));
      localStorage.setItem("residential_property_form_step", currentStep.toString());
    }
  }, [formData, currentStep]);

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
    } else if (step === 4) {
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
        err.issues.forEach((e: any) => {
          const field = e.path.length > 0 ? e.path[e.path.length - 1] : "_form";
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
        toast.error("Please fix validation errors");
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
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
      const mappedData: any = {
        listingType: "RESIDENTIAL",
        status: "PUBLISHED",
        purpose: "SELL",
        location: {
          projectName: formData.location.projectName || "",
          address: formData.location.address || "",
          city: formData.location.city || "Mumbai",
          locality: formData.location.locality || "",
          landmark: formData.location.landmark || "",
          googleMapLink: formData.location.googleMapLink || "",
        },
        media: {
          photos: formData.media?.photos || [],
          videos: formData.media?.videos || [],
          floorPlans: formData.media?.floorPlans || [],
          virtualTour: formData.media?.virtualTour || "",
        },
        liveMeeting: {
          enabled: Boolean(formData.liveMeeting?.enabled),
          vcEnabled: Boolean(formData.liveMeeting?.vcEnabled),
          availableSlots: (formData.liveMeeting?.availableSlots === "Tomorrow") ? "TOMORROW" : (formData.liveMeeting?.availableSlots === "Custom" ? "CUSTOM" : "TODAY"),
          salesManager: formData.liveMeeting?.salesManager || "",
        },
        pricing: {
          startingPrice: Number(formData.pricing?.startingPrice) || 1,
          pricePerSqft: Number(formData.pricing?.pricePerSqft) || 1,
          bookingAmount: Number(formData.pricing?.bookingAmount) || 0,
          availableUnits: Number(formData.pricing?.availableUnits) || 1,
        }
      };

      mappedData.title = formData.residential.propertyTitle || formData.location.projectName;

      const typeMap: any = { "Apartment": "APARTMENT", "Villa": "VILLA", "Builder Floor": "BUILDER_FLOOR", "Plot": "PLOT", "Penthouse": "PENTHOUSE" };
      const bhkMap: any = { "1": "1BHK", "2": "2BHK", "3": "3BHK", "4": "4BHK", "4+": "4BHK+", "1BHK": "1BHK", "2BHK": "2BHK", "3BHK": "3BHK", "4BHK+": "4BHK+" };
      const possessionMap: any = { "Ready to Move": "READY_TO_MOVE", "Under Construction": "UNDER_CONSTRUCTION", "New Launch": "NEW_LAUNCH" };

      mappedData.residential = {
        propertyTitle: formData.residential.propertyTitle || mappedData.title,
        builderName: formData.residential.builderName || "",
        propertyType: typeMap[formData.residential.propertyType] || "APARTMENT",
        bhkType: bhkMap[formData.residential.bhkType] || "2BHK",
        carpetArea: Number(formData.residential.carpetArea) || 1,
        possessionStatus: possessionMap[formData.residential.possessionStatus] || "READY_TO_MOVE",
        amenities: formData.residential?.amenities || [],
        description: formData.residential?.description || "",
      };

      await api("/properties", { method: "POST", body: JSON.stringify(mappedData) });
      localStorage.removeItem("residential_property_form_data");
      localStorage.removeItem("residential_property_form_step");
      setCurrentStep(6);
      toast.success("Property published successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Stepper Header */}
      <div className="mb-12 relative flex justify-between items-center">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;
          return (
            <div key={label} className="relative flex flex-col items-center z-10 w-1/5">
              <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-black transition-all duration-300 border-2 ${
                isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110" :
                isPast ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-400"
              }`}>
                {isPast ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : stepNumber}
              </div>
              <span className={`absolute top-10 md:top-12 whitespace-nowrap text-[10px] md:text-[11px] font-bold uppercase tracking-wider hidden sm:block ${isActive ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
            </div>
          );
        })}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-0">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentStep === 1 && <Step1BasicInfo formData={formData} updateNestedField={updateNestedField} errors={errors} />}
        {currentStep === 2 && <Step2Location formData={formData} updateNestedField={updateNestedField} errors={errors} />}
        {currentStep === 3 && <Step3Media formData={formData} updateNestedField={updateNestedField} errors={errors} isCommercial={formData.listingType === "COMMERCIAL"} />}
        {currentStep === 4 && (
          <div className="space-y-10">
            <Step4Amenities formData={formData} updateNestedField={updateNestedField} />
            <Step5Pricing formData={formData} updateNestedField={updateNestedField} errors={errors} />
          </div>
        )}
        {currentStep === 5 && <Step6Publish />}
        {currentStep === 6 && <Step5Success />}

        {currentStep < 5 && (
          <div className="flex items-center justify-between mt-12 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={prevStep} disabled={currentStep === 1} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${currentStep === 1 ? "opacity-0 pointer-events-none" : "border hover:bg-slate-50 text-slate-600"}`}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button onClick={currentStep === 4 ? handlePublish : nextStep} disabled={isSubmitting} className="flex items-center gap-2 px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : currentStep === 4 ? "Publish Listing" : "Continue"}
              {currentStep < 4 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step5Success() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
      <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 animate-bounce"><Check className="h-12 w-12" /></div>
      <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Listing Published!</h2>
      <p className="text-slate-500 font-bold mb-10 max-w-md text-center">Your property has been submitted for review. It will be live on the platform soon.</p>
      <button onClick={() => window.location.href = "/seller/my-properties"} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">View My Listings</button>
    </div>
  );
}
