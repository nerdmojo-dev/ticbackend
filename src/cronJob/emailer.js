import nodemailer from 'nodemailer';
import cron from 'node-cron';
import dotenv from 'dotenv';
import connectDB from '../utils/dbConn.mjs';
dotenv.config();
import path from 'node:path'
import Task from '../models/task.mjs';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});



import ExcelJS from 'exceljs';
async function generateTodaysTaskReport() {
    connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
        createdDate: {
            $gte: start,
            $lte: end,
        },
    })
        .populate("createdBy");






    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Today's Tasks");

    sheet.columns = [
        { header: "Task ID", key: "id", width: 30 },
        { header: "Title", key: "title", width: 40 },
        { header: "Description", key: "description", width: 60 },
        { header: "Assigned To", key: "assignedTo", width: 30 },
        { header: "Status", key: "status", width: 20 },
        { header: "Due Date", key: "dueDate", width: 25 },
        { header: "Created Date", key: "createdDate", width: 25 },
    ];

    tasks.forEach(task => {
        sheet.addRow({
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo?.fullName ?? "",
            status: task.status,
            dueDate: task.dueDate,
            createdDate: task.createdDate,
        });
    });

    const reportsDir = path.join(__dirname, "reports");

    // Create directory if it doesn't exist
    await fs.mkdir(reportsDir, { recursive: true });

    const filePath = path.join(
        reportsDir,
        `tasks-${Date.now()}.xlsx`
    );

    await workbook.xlsx.writeFile(filePath);

    return filePath;
}



console.log(process.env);

async function sendMail() {
    const report = await generateTodaysTaskReport();

    try {

        const info = await transporter.sendMail({
            from: '"Automation" <noreply@ticbackendautomation.in>',
            to: process.env.TO_EMAIL,
            subject: `Today's Task Report`,

            html: `
                <h2>Today's Task Report</h2>
                <p>The Excel report is attached.</p>
            `,

            attachments: [
                {
                    filename: "TodaysTaskReport.xlsx",
                    path: report,
                },
            ],
        });

        console.log("Mail sent:", info.messageId);
    } catch (err) {
        console.error("Failed to send mail:", err);
    } finally {
        await fs.unlink(report);
        process.exit(1);
    }
}

// Every day at 9:00 AM
// cron.schedule("0 9 * * *", async () => {
//     console.log("Running scheduled mail...");
//     await sendMail();
// });

sendMail();

console.log("Auto mail service started.");