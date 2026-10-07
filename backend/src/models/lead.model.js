import mongoose from "mongoose";

const { Schema } = mongoose;
//this comment just for test push
const LeadSchema = new Schema(
    {
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        buyerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false, // Optional for guest inquiries if any
            index: true,
        },
        buyerName: {
            type: String,
            required: true,
            trim: true,
        },
        buyerMobile: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["New", "Contacted", "Interested", "Not Interested"],
            default: "New",
        },
    },
    {
        timestamps: true,
    }
);

const Lead = mongoose.model("Lead", LeadSchema);

export default Lead;
