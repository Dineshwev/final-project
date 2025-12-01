// services/alertNotificationService.js - Send alert notifications via email, webhook, etc.
import nodemailer from "nodemailer";

class AlertNotificationService {
  constructor() {
    // Initialize email transporter (only if SMTP credentials are provided)
    this.transporter = null;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } catch (error) {
        console.error("Failed to create email transporter:", error);
      }
    }
  }

  /**
   * Send alert notifications based on settings
   */
  async sendNotifications(alerts, userId, userEmail, settings) {
    if (!alerts || alerts.length === 0) return;

    const results = {
      email: false,
      webhook: false,
      inApp: true, // Always available
    };

    // Group settings by notification channel
    const emailSettings =
      settings?.filter(
        (s) => s.notificationChannel === "email" && s.isEnabled
      ) || [];

    const webhookSettings =
      settings?.filter(
        (s) =>
          s.notificationChannel === "webhook" && s.isEnabled && s.webhookUrl
      ) || [];

    // Send email notifications
    if (emailSettings.length > 0 && userEmail) {
      try {
        await this.sendEmailNotification(alerts, userEmail);
        results.email = true;
      } catch (error) {
        console.error("Error sending email notification:", error);
      }
    }

    // Send webhook notifications
    if (webhookSettings.length > 0) {
      for (const setting of webhookSettings) {
        try {
          await this.sendWebhookNotification(alerts, setting.webhookUrl);
          results.webhook = true;
        } catch (error) {
          console.error("Error sending webhook notification:", error);
        }
      }
    }

    return results;
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(alerts, recipientEmail) {
    if (!this.transporter) {
      console.log(
        "Email transporter not configured - skipping email notification"
      );
      return null;
    }

    const html = this.generateEmailHTML(alerts);
    const subject = this.generateEmailSubject(alerts);

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@seoanalyzer.com",
      to: recipientEmail,
      subject,
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate email subject
   */
  generateEmailSubject(alerts) {
    const criticalCount = alerts.filter(
      (a) => a.severity === "critical"
    ).length;
    const warningCount = alerts.filter((a) => a.severity === "warning").length;

    if (criticalCount > 0) {
      return `🚨 ${criticalCount} Critical SEO Alert${
        criticalCount > 1 ? "s" : ""
      } Detected`;
    } else if (warningCount > 0) {
      return `⚠️ ${warningCount} SEO Warning${
        warningCount > 1 ? "s" : ""
      } Detected`;
    } else {
      return `ℹ️ ${alerts.length} SEO Change${
        alerts.length > 1 ? "s" : ""
      } Detected`;
    }
  }

  /**
   * Generate HTML email template
   */
  generateEmailHTML(alerts) {
    const criticalAlerts = alerts.filter((a) => a.severity === "critical");
    const warningAlerts = alerts.filter((a) => a.severity === "warning");
    const infoAlerts = alerts.filter((a) => a.severity === "info");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Alert Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 {
      color: #1e293b;
      margin: 0;
      font-size: 28px;
    }
    .summary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .summary-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 15px;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      display: block;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
    }
    .alert-section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alert-item {
      background: #f8fafc;
      border-left: 4px solid #cbd5e1;
      padding: 15px;
      margin-bottom: 12px;
      border-radius: 6px;
    }
    .alert-item.critical {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .alert-item.warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .alert-item.info {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }
    .alert-type {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 5px;
    }
    .alert-url {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 8px;
      word-break: break-all;
    }
    .alert-description {
      color: #475569;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .alert-changes {
      background: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    .change-row {
      margin: 5px 0;
    }
    .change-label {
      font-weight: 600;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
    }
    .change-value {
      color: #1e293b;
      margin-top: 2px;
    }
    .old-value {
      text-decoration: line-through;
      color: #ef4444;
    }
    .new-value {
      color: #10b981;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 25px;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 SEO Alert Report</h1>
      <p style="color: #64748b; margin: 10px 0 0 0;">
        ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>

    <div class="summary">
      <h2>Alert Summary</h2>
      <p>We've detected ${alerts.length} change${
      alerts.length > 1 ? "s" : ""
    } that require your attention.</p>
      <div class="summary-stats">
        <div class="stat">
          <span class="stat-number">${criticalAlerts.length}</span>
          <span class="stat-label">Critical</span>
        </div>
        <div class="stat">
          <span class="stat-number">${warningAlerts.length}</span>
          <span class="stat-label">Warnings</span>
        </div>
        <div class="stat">
          <span class="stat-number">${infoAlerts.length}</span>
          <span class="stat-label">Info</span>
        </div>
      </div>
    </div>

    ${
      criticalAlerts.length > 0
        ? `
    <div class="alert-section">
      <div class="section-title">
        <span>🚨</span>
        <span>Critical Issues</span>
      </div>
      ${criticalAlerts.map((alert) => this.generateAlertHTML(alert)).join("")}
    </div>
    `
        : ""
    }

    ${
      warningAlerts.length > 0
        ? `
    <div class="alert-section">
      <div class="section-title">
        <span>⚠️</span>
        <span>Warnings</span>
      </div>
      ${warningAlerts.map((alert) => this.generateAlertHTML(alert)).join("")}
    </div>
    `
        : ""
    }

    ${
      infoAlerts.length > 0
        ? `
    <div class="alert-section">
      <div class="section-title">
        <span>ℹ️</span>
        <span>Information</span>
      </div>
      ${infoAlerts.map((alert) => this.generateAlertHTML(alert)).join("")}
    </div>
    `
        : ""
    }

    <div style="text-align: center;">
      <a href="${
        process.env.APP_URL || "http://localhost:3000"
      }/alerts" class="cta-button">
        View Detailed Report
      </a>
    </div>

    <div class="footer">
      <p>
        This is an automated alert from your SEO Analyzer dashboard.<br>
        <a href="${
          process.env.APP_URL || "http://localhost:3000"
        }/alerts/settings" style="color: #667eea;">
          Manage Alert Settings
        </a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for individual alert
   */
  generateAlertHTML(alert) {
    const alertTypeLabels = {
      title_change: "Title Tag Changed",
      meta_change: "Meta Description Changed",
      content_change: "Content Modified",
      status_change: "HTTP Status Changed",
      broken_link: "Broken Links Detected",
      new_page: "New Page Discovered",
      removed_page: "Page Removed",
      performance_degradation: "Performance Issue",
      heading_change: "Heading Structure Changed",
      link_change: "Link Structure Changed",
    };

    return `
      <div class="alert-item ${alert.severity}">
        <div class="alert-type">${
          alertTypeLabels[alert.alertType] || alert.alertType
        }</div>
        <div class="alert-url">📄 ${alert.pageUrl}</div>
        <div class="alert-description">${alert.changeDescription}</div>
        ${
          alert.oldValue || alert.newValue
            ? `
          <div class="alert-changes">
            ${
              alert.oldValue
                ? `
              <div class="change-row">
                <div class="change-label">Previous:</div>
                <div class="change-value old-value">${this.escapeHtml(
                  alert.oldValue
                )}</div>
              </div>
            `
                : ""
            }
            ${
              alert.newValue
                ? `
              <div class="change-row">
                <div class="change-label">Current:</div>
                <div class="change-value new-value">${this.escapeHtml(
                  alert.newValue
                )}</div>
              </div>
            `
                : ""
            }
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  /**
   * Send webhook notification
   */
  async sendWebhookNotification(alerts, webhookUrl) {
    const payload = {
      timestamp: new Date().toISOString(),
      alertCount: alerts.length,
      alerts: alerts.map((alert) => ({
        type: alert.alertType,
        severity: alert.severity,
        pageUrl: alert.pageUrl,
        description: alert.changeDescription,
        oldValue: alert.oldValue,
        newValue: alert.newValue,
        metadata: alert.metadata,
      })),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Webhook failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return "";
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]).substring(0, 200);
  }

  /**
   * Send daily digest
   */
  async sendDailyDigest(userId, userEmail, alerts) {
    // Group alerts by project
    const groupedAlerts = alerts.reduce((acc, alert) => {
      if (!acc[alert.projectName]) {
        acc[alert.projectName] = [];
      }
      acc[alert.projectName].push(alert);
      return acc;
    }, {});

    // Send email with grouped alerts
    const html = this.generateDigestEmailHTML(groupedAlerts);

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@seoanalyzer.com",
      to: userEmail,
      subject: `📊 Daily SEO Digest - ${alerts.length} Updates`,
      html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate digest email HTML
   */
  generateDigestEmailHTML(groupedAlerts) {
    // Similar to regular email but grouped by project
    // Implementation similar to generateEmailHTML but with project grouping
    return this.generateEmailHTML(Object.values(groupedAlerts).flat());
  }
}

export default new AlertNotificationService();
