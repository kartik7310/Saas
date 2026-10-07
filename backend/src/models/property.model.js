import mongoose from "mongoose";

const { Schema } = mongoose;
//listing type
const LISTING_TYPE = ["RESIDENTIAL", "COMMERCIAL"];
//status
const STATUS = ["DRAFT", "LIVE", "SOLD", "PUBLISHED"];
const PROPERTY_APPROVED_STATUS = ["APPROVED", "PENDING", "REJECTED"];

//common for both( residential and commercial)

const LocationSchema = new Schema({
    projectName: String, // Project / Complex Name
    address: String, // Detailed Address
    city: String,
    district: String,
    state: String,
    locality: String,
    landmark: String,
    pincode: String, // only in commercial
    googleMapLink: String,
});


const MediaSchema = new Schema({
    photos: [String],
    videos: [String],
    floorPlans: [String],
    virtualTour: String,
    uploadedVideo: {
        url: String,
        fileId: String
    },
    adminYoutubeLink: String,
});

const LiveMeetingSchema = new Schema({
    enabled: Boolean,
    vcEnabled: Boolean,
    availableSlots: {
        type: String, // TODAY / TOMORROW / CUSTOM
    },
    salesManager: String,
});

//residential schema

const ResidentialSchema = new Schema({
    // Step 1
    propertyTitle: String,
    builderName: String,

    propertyType: {
        type: String,
        enum: ["APARTMENT", "VILLA", "BUILDER_FLOOR", "PLOT", "PENTHOUSE"],
    },

    bhkType: {
        type: String,
        enum: ["1BHK", "2BHK", "3BHK", "4BHK", "4BHK+"],
    },

    carpetArea: Number,

    possessionStatus: {
        type: String,
        enum: ["READY_TO_MOVE", "UNDER_CONSTRUCTION", "NEW_LAUNCH"],
    },

    builtUpArea: Number,
    floorNumber: Number,
    totalFloors: Number,
    propertyAge: String,
    facing: {
        type: String,
        enum: [
            "NORTH",
            "SOUTH",
            "EAST",
            "WEST",
            "NORTH_EAST",
            "NORTH_WEST",
            "SOUTH_EAST",
            "SOUTH_WEST",
        ],
    },

    // Step 4
    amenities: [String],
    amenityImages: [String],
    amenitiesDescription: String,
    description: String,
});

//commercial schema

const CommercialSchema = new Schema({
    // Step 1
    propertyPurpose: {
        type: String,
        enum: ["SELL", "RENT_LEASE"],
    },

    userType: {
        type: String,
        enum: ["SELLER", "BROKER", "BUILDER"],
    },

    propertyCategory: {
        type: String,
        enum: [
            "OFFICE_SPACE",
            "CO_WORKING_OFFICE",
            "IT_OFFICE",
            "COMMERCIAL_OFFICE_FLOOR",
            "SHOP",
        ],
    },

    // Step 2
    officeType: {
        type: String,
        enum: ["BARE_SHELL", "WARM_SHELL", "FULLY_FURNISHED", "CO_WORKING"],
    },
    shopType: {
        type: String,
        enum: ["RETAIL_SHOP", "SHOWROOM", "FOOD_OUTLET"],
    },

    carpetArea: Number,
    builtUpArea: Number,

    floorNumber: Number,
    totalFloors: Number,

    propertyAge: String, // dropdown in UI

    facing: {
        type: String,
        enum: [
            "NORTH",
            "SOUTH",
            "EAST",
            "WEST",
            "NORTH_EAST",
            "NORTH_WEST",
            "SOUTH_EAST",
            "SOUTH_WEST",
        ],
    },

    // Office Configuration (only when propertyCategory is Office type)
    officeConfiguration: {
        cabins: { type: Number, default: 0 },
        workstations: { type: Number, default: 0 },
        meetingRooms: { type: Number, default: 0 },
        conferenceRooms: { type: Number, default: 0 },
        receptionArea: { type: Number, default: 0 },
    },

    // Shop Configuration (only when propertyCategory is SHOP)
    shopConfiguration: {
        washroom: { type: String, enum: ["YES", "NO", "COMMON"], default: "NO" },
        pantry: { type: String, enum: ["YES", "NO"], default: "NO" },
        parking: { type: String, enum: ["AVAILABLE", "NOT_AVAILABLE"], default: "NOT_AVAILABLE" },
        cornerShop: { type: String, enum: ["YES", "NO"], default: "NO" },
    },

    // Step 3
    amenities: [String],
    amenityImages: [String],
    amenitiesDescription: String,
    description: String,
});

//pricing schema

const PricingSchema = new Schema({
    // Residential
    startingPrice: Number,
    pricePerSqft: Number,
    bookingAmount: Number,
    availableUnits: Number,

    // Commercial
    priceType: {
        type: String,
        enum: ["SALE", "RENT"],
    },

    expectedPrice: Number,
    maintenance: Number,
    securityDeposit: Number,
});

//main schema

const PropertySchema = new Schema(
    {
        title: String,

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
        creatorRole: {
            type: String,
            enum: ["SELLER", "BUILDER", "BROKER"],
            required: true,
        },

        listingType: {
            type: String,
            enum: LISTING_TYPE,
            required: true,
            index: true,
        },

        purpose: {
            type: String,
            enum: ["SELL", "RENT"],
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: STATUS,
            default: "DRAFT",
            index: true,
        },

        currentStep: {
            type: Number,
            default: 1,
        },

        propertyApprovedStatus: {
            type: String,
            enum: PROPERTY_APPROVED_STATUS,
            default: "PENDING",
            index: true,
        },

        rejectionReason: {
            type: String,
            enum: [
                "INCOMPLETE",
                "INVALID_PRICING",
                "POOR_IMAGES",
                "DUPLICATE",
                "INCOMPLETE_OR_INACCURATE_DETAILS",
                "INVALID_PRICING_INFORMATION",
                "POOR_QUALITY_IMAGES",
                "DUPLICATE_LISTING",
                "OTHER"
            ]
        },

        rejectionComments: String,

        auditedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        // COMMON
        location: LocationSchema,
        media: MediaSchema,
        liveMeeting: LiveMeetingSchema,
        pricing: PricingSchema,

        // TYPE BASED
        residential: ResidentialSchema,
        commercial: CommercialSchema,
    },
    {
        timestamps: true,
    }
);

//validations

PropertySchema.pre("save", async function () {
    if (this.listingType === "RESIDENTIAL") {
        this.commercial = undefined;
    }

    if (this.listingType === "COMMERCIAL") {
        this.residential = undefined;
    }

    // Normalize Location Data
    if (this.location) {
        const fields = ['projectName', 'address', 'city', 'district', 'state', 'locality', 'landmark', 'pincode'];
        fields.forEach(field => {
            if (this.location[field] && typeof this.location[field] === 'string') {
                this.location[field] = this.location[field].trim().toLowerCase();
            }
        });
    }
});

export const Property = mongoose.model("Property", PropertySchema);