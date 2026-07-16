import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    dbUrl: process.env.DB_URL || 'mongodb://localhost:27017/ticbackend',
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