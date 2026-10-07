import mongoose from 'mongoose';
import { Property } from '../src/models/property.model.js';

async function check() {
    console.log("Top-level PropertyCategory Enum:", Property.schema.path('propertyCategory')?.options.enum);
    console.log("Commercial PropertyCategory Enum:", Property.schema.path('commercial.propertyCategory')?.options.enum);
    process.exit(0);
}

check();
