import nodemailer from "nodemailer";
import config from "../config/index.mjs";

class EmailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: false,
            auth: {
                user: config.smtp.username,
                pass: config.smtp.password
            },
            requireTLS: true               // Enforce TLS as the security protocol

        });
    }

    async sendOtp(email, otp) {
        console.log(`Sending OTP ${otp} to ${email}:"Nerdy Dev" <${config.smtp.username}>`);
        await this.transporter.sendMail({
            from: `"Nerdy Dev" <${config.smtp.username}>`,
            to: email,
            subject: "OTP Verification",
            html: `
                <h2>OTP Verification</h2>

                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP is valid for 5 minutes.</p>
            `
        });

    }

}

export default new EmailService();