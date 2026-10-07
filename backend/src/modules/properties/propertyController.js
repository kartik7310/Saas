
import asyncHandler from "../../utils/asyncHandler.js";
import { Property } from "../../models/property.model.js";
import { Notification } from "../../models/notification.model.js";
import Lead from "../../models/lead.model.js";
import logger from "../../config/logger.js";
import { uploadToImageKit } from "../../utils/uploadfile.js";
import { createPropertySchema } from "../../validation-schemas/propertySchema.js";
import { FeaturedProperty } from "../../models/FeaturedProperty.model.js";

// 1. Create Property (Full submission)
export const createProperty = asyncHandler(async (req, res) => {
    if (!Object.keys(req.body).length) {
        return res.status(400).json({ message: "Request body is empty" });
    }

    const result = createPropertySchema.safeParse(req.body);

    if (!result.success) {
        throw result.error; // Global error handler will format this into a readable message
    }

    const propertyData = {
        ...result.data,
        createdBy: req.user._id,
        creatorRole: req.user.role,
    };

    const property = await Property.create(propertyData);

    // Notify Admin
    const propertyTitle = property.residential?.propertyTitle || property.title || "New Property";
    await Notification.create({
        forAdmin: true,
        title: "New Property Listed",
        message: `${req.user.name} (${req.user.role}) listed a new property: ${propertyTitle}`,
        type: "PROPERTY_LISTED",
        relatedId: property._id
    });

    res.status(201).json({
        message: "Property listing created successfully",
        property: {
            _id: property._id,
            listingType: property.listingType,
            status: property.status,
            createdAt: property.createdAt,
        },
    });
});

// 2. Upload Files
export const uploadPropertyFiles = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error("No files provided");
    }

    const results = await Promise.all(req.files.map(uploadToImageKit));

    res.json({
        message: "Files uploaded successfully",
        files: results,
    });
});


export const getProperties = asyncHandler(async (req, res) => {
    try {
        const {
            listingType,
            district,
            state,
            city,
            locality,
            owner,
            bhk,
            propertyType,
            category,
            purpose,
            role,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            possessionStatus,

            sort = "newest",
            page = 1,
            limit = 30
        } = req.query;

        const query = {
            status: { $in: ["LIVE", "PUBLISHED"] },
            propertyApprovedStatus: "APPROVED"
        };

        // Basic Filters
        if (listingType) query.listingType = listingType;
        if (purpose) query.purpose = purpose;
        if (role) query.creatorRole = role;
        if (owner) query.createdBy = owner;
        if (state) query["location.state"] = new RegExp(state, "i");
        if (district) query["location.district"] = new RegExp(district, "i");
        if (city) {
            query.$or = [
                { "location.city": new RegExp(city, "i") },
                { "location.district": new RegExp(city, "i") }
            ];
        }
        if (locality) query["location.locality"] = new RegExp(locality, "i");

        // Residential Filters
        if (bhk) query["residential.bhkType"] = bhk;
        if (propertyType) query["residential.propertyType"] = propertyType;
        if (possessionStatus) query["residential.possessionStatus"] = possessionStatus;


        // Commercial Filters
        if (category) query["commercial.propertyCategory"] = category;

        // Price Filter
        if (minPrice || maxPrice) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { "pricing.expectedPrice": { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || 999999999 } },
                    { "pricing.startingPrice": { $gte: Number(minPrice) || 0, $lte: Number(maxPrice) || 999999999 } }
                ]
            });
        }

        // Area Filter
        if (minArea || maxArea) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { "residential.carpetArea": { $gte: Number(minArea) || 0, $lte: Number(maxArea) || 999999999 } },
                    { "commercial.carpetArea": { $gte: Number(minArea) || 0, $lte: Number(maxArea) || 999999999 } }
                ]
            });
        }

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { "pricing.expectedPrice": 1, "pricing.startingPrice": 1 };
        if (sort === "price_desc") sortOption = { "pricing.expectedPrice": -1, "pricing.startingPrice": -1 };

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const [properties, totalCount, stats] = await Promise.all([
            Property.find(query)
                .populate("createdBy", "name email phone")
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Property.countDocuments(query),
            Property.aggregate([
                { $match: { status: { $in: ["LIVE", "PUBLISHED"] }, propertyApprovedStatus: "APPROVED" } },
                { $group: { _id: "$listingType", count: { $sum: 1 } } }
            ])
        ]);

        const statsMap = stats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});
        const globalTotal = stats.reduce((acc, curr) => acc + curr.count, 0);

        res.json({
            total: totalCount,
            page: Number(page),
            totalPages: Math.ceil(totalCount / limit),
            stats: {
                total: globalTotal,
                residential: statsMap['RESIDENTIAL'] || 0,
                commercial: statsMap['COMMERCIAL'] || 0,
            },
            results: properties
        });
    } catch (error) {
        console.error("Error in getProperties:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// 4. Get my properties (Dashboard)
export const getMyProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find({ 
        createdBy: req.user._id,
        creatorRole: req.user.role
    }).sort({ createdAt: -1 });

    const propertiesWithLeads = await Promise.all(
        properties.map(async (property) => {
            const leadsCount = await Lead.countDocuments({ propertyId: property._id });
            const featured = await FeaturedProperty.findOne({
                propertyId: property._id,
                status: "ACTIVE",
                expireAt: { $gte: new Date() }
            });
            return {
                ...property.toObject(),
                leadsCount,
                isFeatured: !!featured
            };
        })
    );

    res.json(propertiesWithLeads);
});

// 5. Update Property
export const updateProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this property");
    }

    // Prevent users from self-approving or changing ownership
    const { propertyApprovedStatus, auditedBy, createdBy, ...updateData } = req.body;

    const updatedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        { 
            $set: { 
                ...updateData, 
                propertyApprovedStatus: "PENDING" // Reset to pending for re-approval
            } 
        },
        { returnDocument: "after", runValidators: true }
    );

    res.json(updatedProperty);
});

// 6. Delete Property
export const deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    // Check ownership
    if (property.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to delete this property");
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: "Property removed successfully" });
});

// 7. Get property by ID
export const getPropertyById = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id).populate("createdBy", "name email phone");

    if (!property) {
        res.status(404);
        throw new Error("Property not found");
    }

    // Check if property is approved. If not, only the creator or admin can see it.
    const isAdmin = req.user && (req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN");

    // createdBy can be populated (object with ._id) or a plain ObjectId
    const ownerId = property.createdBy?._id
        ? property.createdBy._id.toString()
        : property.createdBy?.toString();

    const isOwner = req.user && ownerId && ownerId === req.user._id.toString();

    if (property.propertyApprovedStatus !== "APPROVED" && !isAdmin && !isOwner) {
        res.status(403);
        throw new Error("This property is pending approval and is not yet public.");
    }

    res.json(property);
});

// 8. Get Properties for Compare
export const getPropertiesForCompare = asyncHandler(async (req, res) => {
    const { ids } = req.query;
    if (!ids) {
        return res.status(400).json({ message: "No IDs provided for comparison" });
    }

    const idArray = ids.split(",").map(id => id.trim()).filter(id => id !== "");
    if (idArray.length === 0) {
        return res.json([]);
    }

    const properties = await Property.find({ _id: { $in: idArray } });

    const normalized = properties.map(p => {
        let title = p.residential?.propertyTitle || p.location?.projectName || p.title || p.name || "Property " + p._id;

        let expectedPrice = p.pricing?.expectedPrice;
        let startingPrice = p.pricing?.startingPrice;

        let price = (p.listingType === "COMMERCIAL" || !!p.commercial)
            ? (expectedPrice || p.pricing?.expectedRent)
            : startingPrice;

        if (!price && p.listingType === "RENT" && (p.listingType === "COMMERCIAL" || !!p.commercial)) {
            price = p.pricing?.monthlyRent;
        }

        let resArea = p.residential?.carpetArea;
        let comArea = p.commercial?.carpetArea;
        let area = resArea || comArea;

        let type = p.residential?.propertyType || p.commercial?.propertyCategory;

        let amenities = [];
        if (p.residential?.amenities) amenities = p.residential.amenities;
        else if (p.amenities) amenities = p.amenities;

        return {
            id: p._id,
            title,
            city: p.location?.city || "",
            price: price || 0,
            area: area || 0,
            type: type || "Unknown",
            bhk: p.residential?.bhkType || "",
            amenities,
            possessionStatus: p.residential?.possessionStatus || "",
            image: p.media?.photos?.[0] || p.image || "/images/building.png"
        };
    });

    res.json(normalized);
});

// 9. Get Property Count by City
export const getCityPropertyCounts = asyncHandler(async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    status: { $in: ["LIVE", "PUBLISHED"] },
                    propertyApprovedStatus: "APPROVED",
                    "location.district": { $exists: true, $type: "string", $ne: "" }
                }
            },
            {
                $group: {
                    _id: "$location.district",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    district: "$_id",
                    count: 1
                }
            }
        ];

        const results = await Property.aggregate(pipeline);

        const formattedResults = results
            .filter(item => !!item.district)
            .map(item => ({
                district: item.district.charAt(0).toUpperCase() + item.district.slice(1),
                count: item.count
            }));

        res.json(formattedResults);
    } catch (error) {
        console.error("Error in getCityPropertyCounts aggregate:", error);
        res.status(500).json({ message: error.message || "Error fetching city counts" });
    }
});
// 10. Get Platform Stats for Landing Page
export const getPlatformStats = asyncHandler(async (req, res) => {
    try {
        const stats = await Property.aggregate([
            {
                $match: {
                    status: { $in: ["LIVE", "PUBLISHED"] },
                    propertyApprovedStatus: "APPROVED"
                }
            },
            {
                $facet: {
                    totalProperties: [{ $count: "count" }],
                    soldProperties: [
                        { $match: { status: "SOLD" } },
                        { $count: "count" }
                    ],
                    totalUnits: [
                        { $group: { _id: null, sum: { $sum: "$pricing.availableUnits" } } }
                    ],
                    totalArea: [
                        {
                            $group: {
                                _id: null,
                                sum: {
                                    $sum: {
                                        $add: [
                                            { $toDouble: { $ifNull: ["$residential.carpetArea", 0] } },
                                            { $toDouble: { $ifNull: ["$commercial.carpetArea", 0] } }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const data = stats[0] || {};
        res.json({
            totalConstruction: data.totalProperties?.[0]?.count || 0,
            apartioRooms: data.totalUnits?.[0]?.sum || 0,
            apartmentsSold: data.soldProperties?.[0]?.count || 0,
            totalArea: data.totalArea?.[0]?.sum || 0
        });
    } catch (error) {
        console.error("Error in getPlatformStats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 11. Get Listed Localities
export const getListedLocalities = asyncHandler(async (req, res) => {
    try {
        const { state, city } = req.query;
        const filter = {
            status: { $in: ["LIVE", "PUBLISHED"] },
            propertyApprovedStatus: "APPROVED"
        };
        
        if (state) filter["location.state"] = new RegExp(`^${state}$`, "i");
        if (city) {
            filter.$or = [
                { "location.city": new RegExp(`^${city}$`, "i") },
                { "location.district": new RegExp(`^${city}$`, "i") }
            ];
        }

        const localities = await Property.distinct("location.locality", filter);
        const filtered = localities.filter(l => l && l.trim().length > 0).sort();
        res.json(filtered);
    } catch (error) {
        console.error("Error in getListedLocalities:", error);
        res.status(500).json({ message: "Error fetching localities" });
    }
});

