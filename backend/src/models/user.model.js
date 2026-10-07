import mongoose from "mongoose";

const { Schema } = mongoose;

const UserRole = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    SELLER: "SELLER",
    BUYER: "BUYER",
    BROKER: "BROKER",
    BUILDER: "BUILDER",
};

const UserStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    ACTIVE: "ACTIVE",
    REJECTED: "REJECTED",
    BLOCKED: "BLOCKED",
};

const MembershipType = {
    FREE: "FREE",
    PAID: "PAID",
};

const UserSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[5-9]\d{9}$/.test(v);
                },
                message: props => `${props.value} is not a valid 10-digit mobile number starting with 5-9!`
            }
        },

        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
        },

        location: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(UserStatus),
            default: UserStatus.APPROVED,
            index: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: true,
        },
        membershipType: {
            type: String,
            enum: Object.values(MembershipType),
            default: MembershipType.FREE,
        },

        isTrusted: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            select: false,
        },
        auditedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", UserSchema);

export { User, UserRole, UserStatus };