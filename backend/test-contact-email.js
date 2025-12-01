import pkg from "nodemailer";
const nodemailerCreateTransport = pkg.createTransport;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("Testing email to contact@healthyseo.tech...\n");

const transporter = nodemailerCreateTransport({
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

const mailOptions = {
  from: process.env.SMTP_FROM,
  to: "contact@healthyseo.tech",
  subject: "Contact Form Test - " + new Date().toLocaleString(),
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Test Contact Form Submission</h2>
      <p><strong>Name:</strong> Test User</p>
      <p><strong>Email:</strong> test@example.com</p>
      <p><strong>Subject:</strong> Testing email delivery</p>
      <p><strong>Message:</strong> This is a test message to verify email delivery to contact@healthyseo.tech</p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">Sent at: ${new Date().toLocaleString()}</p>
    </div>
  `,
};

console.log("Attempting to send to:", mailOptions.to);
console.log("From:", mailOptions.from);

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error("\n❌ Failed to send email:");
    console.error("Error:", err.message);
    console.error("Code:", err.code);
    console.error("Response:", err.response);
    console.error("\n⚠️  Common Issues:");
    console.error(
      "1. The recipient email 'contact@healthyseo.tech' may not be verified in ZeptoMail"
    );
    console.error(
      "2. The domain 'healthyseo.tech' may need to be verified in your ZeptoMail account"
    );
    console.error(
      "3. Check ZeptoMail dashboard: https://www.zoho.com/zeptomail/"
    );
    console.error(
      "\n💡 Solution: Add contact@healthyseo.tech as a verified recipient in ZeptoMail dashboard"
    );
  } else {
    console.log("\n✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("\n📧 Check your inbox at: contact@healthyseo.tech");
    console.log("Also check spam/junk folder if not in inbox");
  }
  process.exit(err ? 1 : 0);
});
