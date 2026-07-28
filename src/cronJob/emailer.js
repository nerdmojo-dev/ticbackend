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
        dueDate: {
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
        { header: "Status Filed By", key: "createdBy", width: 30 },
        { header: "Employee Id", key: "empId", width: 30 },
        { header: "Status", key: "status", width: 20 },
        { header: "Due Date", key: "dueDate", width: 25 }
    ];

    tasks.forEach(task => {
        sheet.addRow({
            id: task._id.toString(),
            title: task.title,
            description: task.description,
            createdBy: task.createdBy?.fullName ?? "",
            empId: task.createdBy?.employeeId ?? "",
            status: task.status,
            dueDate: task.dueDate.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
            }),
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
            to: process.env.TO_EMAIL.split(",").map(email => email.trim()),
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
        if(report) await fs.unlink(report);
    }
}

export default sendMail;
