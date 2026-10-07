export type BadgeType = "live" | "draft" | "list" | null;

export interface Project {
    _id: string;
    media?: {
        photos?: string[];
    };
    title: string;
    location?: {
        city?: string;
        locality?: string;
    };
    pricing?: {
        startingPrice?: number;
        expectedPrice?: number;
        expectedRent?: number;
    };
    leadsCount?: number;
    status: "DRAFT" | "LIVE" | "SOLD" | "PUBLISHED";
    createdAt: string;
    listingType?: "RESIDENTIAL" | "COMMERCIAL";
    purpose?: "SALE" | "RENT";
    propertyApprovedStatus?: "APPROVED" | "PENDING" | "REJECTED";
    rejectionReason?: string;
    rejectionComments?: string;
    isFeatured?: boolean;
    residential?: {
        propertyType?: string;
        possessionStatus?: string;
        bhkType?: string;
        carpetArea?: number;
        floorNumber?: number;
        totalFloors?: number;
    };
    commercial?: {
        propertyCategory?: string;
        carpetArea?: number;
        floorNumber?: number;
        totalFloors?: number;
    };
    creatorRole?: string;
}
