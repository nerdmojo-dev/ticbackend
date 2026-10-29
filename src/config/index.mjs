import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
// Make the backend's .env authoritative instead of inheriting stale shell values.
const result = dotenv.config({ path: envPath, override: true, quiet: true });
if (result.error && result.error.code !== 'ENOENT') {
    throw new Error('Unable to load backend .env configuration');
}

const required = ['DB_URL', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid integer between 1 and 65535');
}

export default {
    port,
    dbUrl: process.env.DB_URL,
    jwtSecret: process.env.JWT_SECRET,
    dbName: process.env.MONGO_DB_NAME || 'ticbackend',
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        username: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD
    },
    adminEmail: process.env.ADMIN_EMAIL
}
