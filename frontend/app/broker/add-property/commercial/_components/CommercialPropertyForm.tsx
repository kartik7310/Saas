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
  commercialStep5Schema
} from "../../_lib/validations";

const steps = [
  "Basic & Location",
  "Office Details",
  "Amenities & Pricing",
  "Publish",
];

const initialFormData = {
  listingType: "COMMERCIAL",
  status: "DRAFT",
  location: {
    projectName: "",
    address: "",
    city: "",
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
    userType: "Owner",
    propertyCategory: "Office Space",
    officeType: "Bare Shell",
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
  },
};

export default function CommercialPropertyForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("commercial_property_form_data");
    const savedStep = localStorage.getItem("commercial_property_form_step");
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
    if (currentStep < 4) {
      localStorage.setItem("commercial_property_form_data", JSON.stringify(formData));
      localStorage.setItem("commercial_property_form_step", currentStep.toString());
    } else {
      localStorage.removeItem("commercial_property_form_data");
      localStorage.removeItem("commercial_property_form_step");
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
      schema = commercialStep1Schema;
      dataToValidate = {
        ...formData.commercial,
        location: formData.location
      };
    } else if (step === 2) {
      schema = commercialStep2Schema;
      dataToValidate = formData.commercial;
    } else if (step === 3) {
      schema = commercialStep5Schema;
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
      mappedData.title = formData.location.projectName || "Commercial Property";
      mappedData.status = "PUBLISHED";

      const purposeMap: any = { "Sell Property": "SELL", "Rent / Lease": "RENT_LEASE" };
      mappedData.commercial.propertyPurpose = purposeMap[formData.commercial.propertyPurpose] || "SELL";

      const userTypeMap: any = { "Owner": "OWNER", "Broker": "BROKER", "Builder": "BUILDER" };
      mappedData.commercial.userType = userTypeMap[formData.commercial.userType] || "OWNER";

      const categoryMap: any = {
        "Office Space": "OFFICE_SPACE",
        "Co-working Office": "CO_WORKING_OFFICE",
        "IT Office": "IT_OFFICE",
        "Commercial Office Floor": "COMMERCIAL_OFFICE_FLOOR"
      };
      mappedData.commercial.propertyCategory = categoryMap[formData.commercial.propertyCategory] || "OFFICE_SPACE";

      const officeTypeMap: any = {
        "Bare Shell": "BARE_SHELL",
        "Warm Shell": "WARM_SHELL",
        "Fully Furnished": "FULLY_FURNISHED",
        "Co-working": "CO_WORKING"
      };
      mappedData.commercial.officeType = officeTypeMap[formData.commercial.officeType] || "BARE_SHELL";

      const facingMap: any = {
        "North": "NORTH", "South": "SOUTH", "East": "EAST", "West": "WEST",
        "North-East": "NORTH_EAST", "North-West": "NORTH_WEST",
        "South-East": "SOUTH_EAST", "South-West": "SOUTH_WEST"
      };
      mappedData.commercial.facing = facingMap[formData.commercial.facing] || "NORTH";

      const slotMap: any = { "Today": "TODAY", "Tomorrow": "TOMORROW", "Custom": "CUSTOM" };
      mappedData.liveMeeting.availableSlots = slotMap[formData.liveMeeting.availableSlots] || "TODAY";

      // Price mapping
      const isSale = formData.commercial.propertyPurpose === "Sell Property";
      mappedData.pricing = {
        priceType: isSale ? "SALE" : "RENT",
        expectedPrice: Number(isSale ? formData.pricing.totalPrice : formData.pricing.expectedRent) || 0,
        maintenance: Number(formData.pricing.maintenance) || 0,
        securityDeposit: Number(formData.pricing.securityDeposit) || 0,
      };

      // Numeric parsing
      mappedData.commercial.carpetArea = Number(formData.commercial.carpetArea) || 0;
      mappedData.commercial.builtUpArea = Number(formData.commercial.builtUpArea) || 0;
      mappedData.commercial.floorNumber = Number(formData.commercial.floorNumber) || 0;
      mappedData.commercial.totalFloors = Number(formData.commercial.totalFloors) || 0;

      mappedData.commercial.configuration = {
        cabins: Number(formData.commercial.configuration?.cabins) || 0,
        workstations: Number(formData.commercial.configuration?.workstations) || 0,
        meetingRooms: Number(formData.commercial.configuration?.meetingRooms) || 0,
        conferenceRooms: Number(formData.commercial.configuration?.conferenceRooms) || 0,
        receptionArea: Number(formData.commercial.configuration?.receptionArea) || 0,
      };

      // 2. Submit to backend
      await api("/properties", {
        method: "POST",
        body: JSON.stringify(mappedData),
      });

      // 3. Clear local storage and show success
      localStorage.removeItem("commercial_property_form_data");
      localStorage.removeItem("commercial_property_form_step");
      setCurrentStep(4);
      toast.success("Commercial property published successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Publish error:", error);
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
                <div
                  key={label}
                  className="relative flex flex-col items-center z-10 w-1/3"
                >
                  <div
                    className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full text-xs md:text-sm font-black transition-all duration-300 border-2 ${isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                      : isPast
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-400"
                      }`}
                  >
                    {isPast ? (
                      <Check className="h-4 w-4 md:h-5 md:w-5 stroke-[3px]" />
                    ) : (
                      stepNumber
                    )}
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
          <div className="absolute top-5 left-[16.666%] right-[16.666%] h-[2px] bg-slate-100 -z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Form Content Wrapper */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
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

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between mt-12 bg-white p-3 md:p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="h-9 md:h-10 px-4 md:px-8 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-[11px] md:text-sm hover:bg-slate-50 transition-all flex items-center gap-1 md:gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                )}
              </div>
              {!isLastStep && (
                <button
                  onClick={nextStep}
                  className="h-9 md:h-10 px-5 md:px-10 rounded-xl bg-blue-600 text-white font-bold text-[11px] md:text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 md:gap-3 ml-auto group"
                >
                  <span className="hidden sm:inline">Continue</span>
                  <span className="sm:hidden">Next</span>
                  <div className="h-5 w-5 md:h-6 md:w-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </button>
              )}
              {isLastStep && (
                <button
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="h-9 md:h-10 px-6 md:px-10 rounded-xl bg-amber-500 text-white font-bold text-[11px] md:text-sm hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center gap-2 md:gap-3 ml-auto group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Publishing...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Publish Property</span>
                      <span className="sm:hidden">Publish</span>
                      <div className="h-5 w-5 md:h-6 md:w-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
