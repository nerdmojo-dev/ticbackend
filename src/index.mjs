
import express from "express";
import config from './config/index.mjs';
import connectDB from './utils/dbConn.mjs';
import morganLogger from './middleware/morganLogger.mjs';
import routes from './route/index.mjs';
import { appLog, dbLog } from './utils/logHelper.mjs';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganLogger); // Use the morgan logger middleware

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
routes(app);


const server = app.listen(config.port, () => {
    appLog(`Server is running on port ${config.port} (${process.env.NODE_ENV || 'development'})`);
    dbLog('Connecting to MongoDB...');

    connectDB().catch((error) => {
        const cause = error?.cause || error;
        const details = [cause.syscall, cause.code || error.code].filter(Boolean).join(' ');
        console.error(`Startup failed: MongoDB connection could not be established${details ? ` (${details})` : ''}. Check Atlas DNS/network access and DB_URL.`);
        server.close(() => process.exit(1));
    });
});

const shutdown = () => {
    server.close(async () => {
        const mongoose = (await import('mongoose')).default;
        await mongoose.disconnect();
        process.exit(0);
    });
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
