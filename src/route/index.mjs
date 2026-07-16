import healthCheck from "./health.mjs";
import userAuth from "./user/index.mjs";
import ApplicationResponse from "../utils/ApplicationResponse.mjs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app) => {
    app.get("/api/v1/health", healthCheck);

    app.use("/api/v1/auth", userAuth);

    app.get("/fileUpload", (req, res) => {
        res.sendFile(path.join(path.resolve(__dirname,".."), "public", "fileUpload.html"));
    });

    app.use((req, res, next) => {
        res.status(404).json(ApplicationResponse.error("Route not found"));
    });
}