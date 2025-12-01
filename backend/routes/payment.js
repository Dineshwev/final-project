// routes/payment.js
import express from "express";
import paypalService from "../services/paypalService.js";
import db from "../db/init.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    price: 29,
    currency: "USD",
    scans: 100,
    features: [
      "Up to 100 scans per month",
      "Basic SEO analysis",
      "Performance metrics",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    price: 79,
    currency: "USD",
    scans: 500,
    features: [
      "Up to 500 scans per month",
      "Advanced SEO analysis",
      "Competitor analysis",
      "Priority support",
      "API access",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 149,
    currency: "USD",
    scans: -1, // Unlimited
    features: [
      "Unlimited scans",
      "White-label reports",
      "Custom integrations",
      "Dedicated support",
      "Advanced API access",
      "Team collaboration",
    ],
  },
};

/**
 * GET /api/payment/plans
 * Get available subscription plans
 */
router.get("/plans", (req, res) => {
  try {
    res.json({
      success: true,
      plans: SUBSCRIPTION_PLANS,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription plans",
    });
  }
});

/**
 * POST /api/payment/create-order
 * Create a PayPal order for subscription payment
 */
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user.uid;

    // Validate plan type
    if (!SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan type",
      });
    }

    const plan = SUBSCRIPTION_PLANS[planType];

    // Get base URL for return/cancel URLs
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Create PayPal order
    const orderResult = await paypalService.createOrder({
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      returnUrl: `${baseUrl}/payment/success`,
      cancelUrl: `${baseUrl}/payment/cancel`,
    });

    // Store order in database
    const stmt = db.prepare(`
      INSERT INTO payment_orders (
        order_id, user_id, plan_type, amount, currency, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      orderResult.orderId,
      userId,
      planType,
      plan.price,
      plan.currency,
      "CREATED"
    );

    res.json({
      success: true,
      orderId: orderResult.orderId,
      approvalUrl: orderResult.approvalUrl,
      plan: plan,
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create payment order",
    });
  }
});

/**
 * POST /api/payment/capture-order
 * Capture a PayPal order after user approval
 */
router.post("/capture-order", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.uid;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
    }

    // Verify order belongs to user
    const orderStmt = db.prepare(
      "SELECT * FROM payment_orders WHERE order_id = ? AND user_id = ?"
    );
    const order = orderStmt.get(orderId, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Capture payment
    const captureResult = await paypalService.captureOrder(orderId);

    if (captureResult.success) {
      // Update order status
      const updateOrderStmt = db.prepare(`
        UPDATE payment_orders 
        SET status = ?, capture_id = ?, captured_at = datetime('now')
        WHERE order_id = ?
      `);
      updateOrderStmt.run("COMPLETED", captureResult.captureId, orderId);

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      // Create or update subscription
      const subscriptionStmt = db.prepare(`
        INSERT OR REPLACE INTO subscriptions (
          user_id, plan_type, status, start_date, end_date, 
          paypal_order_id, paypal_capture_id, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      subscriptionStmt.run(
        userId,
        order.plan_type,
        "active",
        startDate.toISOString(),
        endDate.toISOString(),
        orderId,
        captureResult.captureId
      );

      // Update user's scan limits
      const plan = SUBSCRIPTION_PLANS[order.plan_type];
      const updateUserStmt = db.prepare(`
        UPDATE users 
        SET subscription_plan = ?, 
            scan_limit = ?, 
            scans_used = 0,
            subscription_status = 'active'
        WHERE firebase_uid = ?
      `);
      updateUserStmt.run(order.plan_type, plan.scans, userId);

      res.json({
        success: true,
        message: "Payment captured successfully",
        subscription: {
          plan: order.plan_type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: "active",
        },
        payment: {
          orderId: captureResult.orderId,
          captureId: captureResult.captureId,
          amount: captureResult.amount,
          currency: captureResult.currency,
        },
      });
    } else {
      throw new Error("Payment capture failed");
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to capture payment",
    });
  }
});

/**
 * GET /api/payment/subscription
 * Get user's current subscription details
 */
router.get("/subscription", verifyToken, (req, res) => {
  try {
    const userId = req.user.uid;

    const stmt = db.prepare(`
      SELECT s.*, p.name as plan_name, p.price, p.scans, p.features
      FROM subscriptions s
      LEFT JOIN (
        SELECT 'starter' as type, ? as name, ? as price, ? as scans, ? as features
        UNION SELECT 'professional', ?, ?, ?, ?
        UNION SELECT 'enterprise', ?, ?, ?, ?
      ) p ON s.plan_type = p.type
      WHERE s.user_id = ?
      ORDER BY s.last_updated DESC
      LIMIT 1
    `);

    const subscription = stmt.get(
      SUBSCRIPTION_PLANS.starter.name,
      SUBSCRIPTION_PLANS.starter.price,
      SUBSCRIPTION_PLANS.starter.scans,
      JSON.stringify(SUBSCRIPTION_PLANS.starter.features),
      SUBSCRIPTION_PLANS.professional.name,
      SUBSCRIPTION_PLANS.professional.price,
      SUBSCRIPTION_PLANS.professional.scans,
      JSON.stringify(SUBSCRIPTION_PLANS.professional.features),
      SUBSCRIPTION_PLANS.enterprise.name,
      SUBSCRIPTION_PLANS.enterprise.price,
      SUBSCRIPTION_PLANS.enterprise.scans,
      JSON.stringify(SUBSCRIPTION_PLANS.enterprise.features),
      userId
    );

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const isExpired = now > endDate;

    if (isExpired && subscription.status === "active") {
      // Update subscription status
      const updateStmt = db.prepare(
        "UPDATE subscriptions SET status = ? WHERE id = ?"
      );
      updateStmt.run("expired", subscription.id);
      subscription.status = "expired";
    }

    res.json({
      success: true,
      subscription: {
        ...subscription,
        isExpired,
        daysRemaining: Math.max(
          0,
          Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscription details",
    });
  }
});

/**
 * POST /api/payment/cancel-subscription
 * Cancel user's subscription
 */
router.post("/cancel-subscription", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get active subscription
    const getStmt = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? AND status = 'active'
      ORDER BY last_updated DESC
      LIMIT 1
    `);
    const subscription = getStmt.get(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "No active subscription found",
      });
    }

    // Update subscription status
    const updateStmt = db.prepare(`
      UPDATE subscriptions 
      SET status = 'cancelled', last_updated = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(subscription.id);

    // Update user status
    const updateUserStmt = db.prepare(`
      UPDATE users 
      SET subscription_status = 'cancelled'
      WHERE firebase_uid = ?
    `);
    updateUserStmt.run(userId);

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription: {
        ...subscription,
        status: "cancelled",
        endDate: subscription.end_date, // They can use until end date
      },
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel subscription",
    });
  }
});

/**
 * GET /api/payment/history
 * Get user's payment history
 */
router.get("/history", verifyToken, (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const stmt = db.prepare(`
      SELECT 
        po.*,
        CASE 
          WHEN po.plan_type = 'starter' THEN 'Starter'
          WHEN po.plan_type = 'professional' THEN 'Professional'
          WHEN po.plan_type = 'enterprise' THEN 'Enterprise'
          ELSE po.plan_type
        END as plan_name
      FROM payment_orders po
      WHERE po.user_id = ?
      ORDER BY po.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const payments = stmt.all(userId, limit, offset);

    // Get total count
    const countStmt = db.prepare(
      "SELECT COUNT(*) as total FROM payment_orders WHERE user_id = ?"
    );
    const { total } = countStmt.get(userId);

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment history",
    });
  }
});

/**
 * POST /api/payment/webhook
 * Handle PayPal webhook events
 */
router.post("/webhook", async (req, res) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
      console.error("PAYPAL_WEBHOOK_ID not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    // Verify webhook signature
    const isValid = await paypalService.verifyWebhookSignature(
      req.headers,
      req.body,
      webhookId
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log("PayPal webhook event:", event.event_type);

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        // Payment was captured successfully
        console.log("Payment captured:", event.resource.id);
        // Update database if needed
        break;

      case "PAYMENT.CAPTURE.DENIED":
        // Payment was denied
        console.log("Payment denied:", event.resource.id);
        break;

      case "CHECKOUT.ORDER.APPROVED":
        // Order was approved by buyer
        console.log("Order approved:", event.resource.id);
        break;

      default:
        console.log("Unhandled webhook event:", event.event_type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
