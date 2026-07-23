import jwt from "jsonwebtoken";
import ApplicationResponse from "../../utils/ApplicationResponse.mjs";
import { dbLog, serverLog } from "../../utils/logHelper.mjs";
import express from "express";
import authMiddleware from "../../middleware/authMiddleware.mjs";
import Task from "../../models/task.mjs";

const router = express.Router();

router.post("/addtask", authMiddleware, async (req, res, next) => {
    try {
        const { title, description, assignedTo, dueDate } = req.body;

        // Validate required fields
        if (!title || !description || !assignedTo || !dueDate) {
            return res.status(400).json(ApplicationResponse.error("All fields are required"));
        }
        const startOfDay = new Date(dueDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dueDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await Task.findOne({
            createdBy: req.user._id,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });


        if (existing != null) return res.status(400).json(ApplicationResponse.error("Already submitted todays status"));

        // Create a new task
        const newTask = new Task({
            title,
            description,
            assignedTo,
            status:"Completed",
            dueDate,
            createdBy: req.user._id,
        });

        await newTask.save();

        res.status(201).json(ApplicationResponse.success(newTask, "Task created successfully."));
    } catch (error) {
        serverLog("Error creating task:", error);
        next(error);
    }
});


router.get("/getAssignedTasks", authMiddleware, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const offset = parseInt(req.query.offset) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const filter = {};

        if (req.user.role !== "ADMIN") {
            filter.createdBy = req.user._id;
        }

        if (startDate || endDate) {
            filter.dueDate = {};

            if (startDate) {
                filter.dueDate.$gte = new Date(startDate);
            }

            if (endDate) {
                filter.dueDate.$lte = new Date(endDate);
            }
        }
        const skip = (page - 1) * offset;

        const tasks = await Task.find(filter)
            .populate("createdBy")
            .sort({ dueDate: -1 }) // Latest due date first
            .skip(skip)
            .limit(offset);
        const countOfDocuments=await Task.countDocuments(filter);

        res.json(ApplicationResponse.success({
            page,
            offset,
            countOfDocuments,
            totalPages: Math.ceil(countOfDocuments / offset),
            tasks
        }, "Tasks fetched successfully"));

    } catch (error) {
        serverLog("Error fetching assigned tasks:", error);
        next(error);
    }
});


router.post("/addComment", authMiddleware, async (req, res, next) => {
    try {
        const { taskId, message } = req.body;

        // Validate required fields
        if (!taskId || !message) {
            return res.status(400).json(ApplicationResponse.error("Task ID and message are required."));
        }

        // Find the task and add the comment
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json(ApplicationResponse.error("Task not found."));
        }

        task.comments.push({
            user: req.user._id,
            message
        });

        await task.save();

        res.status(201).json(ApplicationResponse.success(task, "Comment added successfully."));
    } catch (error) {
        serverLog("Error adding comment:", error);
        next(error);
    }
});

export default router;