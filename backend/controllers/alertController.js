// controllers/alertController.js - Handle alert-related requests
import db from "../db/init.js";
import ChangeDetectionService from "../services/changeDetectionService.js";

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
      startDate,
      endDate,
    } = req.query;

    // Build query conditions
    const where = { userId };

    if (projectName) where.projectName = projectName;
    if (alertType) where.alertType = alertType;
    if (severity) where.severity = severity;
    if (isRead !== undefined) where.isRead = isRead === "true";

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = new Date(startDate);
      if (endDate) where.createdAt.$lte = new Date(endDate);
    }

    const alerts = await Alert().findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: ScanHistory(),
          as: "scan",
          attributes: ["id", "url", "scanDate", "seoScore"],
        },
      ],
    });

    const total = await Alert().count({ where });

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
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

    const alert = await Alert().findOne({
      where: { id, userId },
      include: [
        {
          model: ScanHistory(),
          as: "scan",
          attributes: ["id", "url", "scanDate", "seoScore", "scanData"],
        },
      ],
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    res.json({
      success: true,
      data: alert,
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

    const alert = await Alert().findOne({
      where: { id, userId },
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    alert.isRead = true;
    await alert.save();

    res.json({
      success: true,
      message: "Alert marked as read",
      data: alert,
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

    const where = { userId, isRead: false };
    if (projectName) where.projectName = projectName;

    await Alert().update({ isRead: true }, { where });

    res.json({
      success: true,
      message: "All alerts marked as read",
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

    const deleted = await Alert().destroy({
      where: { id, userId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
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

    const where = { userId, isRead: false };
    if (projectName) where.projectName = projectName;

    const count = await Alert().count({ where });

    res.json({
      success: true,
      count,
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

    const where = { userId };
    if (projectName) where.projectName = projectName;

    const settings = await AlertSettings().findAll({ where });

    // If no settings exist, return defaults
    if (settings.length === 0) {
      const defaultSettings = getDefaultAlertSettings();
      res.json({
        success: true,
        data: defaultSettings,
        isDefault: true,
      });
      return;
    }

    res.json({
      success: true,
      data: settings,
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

      // Find or create setting
      const [record, created] = await AlertSettings().findOrCreate({
        where: {
          userId,
          projectName: projectName || null,
          alertType,
        },
        defaults: {
          isEnabled,
          notificationChannel,
          webhookUrl,
          frequency,
          thresholdSettings,
        },
      });

      // Update if it already existed
      if (!created) {
        await record.update({
          isEnabled,
          notificationChannel,
          webhookUrl,
          frequency,
          thresholdSettings,
        });
      }

      results.push(record);
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

    const where = { userId };
    if (projectName) where.projectName = projectName;

    // Get alerts from last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    where.createdAt = { $gte: startDate };

    const alerts = await Alert().findAll({ where });

    // Calculate statistics
    const stats = {
      total: alerts.length,
      unread: alerts.filter((a) => !a.isRead).length,
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
      stats.byType[alert.alertType] = (stats.byType[alert.alertType] || 0) + 1;
    });

    // Calculate daily trend
    const dailyCounts = {};
    alerts.forEach((alert) => {
      const date = new Date(alert.createdAt).toISOString().split("T")[0];
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
