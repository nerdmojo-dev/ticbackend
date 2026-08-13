import healthCheck from "./health.mjs";
import userAuth from "./user/index.mjs";
import taskRoutes from "./tasks/index.js";
import ApplicationResponse from "../utils/ApplicationResponse.mjs";
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from "../errorHandler/index.mjs";
import sendMail from "../cronJob/emailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app) => {

    // app.use(responseLogger);

    app.get("/api/v1/health", healthCheck);

    app.use("/api/v1/auth", userAuth);
    app.use("/api/v1/tasks", taskRoutes);
    app.get("/api/v1/emailer", (req, res, next) => {
        sendMail();
        return res.status(200).json({ "message": "email sent" });
    });


    app.get("/admin/login", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "admin-login.html"));
    });

    app.get("/admin/home", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "admin-home.html"));
    });

    app.get("/admin/empUpload", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "file-upload.html"));
    });

    app.get("/appDownload", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "app-download.html"));
    });


    app.get("/api/download/app", (req, res) => {
        const filePath = path.join(
            __dirname,"../..",
            "src",
            "public",
            "app-release.apk"
        );

        res.download(filePath, "TicInsight.apk", (err) => {
            if (err) {
                console.error(err);
                if (!res.headersSent) {
                    res.status(404).json({
                        success: false,
                        message: "APK not found"
                    });
                }
            }
        });
    });

    app.get("/admin/userList", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "public", "admin-userlist.html"));
    });

    app.use((req, res, next) => {
        res.status(404).json(ApplicationResponse.error("Route not found"));
    });


    app.use(errorHandler);
}