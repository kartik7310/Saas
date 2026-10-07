"use client";
import { usePathname } from "next/navigation";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Step0TypeSelection from "./steps/Step0TypeSelection";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Location from "./steps/Step2Location";
import Step3Media from "./steps/Step3Media";
import Step4Amenities from "./steps/Step4Amenities";
import Step5Pricing from "./steps/Step5Pricing";
import Step6Publish from "./steps/Step6Publish";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";
import {
  residentialStep1Schema,
  residentialStep2Schema,
  residentialStep3Schema,
  residentialStep5Schema,
  commercialStep1Schema,
  commercialStep2Schema,
  commercialStep3Schema
} from "../../lib/validations/property";

const initialFormData = {
  purpose: "SELL", 
  listingType: "RESIDENTIAL", 
  status: "DRAFT",
  location: {
    projectName: "",
    address: "",
    city: "",
    state: "",
    district: "",
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
    enabled: true,
    vcEnabled: true,
    availableSlots: "Today",
    salesManager: "Amit Sharma",
  },
  pricing: {
    startingPrice: "",
    pricePerSqft: "",
    bookingAmount: "",
    availableUnits: "",
    expectedPrice: "",
    maintenance: "",
    securityDeposit: "",
    expectedRent: "",
    totalPrice: "",
  },
  residential: {
    propertyTitle: "",
    builderName: "",
    propertyType: "",
    bhkType: "",
    carpetArea: "",
    builtUpArea: "",
    floorNumber: "",
    totalFloors: "",
    propertyAge: "Total",
    facing: "North",
    possessionStatus: "",
    amenities: [],
    amenityImages: [],
    amenitiesDescription: "",
  },
  commercial: {
    propertyCategory: "",
    officeType: "",
    shopType: "",
    carpetArea: "",
    builtUpArea: "",
    floorNumber: "",
    totalFloors: "",
    propertyAge: "Total",
    facing: "North",
    officeConfiguration: {
      cabins: 0,
      workstations: 0,
      meetingRooms: 0,
      conferenceRooms: 0,
      receptionArea: 0,
    },
    shopConfiguration: {
      washroom: 0,
      pantry: 0,
      parking: 0,
      cornerShop: 0,
    },
    amenities: [],
    amenityImages: [],
  },
};

export default function UnifiedAddPropertyForm() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const [currentStep, setCurrentStep] = useState(0); 
  const [formData, setFormData] = useState<any>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!propertyId);
  const [errors, setErrors] = useState<any>({});

  // Load from localStorage for new listings
  useEffect(() => {
    if (!propertyId) {
      const savedData = localStorage.getItem("unified_add_property_form_data");
      const savedStep = localStorage.getItem("unified_add_property_form_step");
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
    }
  }, [propertyId]);

  // Save to localStorage
  useEffect(() => {
    if (!propertyId && currentStep < 5) {
      localStorage.setItem("unified_add_property_form_data", JSON.stringify(formData));
      localStorage.setItem("unified_add_property_form_step", currentStep.toString());
    } else if (currentStep === 5) {
      localStorage.removeItem("unified_add_property_form_data");
      localStorage.removeItem("unified_add_property_form_step");
    }
  }, [formData, currentStep, propertyId]);

  useEffect(() => {
    if (propertyId) {
      const fetchProperty = async () => {
        try {
          setIsLoading(true);
          const data = await api(`/properties/${propertyId}`);
          
          // Map backend data back to form state
          const mappedData = { ...initialFormData, ...data };

          // Normalize location data (capitalize for dropdown matching)
          if (data.location) {
            const cap = (s: string) => s ? s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";
            mappedData.location = {
              ...data.location,
              state: cap(data.location.state),
              district: cap(data.location.district),
              city: cap(data.location.city),
              locality: cap(data.location.locality),
              projectName: cap(data.location.projectName),
              pincode: data.location.pincode || "",
            };
          }
          
          if (data.listingType === "RESIDENTIAL") {
            const revTypeMap: any = { "APARTMENT": "Apartment", "VILLA": "Villa", "BUILDER_FLOOR": "Builder Floor", "PLOT": "Plot", "PENTHOUSE": "Penthouse" };
            const revBhkMap: any = { "1BHK": "1", "2BHK": "2", "3BHK": "3", "4BHK": "4", "4BHK+": "4+" };
            const revPossessionMap: any = { "READY_TO_MOVE": "Ready to Move", "UNDER_CONSTRUCTION": "Under Construction", "NEW_LAUNCH": "New Launch" };
            const revFacingMap: any = { "NORTH": "North", "SOUTH": "South", "EAST": "East", "WEST": "West", "NORTH_EAST": "North-East", "NORTH_WEST": "North-West", "SOUTH_EAST": "South-East", "SOUTH_WEST": "South-West" };
            
            mappedData.residential.propertyType = revTypeMap[data.residential?.propertyType] || data.residential?.propertyType;
            mappedData.residential.bhkType = revBhkMap[data.residential?.bhkType] || data.residential?.bhkType;
            mappedData.residential.possessionStatus = revPossessionMap[data.residential?.possessionStatus] || data.residential?.possessionStatus;
            mappedData.residential.facing = revFacingMap[data.residential?.facing] || data.residential?.facing;
          } else {
            const revCatMap: any = { "OFFICE_SPACE": "Office", "SHOP": "Shop", "CO_WORKING_OFFICE": "Co-working Office", "IT_OFFICE": "IT Office", "COMMERCIAL_OFFICE_FLOOR": "Commercial Floor" };
            const revOfficeMap: any = { "BARE_SHELL": "Bare Shell", "WARM_SHELL": "Warm Shell", "FULLY_FURNISHED": "Fully Furnished", "CO_WORKING": "Co-working" };
            const revShopMap: any = { "RETAIL_SHOP": "Retail Shop", "SHOWROOM": "Showroom", "FOOD_OUTLET": "Food Outlet" };
            const revFacingMap: any = { "NORTH": "North", "SOUTH": "South", "EAST": "East", "WEST": "West", "NORTH_EAST": "North-East", "NORTH_WEST": "North-West", "SOUTH_EAST": "South-East", "SOUTH_WEST": "South-West" };
            
            mappedData.commercial.propertyCategory = revCatMap[data.commercial?.propertyCategory] || data.commercial?.propertyCategory;
            mappedData.commercial.officeType = revOfficeMap[data.commercial?.officeType] || data.commercial?.officeType;
            mappedData.commercial.shopType = revShopMap[data.commercial?.shopType] || data.commercial?.shopType;
            mappedData.commercial.propertyPurpose = data.commercial?.propertyPurpose === "RENT_LEASE" ? "Rent / Lease" : "Sell Property";
            mappedData.commercial.facing = revFacingMap[data.commercial?.facing] || data.commercial?.facing;

            // Restore separate configurations
            const isShopEdit = data.commercial?.propertyCategory === "SHOP";
            if (isShopEdit && data.commercial?.shopConfiguration) {
              const sc = data.commercial.shopConfiguration;
              mappedData.commercial.shopConfiguration = {
                washroom: sc.washroom === "YES" ? 1 : 0,
                pantry: sc.pantry === "YES" ? 1 : 0,
                parking: sc.parking === "AVAILABLE" ? 1 : 0,
                cornerShop: sc.cornerShop === "YES" ? 1 : 0,
              };
            } else if (!isShopEdit && data.commercial?.officeConfiguration) {
              mappedData.commercial.officeConfiguration = data.commercial.officeConfiguration;
            }
          }

          const revSlotMap: any = { "TODAY": "Today", "TOMORROW": "Tomorrow", "CUSTOM": "Custom" };
          mappedData.liveMeeting.availableSlots = revSlotMap[data.liveMeeting?.availableSlots] || data.liveMeeting?.availableSlots;

          setFormData(mappedData);
          setCurrentStep(0); // Start from the beginning as requested
        } catch (error) {
          console.error("Error fetching property:", error);
          toast.error("Failed to load property data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    }
  }, [propertyId]);

  const showAmenities = !(
    formData.listingType === "COMMERCIAL" &&
    formData.commercial.propertyCategory === "Office" &&
    formData.commercial.officeType === "Bare Shell"
  );

  const steps = [
    "Purpose & Type",
    "Basic Details",
    "Location",
    "Media",
    showAmenities ? "Amenities & Pricing" : "Pricing",
    "Publish",
  ];

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
    if (step === 0) return true;

    let schema: any = null;
    let dataToValidate: any = null;

    if (formData.listingType === "RESIDENTIAL") {
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
    } else {
      if (step === 1) {
        schema = commercialStep1Schema;
        dataToValidate = formData.commercial;
      } else if (step === 2) {
        schema = commercialStep2Schema;
        dataToValidate = formData.location;
      } else if (step === 4) {
        schema = commercialStep3Schema; // Using commercialStep3Schema for pricing in shared lib
        dataToValidate = formData.pricing;
      }
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
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
    window.scrollTo(0, 0);
  };

  const pathname = usePathname();
  const getRoleFromPath = () => {
    if (pathname.includes("/seller/")) return "SELLER";
    if (pathname.includes("/builder-dashboard/")) return "BUILDER";
    if (pathname.includes("/broker/")) return "BROKER";
    return "SELLER";
  };

  const handlePublish = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const isResidential = formData.listingType === "RESIDENTIAL";
      const mappedData: any = {
        listingType: formData.listingType,
        status: "PUBLISHED",
        location: {
          projectName: formData.location.projectName || "",
          address: formData.location.address || "",
          city: formData.location.city || "Mumbai",
          locality: formData.location.locality || "",
          landmark: formData.location.landmark || "",
          googleMapLink: formData.location.googleMapLink || "",
          district: formData.location.district || "",
          state: formData.location.state || "",
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
          expectedPrice: Number(formData.pricing?.expectedPrice || formData.pricing?.totalPrice || formData.pricing?.expectedRent) || 1,
          maintenance: Number(formData.pricing?.maintenance) || 0,
          securityDeposit: Number(formData.pricing?.securityDeposit) || 0,
          bookingAmount: Number(formData.pricing?.bookingAmount) || 0,
          availableUnits: Number(formData.pricing?.availableUnits) || 1,
          priceType: (formData.commercial?.propertyPurpose === "Rent / Lease") ? "RENT" : "SALE",
        }
      };

      mappedData.title = isResidential 
        ? (formData.residential.propertyTitle || formData.location.projectName || "New Property") 
        : (formData.location.projectName || "New Commercial Property");
      
      mappedData.purpose = formData.purpose || "SELL";

      if (isResidential) {
        const typeMap: any = { "Apartment": "APARTMENT", "Villa": "VILLA", "Builder Floor": "BUILDER_FLOOR", "Plot": "PLOT", "Penthouse": "PENTHOUSE" };
        const bhkMap: any = { "1": "1BHK", "2": "2BHK", "3": "3BHK", "4": "4BHK", "4+": "4BHK+", "1BHK": "1BHK", "2BHK": "2BHK", "3BHK": "3BHK", "4BHK": "4BHK", "4BHK+": "4BHK+" };
        const possessionMap: any = { "Ready to Move": "READY_TO_MOVE", "Under Construction": "UNDER_CONSTRUCTION", "New Launch": "NEW_LAUNCH" };

        mappedData.residential = {
          propertyTitle: formData.residential.propertyTitle || mappedData.title,
          builderName: formData.residential.builderName || "",
          propertyType: typeMap[formData.residential.propertyType] || "APARTMENT",
          bhkType: bhkMap[formData.residential.bhkType] || "2BHK",
          carpetArea: Number(formData.residential.carpetArea) || 1,
          builtUpArea: Number(formData.residential.builtUpArea) || Number(formData.residential.carpetArea) || 1,
          floorNumber: Number(formData.residential.floorNumber) || 0,
          totalFloors: Number(formData.residential.totalFloors) || 0,
          propertyAge: formData.residential.propertyAge || "Total",
          facing: (formData.residential.facing?.toUpperCase().replace("-", "_")) || "NORTH",
          possessionStatus: possessionMap[formData.residential.possessionStatus] || "READY_TO_MOVE",
          amenities: formData.residential?.amenities || [],
          amenityImages: formData.residential?.amenityImages || [],
          description: formData.residential?.description || formData.residential?.amenitiesDescription || "",
        };
      } else {
        const catMap: any = { "Office": "OFFICE_SPACE", "Shop": "SHOP", "Office Space": "OFFICE_SPACE", "Co-working Office": "CO_WORKING_OFFICE", "IT Office": "IT_OFFICE", "Commercial Floor": "COMMERCIAL_OFFICE_FLOOR" };
        const officeMap: any = { "Bare Shell": "BARE_SHELL", "Warm Shell": "WARM_SHELL", "Fully Furnished": "FULLY_FURNISHED", "Co-working": "CO_WORKING" };
        const shopMap: any = { "Retail Shop": "RETAIL_SHOP", "Showroom": "SHOWROOM", "Food Outlet": "FOOD_OUTLET" };

        mappedData.commercial = {
          propertyPurpose: (formData.commercial.propertyPurpose === "Rent / Lease") ? "RENT_LEASE" : "SELL",
          userType: getRoleFromPath(),
          propertyCategory: catMap[formData.commercial.propertyCategory] || "OFFICE_SPACE",
          officeType: (formData.commercial.propertyCategory === "Office" || formData.commercial.propertyCategory === "Office Space") ? (officeMap[formData.commercial.officeType] || "BARE_SHELL") : undefined,
          shopType: (formData.commercial.propertyCategory === "Shop") ? (shopMap[formData.commercial.shopType] || "RETAIL_SHOP") : undefined,
          carpetArea: Number(formData.commercial.carpetArea) || 1,
          builtUpArea: Number(formData.commercial.builtUpArea) || Number(formData.commercial.carpetArea) || 1,
          floorNumber: Number(formData.commercial.floorNumber) || 0,
          totalFloors: Number(formData.commercial.totalFloors) || 0,
          propertyAge: formData.commercial.propertyAge || "Total",
          facing: (formData.commercial.facing?.toUpperCase().replace("-", "_")) || "NORTH",
          amenities: formData.commercial?.amenities || [],
          amenityImages: formData.commercial?.amenityImages || [],
          description: formData.commercial?.description || "",
        };

        const isShop = formData.commercial.propertyCategory === "Shop";

        if (isShop) {
          // Send shopConfiguration only
          const shopCfg = formData.commercial.shopConfiguration || {};
          mappedData.commercial.shopConfiguration = {
            washroom: (shopCfg.washroom === 1 || shopCfg.washroom === "YES") ? "YES" : "NO",
            pantry: (shopCfg.pantry === 1 || shopCfg.pantry === "YES") ? "YES" : "NO",
            parking: (shopCfg.parking === 1 || shopCfg.parking === "AVAILABLE") ? "AVAILABLE" : "NOT_AVAILABLE",
            cornerShop: (shopCfg.cornerShop === 1 || shopCfg.cornerShop === "YES") ? "YES" : "NO",
          };
        } else {
          // Send officeConfiguration only
          const officeCfg = formData.commercial.officeConfiguration || {};
          mappedData.commercial.officeConfiguration = {
            cabins: Number(officeCfg.cabins) || 0,
            workstations: Number(officeCfg.workstations) || 0,
            meetingRooms: Number(officeCfg.meetingRooms) || 0,
            conferenceRooms: Number(officeCfg.conferenceRooms) || 0,
            receptionArea: Number(officeCfg.receptionArea) || 0,
          };
        }
      }

      if (propertyId) {
        await api(`/properties/${propertyId}`, { method: "PUT", body: JSON.stringify(mappedData) });
        toast.success("Listing updated successfully!");
      } else {
        await api("/properties", { method: "POST", body: JSON.stringify(mappedData) });
        toast.success("Listing published successfully!");
      }
      localStorage.removeItem("unified_add_property_form_data");
      localStorage.removeItem("unified_add_property_form_step");
      setCurrentStep(steps.length - 1);
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
        {steps.map((label, index) => (
          <div key={label} className="relative flex flex-col items-center z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-black transition-all ${
              index === currentStep ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110" :
              index < currentStep ? "bg-emerald-500 border-emerald-500 text-white" :
              "bg-white border-slate-200 text-slate-400"
            }`}>
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
              index === currentStep ? "text-slate-800" : "text-slate-400"
            }`}>{label}</span>
          </div>
        ))}
        <div className="absolute top-5 h-[2px] bg-slate-100 w-full -z-0">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-8 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading property data...</p>
          </div>
        ) : (
          <>
            {currentStep === 0 && <Step0TypeSelection formData={formData} updateNestedField={updateNestedField} />}
        {currentStep === 1 && (
          <Step1BasicInfo 
            formData={formData} 
            updateNestedField={updateNestedField} 
            errors={errors}
            isCommercial={formData.listingType === "COMMERCIAL"} 
          />
        )}
        {currentStep === 2 && <Step2Location formData={formData} updateNestedField={updateNestedField} errors={errors} isEdit={!!propertyId} />}
        {currentStep === 3 && <Step3Media formData={formData} updateNestedField={updateNestedField} errors={errors} isCommercial={formData.listingType === "COMMERCIAL"} />}
        {currentStep === 4 && (
          <div className="space-y-10">
            {showAmenities && <Step4Amenities formData={formData} updateNestedField={updateNestedField} isCommercial={formData.listingType === "COMMERCIAL"} />}
            <Step5Pricing formData={formData} updateNestedField={updateNestedField} errors={errors} isCommercial={formData.listingType === "COMMERCIAL"} />
          </div>
        )}
        {currentStep === 5 && <Step6Publish />}
          </>
        )}

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                currentStep === 0 ? "opacity-0 pointer-events-none" : "border hover:bg-slate-50 text-slate-600"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={currentStep === 4 ? handlePublish : nextStep}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === 4 ? "Publish Listing" : "Continue"}
              {currentStep < 4 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
