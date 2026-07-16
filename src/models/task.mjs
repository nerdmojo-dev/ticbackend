import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "Todo",
                "In Progress",
                "Completed",
                "Cancelled"
            ],
            default: "Todo",
        },

        priority: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "Urgent"
            ],
            default: "Medium",
        },

        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        dueDate: {
            type: Date,
        },

        completedAt: {
            type: Date,
        },

        tags: [
            {
                type: String,
                trim: true,
            }
        ],

        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                message: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            }
        ],

        isDeleted: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Task", taskSchema);