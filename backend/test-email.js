import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("Testing email configuration...");
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_FROM:", process.env.SMTP_FROM);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true,
  logger: true,
});

console.log("\n--- Testing SMTP Connection ---");
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Failed:", error);
  } else {
    console.log("SMTP Connection Successful!");
    console.log("\n--- Sending Test Email ---");

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: "contact@healthyseo.tech",
      subject: "Test Email from SEO Health Analyzer",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email sent at ${new Date().toLocaleString()}</p>
        <p>If you receive this, your email configuration is working correctly!</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Failed to send test email:", err);
      } else {
        console.log("Test email sent successfully!");
        console.log("Message ID:", info.messageId);
        console.log("Response:", info.response);
      }
      process.exit(err ? 1 : 0);
    });
  }
});
