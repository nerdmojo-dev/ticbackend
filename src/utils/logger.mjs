import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createLogger, format, transports } from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root logs directory
const LOG_ROOT = path.join(__dirname, "..", "logs");

// Folder name based on startup time
const startupTime = new Date()
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\..+/, "")
    .replace("T", "_");

const LOG_DIR = path.join(LOG_ROOT, startupTime);

// Create directory recursively
fs.mkdirSync(LOG_DIR, { recursive: true });

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

const fileFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} ${level.toUpperCase()}: ${stack || message}`;
    })
);

const logger = createLogger({
    level: "info",
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new transports.File({
            filename: path.join(LOG_DIR, "combined.log"),
            format: fileFormat,
        }),
        new transports.File({
            filename: path.join(LOG_DIR, "error.log"),
            level: "error",
            format: fileFormat,
        }),
    ],
});

export default logger;