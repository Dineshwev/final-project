// services/paypalService.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

class PayPalService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get PayPal OAuth access token
   */
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (
        this.accessToken &&
        this.tokenExpiry &&
        Date.now() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      const auth = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
      ).toString("base64");

      const response = await axios({
        url: `${PAYPAL_API}/v1/oauth2/token`,
        method: "post",
        headers: {
          Accept: "application/json",
          "Accept-Language": "en_US",
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        data: "grant_type=client_credentials",
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error(
        "PayPal authentication error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with PayPal");
    }
  }

  /**
   * Create a PayPal order
   * @param {Object} orderData - Order information
   * @param {string} orderData.planName - Name of the subscription plan
   * @param {number} orderData.amount - Payment amount
   * @param {string} orderData.currency - Currency code (default: USD)
   * @param {string} orderData.returnUrl - URL to return after payment approval
   * @param {string} orderData.cancelUrl - URL to return if payment is cancelled
   */
  async createOrder({
    planName,
    amount,
    currency = "USD",
    returnUrl,
    cancelUrl,
  }) {
    try {
      const accessToken = await this.getAccessToken();

      const orderPayload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `SEO_${Date.now()}`,
            description: `SEO Health Analyzer - ${planName} Plan`,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "SEO Health Analyzer",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      const response = await axios({
        url: `${PAYPAL_API}/v2/checkout/orders`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: orderPayload,
      });

      return {
        success: true,
        orderId: response.data.id,
        status: response.data.status,
        links: response.data.links,
        approvalUrl: response.data.links.find((link) => link.rel === "approve")
          ?.href,
      };
    } catch (error) {
      console.error(
        "PayPal order creation error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create PayPal order");
    }
  }

  /**
   * Capture payment for an approved order
   * @param {string} orderId - PayPal order ID
   */
  async captureOrder(orderId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios({
        url: `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const capture = response.data.purchase_units[0].payments.captures[0];

      return {
        success: true,
        orderId: response.data.id,
        status: response.data.status,
        captureId: capture.id,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        payerEmail: response.data.payer?.email_address,
        payerName: `${response.data.payer?.name?.given_name || ""} ${
          response.data.payer?.name?.surname || ""
        }`.trim(),
        captureTime: capture.create_time,
      };
    } catch (error) {
      console.error(
        "PayPal capture error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to capture PayPal payment");
    }
  }

  /**
   * Get order details
   * @param {string} orderId - PayPal order ID
   */
  async getOrderDetails(orderId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios({
        url: `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        orderId: response.data.id,
        status: response.data.status,
        amount: response.data.purchase_units[0].amount.value,
        currency: response.data.purchase_units[0].amount.currency_code,
        payerEmail: response.data.payer?.email_address,
        createTime: response.data.create_time,
        updateTime: response.data.update_time,
      };
    } catch (error) {
      console.error(
        "PayPal order details error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get PayPal order details");
    }
  }

  /**
   * Refund a captured payment
   * @param {string} captureId - PayPal capture ID
   * @param {number} amount - Amount to refund (optional, defaults to full refund)
   * @param {string} currency - Currency code
   */
  async refundPayment(captureId, amount = null, currency = "USD") {
    try {
      const accessToken = await this.getAccessToken();

      const refundData = amount
        ? {
            amount: {
              value: amount.toFixed(2),
              currency_code: currency,
            },
          }
        : {};

      const response = await axios({
        url: `${PAYPAL_API}/v2/payments/captures/${captureId}/refund`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: refundData,
      });

      return {
        success: true,
        refundId: response.data.id,
        status: response.data.status,
        amount: response.data.amount.value,
        currency: response.data.amount.currency_code,
      };
    } catch (error) {
      console.error(
        "PayPal refund error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to process PayPal refund");
    }
  }

  /**
   * Verify webhook signature
   * @param {Object} headers - Request headers
   * @param {Object} body - Request body
   * @param {string} webhookId - PayPal webhook ID
   */
  async verifyWebhookSignature(headers, body, webhookId) {
    try {
      const accessToken = await this.getAccessToken();

      const verificationPayload = {
        transmission_id: headers["paypal-transmission-id"],
        transmission_time: headers["paypal-transmission-time"],
        cert_url: headers["paypal-cert-url"],
        auth_algo: headers["paypal-auth-algo"],
        transmission_sig: headers["paypal-transmission-sig"],
        webhook_id: webhookId,
        webhook_event: body,
      };

      const response = await axios({
        url: `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: verificationPayload,
      });

      return response.data.verification_status === "SUCCESS";
    } catch (error) {
      console.error(
        "PayPal webhook verification error:",
        error.response?.data || error.message
      );
      return false;
    }
  }

  /**
   * Get transaction details
   * @param {string} transactionId - PayPal transaction ID
   */
  async getTransactionDetails(transactionId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios({
        url: `${PAYPAL_API}/v1/reporting/transactions?transaction_id=${transactionId}`,
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        transaction: response.data.transaction_details[0],
      };
    } catch (error) {
      console.error(
        "PayPal transaction details error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to get transaction details");
    }
  }
}

export default new PayPalService();
