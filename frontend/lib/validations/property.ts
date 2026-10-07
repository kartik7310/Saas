import { z } from "zod";

// Base Location Schema
export const locationSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  locality: z.string().min(1, "Locality is required"),
  pincode: z.string().length(6, "Pincode must be exactly 6 digits"),
  landmark: z.string().optional(),
  googleMapLink: z.string().optional(),
});

// Residential Specific Schemas
export const residentialStep1Schema = z.object({
  propertyTitle: z.string().min(3, "Title must be at least 3 characters"),
  builderName: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  bhkType: z.string().min(1, "BHK type is required"),
  carpetArea: z.preprocess((v) => (v === "" || v === null ? undefined : Number(v)), z.number().positive("Carpet area is required")),
  possessionStatus: z.string().min(1, "Possession status is required"),
  floorNumber: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "Please enter a valid number" }).nonnegative("Floor number cannot be negative").optional()
  ),
  totalFloors: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "Please enter a valid number" }).nonnegative("Total floors cannot be negative").optional()
  ),
});

export const residentialStep2Schema = locationSchema;

export const residentialStep3Schema = z.object({
  // Media is often checked separately (e.g. at least one photo), 
  // but we can add placeholders if needed.
  photos: z.array(z.any()).min(1, "At least one photo is required"),
});

// Helper: converts value to number, treats empty/NaN as undefined
const toOptionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().positive().optional()
);

export const residentialStep5Schema = z.object({
  expectedPrice: toOptionalNumber,
  startingPrice: toOptionalNumber,
  availableUnits: toOptionalNumber,
  bookingAmount: toOptionalNumber,
}).refine(data => data.expectedPrice || data.startingPrice, {
  message: "Please enter a Starting Price or Expected Price",
  path: ["startingPrice"],
});

// Helper: converts value to positive number, empty string becomes undefined
const toPositiveNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number({ message: "Please enter a valid number" }).positive("Must be a positive number")
);

// Commercial Specific Schemas
export const commercialStep1Schema = z.object({
  propertyCategory: z.string().min(1, "Category is required"),
  officeType: z.string().optional(),
  shopType: z.string().optional(),
  carpetArea: toPositiveNumber,
  floorNumber: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "Please enter a valid number" }).nonnegative("Floor number cannot be negative").optional()
  ),
  totalFloors: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "Please enter a valid number" }).nonnegative("Total floors cannot be negative").optional()
  ),
});

export const commercialStep2Schema = locationSchema;

export const commercialStep3Schema = z.object({
  expectedPrice: toOptionalNumber,
  expectedRent: toOptionalNumber,
}).refine(data => data.expectedPrice || data.expectedRent, {
  message: "Please enter an Expected Price or Expected Rent",
  path: ["expectedPrice"],
});

// Helper to get schema by step
export const getStepSchema = (listingType: "RESIDENTIAL" | "COMMERCIAL", step: number) => {
  if (listingType === "RESIDENTIAL") {
    switch (step) {
      case 1: return residentialStep1Schema;
      case 2: return residentialStep2Schema;
      case 3: return residentialStep3Schema;
      // Step 4 (Amenities) often optional
      case 5: return residentialStep5Schema;
      default: return null;
    }
  } else {
    switch (step) {
      case 1: return commercialStep1Schema;
      case 2: return commercialStep2Schema;
      default: return null;
    }
  }
};
