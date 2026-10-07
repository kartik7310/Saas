"use client";

import { useState, useEffect } from "react";
import Step1BasicAndLocation from "./steps/Step1BasicAndLocation";
import Step3PropertyDetails from "./steps/Step3PropertyDetails";
import Step3AmenitiesAndPricing from "./steps/Step3AmenitiesAndPricing";
import Step5Success from "./steps/Step5Success";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { z } from "zod";
import {
  commercialStep1Schema,
  commercialStep2Schema,
  commercialStep3Schema
} from "../../_lib/validations";

const initialFormData = {
  listingType: "COMMERCIAL",
  status: "DRAFT",
  location: {
    projectName: "",
    address: "",
    city: "",
    state: "",
    stateId: "",
    district: "",
    districtId: "",
    locality: "",
    landmark: "",
    pincode: "",
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
    priceType: "SALE",
    expectedPrice: "",
    maintenance: "",
  },
  commercial: {
    propertyPurpose: "Sell Property",
    userType: "Builder",
    propertyCategory: "",
    officeType: "",
    shopType: "",
    carpetArea: "",
    builtUpArea: "",
    floorNumber: "",
    totalFloors: "",
    propertyAge: "Total",
    facing: "North",
    configuration: {
      cabins: 0,
      workstations: 0,
      meetingRooms: 0,
      conferenceRooms: 0,
      receptionArea: 0,
    },
    amenities: [],
    amenityImages: [],
  },
};

export default function CommercialPropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const isShop = formData.commercial?.propertyCategory === "Shop";
  const officeType = formData.commercial?.officeType || "";
  const hasAmenities = officeType !== "Bare Shell" || isShop;

  const steps = [
    "Basic & Location",
    isShop ? "Shop Details" : "Office Details",
    hasAmenities ? "Amenities & Pricing" : "Pricing",
    "Publish",
  ];

  useEffect(() => {
    const savedData = localStorage.getItem("builder_commercial_form_data");
    const savedStep = localStorage.getItem("builder_commercial_form_step");
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

  useEffect(() => {
    localStorage.setItem("builder_commercial_form_data", JSON.stringify(formData));
    localStorage.setItem("builder_commercial_form_step", currentStep.toString());
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

  const validateCurrentStep = (step: number) => {
    let schema: any = null;
    let dataToValidate: any = null;

    if (step === 1) {
      schema = commercialStep1Schema;
      dataToValidate = {
        ...formData.commercial,
        location: formData.location
      };
    } else if (step === 2) {
      schema = commercialStep2Schema;
      dataToValidate = {
        ...formData.commercial,
        media: formData.media
      };
    } else if (step === 3) {
      schema = commercialStep3Schema;
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
        toast.error("Please fix the validation errors");
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublish = async () => {
    if (!validateCurrentStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const mappedData: any = {
        listingType: "COMMERCIAL",
        status: "PUBLISHED",
        location: {
          projectName: formData.location.projectName || "",
          address: formData.location.address || "",
          city: formData.location.city || "",
          district: formData.location.district || "",
          state: formData.location.state || "",
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
          startingPrice: Number(formData.pricing?.startingPrice) || 0,
          pricePerSqft: Number(formData.pricing?.pricePerSqft) || 0,
          expectedPrice: Number(formData.pricing?.expectedPrice || formData.pricing?.totalPrice || formData.pricing?.expectedRent) || 0,
          maintenance: Number(formData.pricing?.maintenance) || 0,
          securityDeposit: Number(formData.pricing?.securityDeposit) || 0,
          priceType: (formData.commercial?.propertyPurpose === "Rent / Lease") ? "RENT" : "SALE",
        }
      };

      mappedData.title = formData.location.projectName || "Commercial Property";
      mappedData.purpose = (formData.commercial.propertyPurpose === "Rent / Lease") ? "RENT" : "SELL";

      const catMap: any = { "Office": "OFFICE_SPACE", "Shop": "SHOP", "Office Space": "OFFICE_SPACE", "Co-working Office": "CO_WORKING_OFFICE", "IT Office": "IT_OFFICE", "Commercial Office Floor": "COMMERCIAL_OFFICE_FLOOR" };
      const officeMap: any = { "Bare Shell": "BARE_SHELL", "Warm Shell": "WARM_SHELL", "Fully Furnished": "FULLY_FURNISHED", "Co-working": "CO_WORKING" };

      mappedData.commercial = {
        propertyPurpose: (formData.commercial.propertyPurpose === "Rent / Lease") ? "RENT_LEASE" : "SELL",
        userType: "BUILDER",
        propertyCategory: catMap[formData.commercial.propertyCategory] || "OFFICE_SPACE",
        officeType: officeMap[formData.commercial.officeType] || "BARE_SHELL",
        carpetArea: Number(formData.commercial.carpetArea) || 1,
        builtUpArea: Number(formData.commercial.builtUpArea) || Number(formData.commercial.carpetArea) || 1,
        floorNumber: Number(formData.commercial.floorNumber) || 0,
        amenities: formData.commercial?.amenities || [],
        description: formData.commercial?.description || "",
      };

      mappedData.commercial.amenityImages = formData.commercial?.amenityImages || [];

      await api("/properties", {
        method: "POST",
        body: JSON.stringify(mappedData),
      });

      localStorage.removeItem("builder_commercial_form_data");
      localStorage.removeItem("builder_commercial_form_step");
      setCurrentStep(4);
      toast.success("Commercial property published successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during publishing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === 3;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-4 py-8">
      <div className="w-full">
        {/* Stepper Header */}
        <div className="mb-12 relative">
          <div className="flex items-center justify-between">
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = index + 1 === currentStep;
              const isPast = index + 1 < currentStep;

              return (
                <div key={label} className="relative flex flex-col items-center z-10 w-1/4">
                  <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-black transition-all duration-300 border-2 ${
                    isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110" :
                    isPast ? "bg-emerald-500 border-emerald-500 text-white" :
                    "bg-white border-slate-200 text-slate-400"
                  }`}>
                    {isPast ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : stepNumber}
                  </div>
                  <span className={`mt-2 text-[8px] md:text-[10px] font-bold uppercase tracking-tighter md:tracking-wider text-center px-1 ${
                    isActive ? "text-slate-900" : "text-slate-400"
                  }`}>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="absolute top-4 md:top-5 left-0 h-[2px] w-full bg-slate-100 -z-10">
            <div className="h-full bg-blue-600 transition-all duration-500 ease-in-out" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[450px]">
          {currentStep === 1 && (
            <Step1BasicAndLocation 
              formData={formData} 
              updateNestedField={updateNestedField} 
              errors={errors} 
            />
          )}

          {currentStep === 2 && (
            <Step3PropertyDetails 
              formData={formData} 
              updateNestedField={updateNestedField} 
              errors={errors} 
            />
          )}

          {currentStep === 3 && (
            <Step3AmenitiesAndPricing 
              formData={formData} 
              updateNestedField={updateNestedField} 
              errors={errors} 
            />
          )}

          {currentStep === 4 && <Step5Success />}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mt-12 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all duration-200 ${
                currentStep === 1 ? "opacity-0 pointer-events-none" : "border border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={isLastStep ? handlePublish : handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 md:px-12 py-2 md:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : isLastStep ? (
                "Publish Property"
              ) : (
                <>
                  Continue <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
