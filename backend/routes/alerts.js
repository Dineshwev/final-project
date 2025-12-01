// routes/alerts.js - Alert management routes
import express from "express";
import * as alertController from "../controllers/alertControllerSqlite.js";

const router = express.Router();

// Get all alerts
router.get("/", alertController.getAlerts);

// Get alert statistics
router.get("/stats", alertController.getAlertStats);

// Get unread count
router.get("/unread-count", alertController.getUnreadCount);

// Get alert settings
router.get("/settings", alertController.getAlertSettings);

// Update alert settings
router.post("/settings", alertController.updateAlertSettings);

// Mark all as read
router.post("/mark-all-read", alertController.markAllAsRead);

// Get specific alert
router.get("/:id", alertController.getAlertById);

// Mark specific alert as read
router.patch("/:id/read", alertController.markAsRead);

// Delete alert
router.delete("/:id", alertController.deleteAlert);

export default router;
