import express from "express";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Configure nodemailer transporter using SMTP settings from .env
const createTransporter = () => {
  console.log("Creating transporter with:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER ? "configured" : "missing",
    pass: process.env.SMTP_PASS ? "configured" : "missing",
    from: process.env.SMTP_FROM,
  });

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // Use TLS (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // For development, accept self-signed certs
    },
    debug: true, // Enable debug logs
    logger: true, // Enable logger
  });
};

/**
 * POST /api/contact
 * Submit contact form and send email
 */
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, email, subject, message } = req.body;

      // Create transporter
      const transporter = createTransporter();

      // Email to admin (you receive the message)
      const adminMailOptions = {
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_EMAIL || "contact@healthyseo.tech", // Your contact email
        replyTo: email, // User's email for easy reply
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;">
                <strong style="color: #4f46e5;">Name:</strong> ${name}
              </p>
              <p style="margin: 10px 0;">
                <strong style="color: #4f46e5;">Email:</strong> 
                <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
              </p>
              <p style="margin: 10px 0;">
                <strong style="color: #4f46e5;">Subject:</strong> ${subject}
              </p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Message:</h3>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>This message was sent from the SEO Health Analyzer contact form.</p>
              <p>Received at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      };

      // Email to user (confirmation)
      const userMailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: "We received your message - SEO Health Analyzer",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <p style="color: #333; font-size: 16px;">Hi ${name},</p>
              
              <p style="color: #666; line-height: 1.6;">
                Thank you for reaching out to us. We have received your message and will get back to you within 1-2 business days.
              </p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Your Message Details:</h3>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Subject:</strong> ${subject}
                </p>
                <p style="margin: 10px 0; color: #666;">
                  <strong>Message:</strong><br>
                  ${message.replace(/\n/g, "<br>")}
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                If you have any urgent concerns, please feel free to reply to this email or call us at +1 (555) 123-4567.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #666; margin: 5px 0;">Best regards,</p>
                <p style="color: #4f46e5; font-weight: bold; margin: 5px 0;">SEO Health Analyzer Team</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  <a href="mailto:contact@healthyseo.tech" style="color: #4f46e5; text-decoration: none;">contact@healthyseo.tech</a> | 
                  <a href="${
                    process.env.APP_URL || "http://localhost:5173"
                  }" style="color: #4f46e5; text-decoration: none;">Visit our website</a>
                </p>
              </div>
            </div>
          </div>
        `,
      };

      // Send both emails
      console.log("Sending admin email to:", adminMailOptions.to);
      const adminResult = await transporter.sendMail(adminMailOptions);
      console.log("Admin email sent:", adminResult.messageId);

      console.log("Sending user email to:", userMailOptions.to);
      const userResult = await transporter.sendMail(userMailOptions);
      console.log("User email sent:", userResult.messageId);

      res.json({
        success: true,
        message:
          "Your message has been sent successfully. We'll get back to you soon!",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
      res.status(500).json({
        success: false,
        message:
          "Failed to send message. Please try again later or contact us directly at contact@healthyseo.tech",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * GET /api/contact/test
 * Test email configuration
 */
router.get("/test", async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    res.json({
      success: true,
      message: "SMTP configuration is valid and ready to send emails",
    });
  } catch (error) {
    console.error("SMTP test failed:", error);
    res.status(500).json({
      success: false,
      message: "SMTP configuration test failed",
      error: error.message,
    });
  }
});

export default router;
