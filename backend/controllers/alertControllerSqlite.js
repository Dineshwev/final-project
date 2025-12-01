// controllers/alertControllerSqlite.js - SQLite3-based alert controller
import db from "../db/init.js";

/**
 * Get all alerts for a user
 */
export const getAlerts = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      projectName,
      alertType,
      severity,
      isRead,
      limit = 50,
      offset = 0,
    } = req.query;

    // Build WHERE clause
    let whereConditions = ["user_id = ?"];
    let params = [userId];

    if (projectName) {
      whereConditions.push("project_name = ?");
      params.push(projectName);
    }
    if (alertType) {
      whereConditions.push("alert_type = ?");
      params.push(alertType);
    }
    if (severity) {
      whereConditions.push("severity = ?");
      params.push(severity);
    }
    if (isRead !== undefined) {
      whereConditions.push("is_read = ?");
      params.push(isRead === "true" ? 1 : 0);
    }

    const whereClause = whereConditions.join(" AND ");

    // Get alerts
    const query = `
      SELECT * FROM alerts 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, alerts) => {
      if (err) {
        console.error("Error fetching alerts:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch alerts",
          message: err.message,
        });
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM alerts WHERE ${whereClause}`;
      db.get(countQuery, params.slice(0, -2), (countErr, countResult) => {
        if (countErr) {
          console.error("Error counting alerts:", countErr);
          return res.status(500).json({
            success: false,
            error: "Failed to count alerts",
            message: countErr.message,
          });
        }

        const total = countResult.total;

        // Parse JSON fields
        const parsedAlerts = alerts.map((alert) => ({
          ...alert,
          isRead: alert.is_read === 1,
          metadata: alert.metadata ? JSON.parse(alert.metadata) : null,
        }));

        res.json({
          success: true,
          data: parsedAlerts,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: total > parseInt(offset) + parseInt(limit),
          },
        });
      });
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch alerts",
      message: error.message,
    });
  }
};

/**
 * Get alert by ID
 */
export const getAlertById = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { id } = req.params;

    const query = "SELECT * FROM alerts WHERE id = ? AND user_id = ?";

    db.get(query, [id, userId], (err, alert) => {
      if (err) {
        console.error("Error fetching alert:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch alert",
          message: err.message,
        });
      }

      if (!alert) {
        return res.status(404).json({
          success: false,
          error: "Alert not found",
        });
      }

      res.json({
        success: true,
        data: {
          ...alert,
          isRead: alert.is_read === 1,
          metadata: alert.metadata ? JSON.parse(alert.metadata) : null,
        },
      });
    });
  } catch (error) {
    console.error("Error fetching alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch alert",
      message: error.message,
    });
  }
};

/**
 * Mark alert as read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    const query =
      "UPDATE alerts SET is_read = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?";

    db.run(query, [id, userId], function (err) {
      if (err) {
        console.error("Error marking alert as read:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to mark alert as read",
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "Alert not found",
        });
      }

      res.json({
        success: true,
        message: "Alert marked as read",
      });
    });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark alert as read",
      message: error.message,
    });
  }
};

/**
 * Mark all alerts as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { projectName } = req.body;

    let query =
      "UPDATE alerts SET is_read = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0";
    let params = [userId];

    if (projectName) {
      query += " AND project_name = ?";
      params.push(projectName);
    }

    db.run(query, params, function (err) {
      if (err) {
        console.error("Error marking all alerts as read:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to mark alerts as read",
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: "All alerts marked as read",
        count: this.changes,
      });
    });
  } catch (error) {
    console.error("Error marking all alerts as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark alerts as read",
      message: error.message,
    });
  }
};

/**
 * Delete alert
 */
export const deleteAlert = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { id } = req.params;

    const query = "DELETE FROM alerts WHERE id = ? AND user_id = ?";

    db.run(query, [id, userId], function (err) {
      if (err) {
        console.error("Error deleting alert:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to delete alert",
          message: err.message,
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "Alert not found",
        });
      }

      res.json({
        success: true,
        message: "Alert deleted successfully",
      });
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete alert",
      message: error.message,
    });
  }
};

/**
 * Get unread alert count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { projectName } = req.query;

    let query =
      "SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND is_read = 0";
    let params = [userId];

    if (projectName) {
      query += " AND project_name = ?";
      params.push(projectName);
    }

    db.get(query, params, (err, result) => {
      if (err) {
        console.error("Error getting unread count:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to get unread count",
          message: err.message,
        });
      }

      res.json({
        success: true,
        count: result.count,
      });
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get unread count",
      message: error.message,
    });
  }
};

/**
 * Get alert settings for user
 */
export const getAlertSettings = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { projectName } = req.query;

    let query = "SELECT * FROM alert_settings WHERE user_id = ?";
    let params = [userId];

    if (projectName) {
      query += " AND (project_name = ? OR project_name IS NULL)";
      params.push(projectName);
    }

    db.all(query, params, (err, settings) => {
      if (err) {
        console.error("Error fetching alert settings:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch alert settings",
          message: err.message,
        });
      }

      // If no settings exist, return defaults
      if (settings.length === 0) {
        const defaultSettings = getDefaultAlertSettings();
        return res.json({
          success: true,
          data: defaultSettings,
          isDefault: true,
        });
      }

      // Parse JSON fields and map snake_case to camelCase
      const parsedSettings = settings.map((setting) => ({
        alertType: setting.alert_type,
        isEnabled: setting.is_enabled === 1,
        notificationChannel: setting.notification_channel,
        webhookUrl: setting.webhook_url,
        frequency: setting.frequency,
        thresholdSettings: setting.threshold_settings
          ? JSON.parse(setting.threshold_settings)
          : {},
        projectName: setting.project_name,
      }));

      res.json({
        success: true,
        data: parsedSettings,
      });
    });
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch alert settings",
      message: error.message,
    });
  }
};

/**
 * Update or create alert settings
 */
export const updateAlertSettings = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { settings } = req.body;

    console.log("Received settings update request:", {
      userId,
      settingsCount: settings?.length,
      firstSetting: settings?.[0],
    });

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        error: "Invalid settings format",
      });
    }

    const results = [];

    for (const setting of settings) {
      const {
        projectName,
        alertType,
        isEnabled,
        notificationChannel,
        webhookUrl,
        frequency,
        thresholdSettings,
      } = setting;

      // Validate alertType exists
      if (!alertType) {
        console.error("Missing alertType in setting:", setting);
        continue; // Skip this setting
      }

      // Try to update first
      const updateQuery = `
        UPDATE alert_settings 
        SET is_enabled = ?,
            notification_channel = ?,
            webhook_url = ?,
            frequency = ?,
            threshold_settings = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND alert_type = ? AND (project_name = ? OR (project_name IS NULL AND ? IS NULL))
      `;

      await new Promise((resolve, reject) => {
        db.run(
          updateQuery,
          [
            isEnabled ? 1 : 0,
            notificationChannel,
            webhookUrl,
            frequency,
            JSON.stringify(thresholdSettings || {}),
            userId,
            alertType,
            projectName || null,
            projectName || null,
          ],
          function (err) {
            if (err) return reject(err);

            // If no rows were updated, insert new record
            if (this.changes === 0) {
              const insertQuery = `
              INSERT INTO alert_settings (user_id, project_name, alert_type, is_enabled, notification_channel, webhook_url, frequency, threshold_settings)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

              db.run(
                insertQuery,
                [
                  userId,
                  projectName || null,
                  alertType,
                  isEnabled ? 1 : 0,
                  notificationChannel,
                  webhookUrl,
                  frequency,
                  JSON.stringify(thresholdSettings || {}),
                ],
                function (insertErr) {
                  if (insertErr) return reject(insertErr);
                  results.push({ id: this.lastID, alertType });
                  resolve();
                }
              );
            } else {
              results.push({ alertType });
              resolve();
            }
          }
        );
      });
    }

    res.json({
      success: true,
      message: "Alert settings updated successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error updating alert settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update alert settings",
      message: error.message,
    });
  }
};

/**
 * Get alert statistics
 */
export const getAlertStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { projectName, days = 30 } = req.query;

    let whereConditions = ["user_id = ?"];
    let params = [userId];

    if (projectName) {
      whereConditions.push("project_name = ?");
      params.push(projectName);
    }

    // Add date filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    whereConditions.push("created_at >= ?");
    params.push(startDate.toISOString());

    const whereClause = whereConditions.join(" AND ");

    // Get all alerts
    const query = `SELECT * FROM alerts WHERE ${whereClause}`;

    db.all(query, params, (err, alerts) => {
      if (err) {
        console.error("Error getting alert stats:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to get alert statistics",
          message: err.message,
        });
      }

      // Calculate statistics
      const stats = {
        total: alerts.length,
        unread: alerts.filter((a) => a.is_read === 0).length,
        bySeverity: {
          critical: alerts.filter((a) => a.severity === "critical").length,
          warning: alerts.filter((a) => a.severity === "warning").length,
          info: alerts.filter((a) => a.severity === "info").length,
        },
        byType: {},
        trend: [],
      };

      // Group by alert type
      alerts.forEach((alert) => {
        stats.byType[alert.alert_type] =
          (stats.byType[alert.alert_type] || 0) + 1;
      });

      // Calculate daily trend
      const dailyCounts = {};
      alerts.forEach((alert) => {
        const date = alert.created_at.split("T")[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      stats.trend = Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count,
      }));

      res.json({
        success: true,
        data: stats,
      });
    });
  } catch (error) {
    console.error("Error getting alert stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get alert statistics",
      message: error.message,
    });
  }
};

/**
 * Get default alert settings
 */
function getDefaultAlertSettings() {
  return [
    {
      alertType: "title_change",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: {},
    },
    {
      alertType: "meta_change",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: {},
    },
    {
      alertType: "content_change",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: { contentChangePercent: 10 },
    },
    {
      alertType: "status_change",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: {},
    },
    {
      alertType: "broken_link",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: {},
    },
    {
      alertType: "new_page",
      isEnabled: false,
      notificationChannel: "in_app",
      frequency: "daily",
      thresholdSettings: {},
    },
    {
      alertType: "removed_page",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: {},
    },
    {
      alertType: "performance_degradation",
      isEnabled: true,
      notificationChannel: "in_app",
      frequency: "immediate",
      thresholdSettings: { loadTimeIncrease: 2000 },
    },
  ];
}

export default {
  getAlerts,
  getAlertById,
  markAsRead,
  markAllAsRead,
  deleteAlert,
  getUnreadCount,
  getAlertSettings,
  updateAlertSettings,
  getAlertStats,
};
