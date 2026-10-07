import express from "express";
import { getFeaturedProperties } from "../controllers/featureProperty.controller.js";

const router = express.Router();

router.get("/featured-properties", getFeaturedProperties);

export default router;
