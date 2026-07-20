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
        const existing = await Task.findOne({
            dueDate,
            createdBy: req.user._id
        });

        if (existing != null) return res.status(400).json(ApplicationResponse.error("Already submitted todays status"));

        // Create a new task
        const newTask = new Task({
            title,
            description,
            assignedTo,
            dueDate,
            createdBy: req.user._id // Assuming you have user authentication and req.user is available
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

        const skip = (page - 1) * offset;

        const tasks = await Task.find({
            assignedTo: req.user._id
        })
            .sort({ dueDate: 1 }) // ascending due date (earliest first)
            .skip(skip)
            .limit(offset);

        const totalTasks = await Task.countDocuments({
            assignedTo: req.user._id
        });

        res.json(ApplicationResponse.success({
            page,
            offset,
            totalTasks,
            totalPages: Math.ceil(totalTasks / offset),
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