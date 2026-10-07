import { z } from "zod";

export const locationSchema = z.object({
    projectName: z.string().optional(),
    address: z.string().min(5),
    city: z.string().min(2),
    district: z.string().optional(),
    state: z.string().optional(),
    locality: z.string().optional(),
    landmark: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    googleMapLink: z.string().optional(),
});

export const residentialSchema = z.object({
    propertyTitle: z.string().min(3),
    builderName: z.string().optional(),

    propertyType: z.enum([
        "APARTMENT",
        "VILLA",
        "BUILDER_FLOOR",
        "PLOT",
        "PENTHOUSE",
    ]),

    bhkType: z.enum(["1BHK", "2BHK", "3BHK", "4BHK", "4BHK+"]),

    carpetArea: z.number().positive(),

    possessionStatus: z.enum([
        "READY_TO_MOVE",
        "UNDER_CONSTRUCTION",
        "NEW_LAUNCH",
    ]),

    builtUpArea: z.number().optional(),
    floorNumber: z.number().optional(),
    totalFloors: z.number().optional(),
    propertyAge: z.string().optional(),
    facing: z.string().optional(),

    amenities: z.array(z.string()).optional(),
    amenityImages: z.array(z.string()).optional(),
    amenitiesDescription: z.string().optional(),
    description: z.string().optional(),
});

export const commercialSchema = z.object({
    propertyPurpose: z.enum(["SELL", "RENT_LEASE"]),

    userType: z.enum(["SELLER", "BROKER", "BUILDER"]),

    propertyCategory: z.enum([
        "OFFICE_SPACE",
        "CO_WORKING_OFFICE",
        "IT_OFFICE",
        "COMMERCIAL_OFFICE_FLOOR",
        "SHOP",
    ]),

    carpetArea: z.number().positive(),
    builtUpArea: z.number().optional(),
    floorNumber: z.number().int().nonnegative().optional(),
    totalFloors: z.number().optional(),
    propertyAge: z.string().optional(),
    facing: z.string().optional(),

    officeType: z.string().optional(),
    shopType: z.string().optional(),

    // Office-specific configuration
    officeConfiguration: z.object({
        cabins: z.number().optional(),
        workstations: z.number().optional(),
        meetingRooms: z.number().optional(),
        conferenceRooms: z.number().optional(),
        receptionArea: z.number().optional(),
    }).optional(),

    // Shop-specific configuration
    shopConfiguration: z.object({
        washroom: z.string().optional(),
        pantry: z.string().optional(),
        parking: z.string().optional(),
        cornerShop: z.string().optional(),
    }).optional(),

    amenities: z.array(z.string()).optional(),
    amenityImages: z.array(z.string()).optional(),
    amenitiesDescription: z.string().optional(),
    description: z.string().optional(),
});

export const pricingSchema = z.object({
    expectedPrice: z.number().positive().optional(),
    startingPrice: z.number().positive().optional(),
    maintenance: z.number().optional(),
    pricePerSqft: z.number().optional(),
    bookingAmount: z.number().optional(),
    availableUnits: z.number().optional(),
    priceType: z.enum(["SALE", "RENT"]).optional(),
});

export const mediaSchema = z.object({
    photos: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),
    floorPlans: z.array(z.string()).optional(),
    virtualTour: z.string().optional(),
    amenityImages: z.array(z.string()).optional(),
    uploadedVideo: z.object({
        url: z.string(),
        fileId: z.string()
    }).nullable().optional(),
});

export const liveMeetingSchema = z.object({
    enabled: z.boolean().optional(),
    vcEnabled: z.boolean().optional(),
    availableSlots: z.string().optional(),
    salesManager: z.string().optional(),
});

export const createPropertySchema = z.object({
    title: z.string().optional(),
    listingType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
    purpose: z.enum(["SELL", "RENT"]),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),

    location: locationSchema,

    pricing: pricingSchema.optional(),
    media: mediaSchema.optional(),
    liveMeeting: liveMeetingSchema.optional(),

    residential: residentialSchema.optional(),
    commercial: commercialSchema.optional(),
})
    .superRefine((data, ctx) => {
        if (data.listingType === "RESIDENTIAL") {
            if (!data.residential) {
                ctx.addIssue({
                    code: "custom",
                    message: "Residential data is required",
                    path: ["residential"],
                });
            }
        }

        if (data.listingType === "COMMERCIAL") {
            if (!data.commercial) {
                ctx.addIssue({
                    code: "custom",
                    message: "Commercial data is required",
                    path: ["commercial"],
                });
            }
        }
    });