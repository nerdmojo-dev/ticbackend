import jwt from "jsonwebtoken";
import User from "../../models/user.mjs";
import ApplicationResponse from "../../utils/ApplicationResponse.mjs";
import { dbLog, serverLog } from "../../utils/logHelper.mjs";
import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import EmailService from "../../utils/emailService.mjs";
import config from "../../config/index.mjs";
import xlsx from "xlsx";
import bcrypt from "bcryptjs";
import authMiddleware from "../../middleware/authMiddleware.mjs";

const router = express.Router();
const upload = multer({
    dest: "uploads/"
});

router.post("/registerUser", upload.single("csvFile"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                throw new Error("CSV file is required.");
            }
            console.log(req.file.originalname);
            console.log(req.file.path);
            console.log(req.file.mimetype);
            console.log(req.file.size);
            if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || req.file.mimetype === "application/vnd.ms-excel") {


                const workbook = xlsx.readFile(req.file.path);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(worksheet, {
                    header: 1,
                    blankrows: false
                });
                data.shift(); // Remove the last empty row
                // console.log(data);

                try {
                    const usersToInsert = [];
                    const skipped = [];

                    for (const row of data) {

                        const username = row[2]?.trim()
                            .replace(/\s+/g, " ") // Replace multiple spaces with one
                            .split(" ")
                            .join(".")
                            .toLowerCase();
                        const fullName = row[2]?.trim()
                            .replace(/\s+/g, " ") // Replace multiple spaces with one
                            .split(" ")
                            .join(" ");
                        const employeeId = row[1]?.trim().toLowerCase();
                        const password = bcrypt.hashSync(`${employeeId}#${username.toLowerCase()}`, 10); // Set a default password or generate one

                        const dataToInsert = {
                            fullName: fullName,
                            employeeId: employeeId,
                            role: row.role || "USER",
                            isActive: true,
                            password: password,
                            gender: row[3]?.trim().toUpperCase() || "MALE",
                            department: row[4]?.trim() || "",
                        };
                        usersToInsert.push(dataToInsert);
                    }
                    console.log("Users to insert:", usersToInsert.length);
                    const result = await User.bulkWrite(
                        usersToInsert.map(user => ({
                            updateOne: {
                                filter: { employeeId: user.employeeId },
                                update: { $setOnInsert: user },
                                upsert: true,
                            },
                        }))
                    );

                    fs.unlinkSync(req.file.path);

                    res.json({
                        success: true,
                        totalRecords: data.length,
                        inserted: result.upsertedCount,
                        skipped: result.matchedCount,
                    });

                } catch (err) {
                    fs.unlinkSync(req.file.path);
                    next(err);
                }
            }
            else {
                throw new Error("Invalid file type. Only CSV and Excel files are allowed.");
            }


        } catch (err) {
            next(err);
        }
    });


router.post("/loginUser",
    async (req, res, next) => {
        try {
            const { employeeId, password } = req.body;
            console.log("Login attempt for employeeId:", employeeId);

            const user = await User.findOne({ employeeId }).select("+password +loginAttempts +accountLocked");

            if (!user) {
                return res.status(402).json(
                    ApplicationResponse.error(
                        "Invalid userId"
                    )
                );
            }

            // Assuming you have a method to compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                user.loginAttempts += 1;
                if (user.loginAttempts >= 5) {
                    user.accountLocked = true;
                }
                await user.save();

                return res.status(402).json(
                    ApplicationResponse.error(
                        "Invalid password."
                    )
                );
            }

            if (user.accountLocked) {
                return res.status(403).json(
                    ApplicationResponse.error(
                        "Account is locked due to multiple failed login attempts."
                    )
                );
            }

            // Reset login attempts on successful login
            user.loginAttempts = 0;
            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { id: user._id, role: user.role, employeeId: user.employeeId, },
                config.jwtSecret,
                { expiresIn: "1h" }
            );

            const refreshToken = jwt.sign(
                { id: user._id, isRefreshToken: true },
                config.jwtSecret,
                { expiresIn: "7d" }
            );


            const existing = await Task.findOne({
                dueDate,
                createdBy: req.user._id
            });

            res.json(
                ApplicationResponse.success(
                    {
                        token,
                        refreshToken,
                        user: {
                            ...user,
                            alreadyExistingTask: existing != null
                        }
                    },
                    "Login successful."
                )
            );



        } catch (err) {
            next(err);
        }
    });



router.post("/changePassword", authMiddleware,
    async (req, res, next) => {
        try {


            const { oldPassword, newPassword } = req.body;

            const user = await User.findById(req.user._id).select("+password");

            if (!user) {
                return res.status(404).json(
                    ApplicationResponse.error(
                        "User not found."
                    )
                );
            }

            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

            if (!isOldPasswordValid) {
                return res.status(400).json(
                    ApplicationResponse.error(
                        "Old password is incorrect."
                    )
                );
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.isFirstLogin = false;
            await user.save();

            res.json(
                ApplicationResponse.success(
                    null,
                    "Password changed successfully."
                )
            );


        } catch (err) {
            next(err);
        }
    });




router.get("/getAccessToken", authMiddleware, async (req, res, next) => {
    const token = jwt.sign(
        { id: req.user._id, role: req.user.role, employeeId: req.user.employeeId, },
        config.jwtSecret,
        { expiresIn: "1h" }
    );

    res.json(
        ApplicationResponse.success(
            {
                token
            },
            "Token refreshed successfully."
        )
    );

});

export default router;