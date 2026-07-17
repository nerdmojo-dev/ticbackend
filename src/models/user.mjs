import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },
        employeeId: {
            type: String,
            unique: true,
            trim: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true
        },

        designation: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        location: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },

        role: {
            type: String,
            default: "USER",
            enum: [
                "ADMIN",
                "SUPERVISOR",
                "USER"
            ]
        },

        gender: {
            type: String,
            default: "MALE",
            enum: [
                "MALE",
                "FEMALE",
                "OTHER"
            ]
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLogin: {
            type: Date
        },

        loginAttempts: {
            type: Number,
            default: 0,
            select: false
        },
        isFirstLogin: {
            type: Boolean,
            default: true
        },

        accountLocked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: "__v"
    }
);

export default mongoose.model("User", userSchema);