import express from "express";
import multer from "multer";
import {
    createProperty,
    uploadPropertyFiles,
    getProperties,
    getMyProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertiesForCompare,
    getCityPropertyCounts,
    getPlatformStats,
    getListedLocalities
} from "../propertyController.js";
import { protect, authorize, optionalProtect } from "../../../middleware/authMiddleware.js";
import { UserRole } from "../../../models/user.model.js";

const router = express.Router();

// Multer storage for memory (to pass to ImageKit)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ── Specific Protected Routes ──
router.get("/my", protect, getMyProperties);

// ── Public Routes ──
router.get("/city-counts", getCityPropertyCounts);
router.get("/stats", getPlatformStats);
router.get("/localities", getListedLocalities);
router.get("/compare", getPropertiesForCompare);
router.get("/", getProperties);
router.get("/:id", optionalProtect, getPropertyById);

// ── Protected Builder/Seller/Broker Creation/Management ──
router.use(protect);
router.use(authorize(UserRole.BUILDER, UserRole.SELLER, UserRole.BROKER));

router.post("/", createProperty);
router.post("/upload", upload.array("files", 10), uploadPropertyFiles);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

export default router;

