# PayPal Payment Integration Guide

## Overview

Complete PayPal payment integration for subscription management in the SEO Health Analyzer. Uses PayPal REST API for secure payment processing.

## Features Implemented

### Backend

✅ **PayPal Service** (`backend/services/paypalService.js`)

- OAuth 2.0 authentication with token caching
- Create payment orders
- Capture approved payments
- Get order details
- Process refunds
- Verify webhook signatures
- Transaction tracking

✅ **Payment Routes** (`backend/routes/payment.js`)

- `GET /api/payment/plans` - Get subscription plans
- `POST /api/payment/create-order` - Create PayPal order
- `POST /api/payment/capture-order` - Capture payment
- `GET /api/payment/subscription` - Get user subscription
- `POST /api/payment/cancel-subscription` - Cancel subscription
- `GET /api/payment/history` - Payment history
- `POST /api/payment/webhook` - PayPal webhook handler

✅ **Database Schema** (`backend/db/init.js`)

- `payment_orders` table - Store PayPal orders
- `subscriptions` table - Track user subscriptions
- `users` table - User subscription status and limits

### Frontend

✅ **PayPal Button Component** (`frontand/src/components/PayPalButton.tsx`)

- Secure payment flow
- Loading states
- Success/error handling
- PayPal popup window
- Payment confirmation

✅ **Checkout Page** (`frontand/src/pages/Checkout.tsx`)

- Order summary
- Plan features display
- PayPal integration
- Security badges
- Money-back guarantee

## Subscription Plans

### Starter - $29/month

- 10 websites monitoring
- 100 keywords tracking
- Basic SEO audit
- Weekly reports
- Email support

### Professional - $79/month

- 50 websites monitoring
- 500 keywords tracking
- Advanced SEO audit with AI
- Daily reports
- Priority support

### Enterprise - $149/month

- Unlimited websites
- Unlimited keywords
- Enterprise AI suite
- Real-time monitoring
- 24/7 phone support

## Setup Instructions

### 1. PayPal Developer Account

1. Go to https://developer.paypal.com/
2. Sign in or create account
3. Navigate to Dashboard → My Apps & Credentials
4. Create a new app or use existing
5. Copy Client ID and Secret

### 2. Environment Configuration

Already configured in `backend/.env`:

```env
PAYPAL_CLIENT_ID=ATsgSi1960vdP5rIPwqt3kcZ7hCylep-D6TX-opuGLrqzccuQh5925_Q4Kg26LRPBLnBAU7I3hDtcbv8
PAYPAL_CLIENT_SECRET=EJ7VO1qs5OmgbKXEmv39UEagBW5Lin2qyfcuSxDAbSNatk7tyQhdlL6K6nqM_muy6BUsmvMgZiVly_YY
PAYPAL_MODE=sandbox
```

For production:

- Change `PAYPAL_MODE=live`
- Use live credentials from PayPal

### 3. Dependencies

✅ **No additional packages needed!**
Uses existing dependencies:

- `axios` - HTTP requests to PayPal API
- `express` - Backend routes
- `sqlite3` - Database storage

### 4. Database Setup

Tables are automatically created on server start via `backend/db/init.js`

### 5. Start Services

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontand
npm run dev
```

## Payment Flow

### 1. User Selects Plan

- Navigate to `/pricing`
- Click "Get Started" on any plan
- Redirected to `/checkout?plan=starter&billing=monthly`

### 2. Create Order

- User clicks "Pay with PayPal" button
- Frontend calls `POST /api/payment/create-order`
- Backend creates PayPal order
- Returns approval URL

### 3. PayPal Approval

- User redirected to PayPal (popup window)
- User logs into PayPal account
- Reviews payment details
- Approves payment

### 4. Capture Payment

- Window closes after approval
- Frontend calls `POST /api/payment/capture-order`
- Backend captures the payment
- Updates database:
  - `payment_orders` - Mark as completed
  - `subscriptions` - Create/update subscription
  - `users` - Update plan and limits

### 5. Success Redirect

- User redirected to dashboard
- Subscription is now active
- Access to premium features

## API Endpoints

### Create Payment Order

```http
POST /api/payment/create-order
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "planType": "starter" | "professional" | "enterprise"
}
```

**Response:**

```json
{
  "success": true,
  "orderId": "7XX12345XX678901Y",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "plan": {
    "name": "Starter",
    "price": 29,
    "currency": "USD"
  }
}
```

### Capture Payment

```http
POST /api/payment/capture-order
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "orderId": "7XX12345XX678901Y"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment captured successfully",
  "subscription": {
    "plan": "starter",
    "startDate": "2024-01-15T10:30:00.000Z",
    "endDate": "2024-02-15T10:30:00.000Z",
    "status": "active"
  },
  "payment": {
    "orderId": "7XX12345XX678901Y",
    "captureId": "3XX12345XX678901Z",
    "amount": "29.00",
    "currency": "USD"
  }
}
```

### Get User Subscription

```http
GET /api/payment/subscription
Authorization: Bearer <firebase-token>
```

**Response:**

```json
{
  "success": true,
  "subscription": {
    "plan_type": "starter",
    "status": "active",
    "start_date": "2024-01-15T10:30:00.000Z",
    "end_date": "2024-02-15T10:30:00.000Z",
    "isExpired": false,
    "daysRemaining": 31
  }
}
```

## Testing

### PayPal Sandbox Test Accounts

Use PayPal sandbox buyer accounts for testing:

- Email: Any sandbox buyer account
- Password: Your sandbox account password

Create test accounts at: https://developer.paypal.com/dashboard/accounts

### Test Payment Flow

1. Start servers (backend + frontend)
2. Sign in to your app
3. Go to pricing page
4. Click "Get Started" on any plan
5. Click "Pay with PayPal"
6. Use sandbox buyer account
7. Complete payment
8. Verify subscription is active

### Verify Database

```sql
-- Check payment orders
SELECT * FROM payment_orders ORDER BY created_at DESC;

-- Check subscriptions
SELECT * FROM subscriptions ORDER BY last_updated DESC;

-- Check user subscription status
SELECT firebase_uid, subscription_plan, subscription_status, scan_limit
FROM users WHERE subscription_plan != 'free';
```

## Security Features

✅ **Authentication**

- Firebase token required for all payment endpoints
- User ID verified before creating/capturing orders

✅ **PayPal Security**

- OAuth 2.0 authentication
- Token caching with expiry
- HTTPS in production
- Webhook signature verification

✅ **Database Security**

- User ownership verification
- Prepared statements (SQL injection prevention)
- Sensitive data not logged

✅ **Frontend Security**

- Tokens stored securely
- HTTPS for production
- PayPal popup (no card data on site)
- Error messages don't expose sensitive info

## Webhook Configuration (Optional)

### Setup PayPal Webhooks

1. Go to PayPal Developer Dashboard
2. Select your app
3. Go to Webhooks section
4. Create webhook with URL: `https://yourdomain.com/api/payment/webhook`
5. Subscribe to events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `CHECKOUT.ORDER.APPROVED`
6. Copy Webhook ID
7. Add to `.env`:
   ```env
   PAYPAL_WEBHOOK_ID=your_webhook_id_here
   ```

## Troubleshooting

### Payment Not Working

1. Check PayPal credentials in `.env`
2. Verify `PAYPAL_MODE=sandbox` for testing
3. Check backend logs for errors
4. Ensure user is authenticated (has valid token)

### Order Not Created

- Check API endpoint is accessible
- Verify Firebase token is valid
- Check backend logs
- Ensure database tables exist

### Payment Not Captured

- Verify order was approved in PayPal
- Check order status in database
- Ensure capture endpoint is called after approval

### Subscription Not Activated

- Check `subscriptions` table in database
- Verify `payment_orders` status is COMPLETED
- Check user's `subscription_plan` field

## Production Deployment

### Before Going Live

1. ✅ Change `PAYPAL_MODE=live` in `.env`
2. ✅ Use live PayPal credentials
3. ✅ Set up SSL/HTTPS
4. ✅ Configure webhook URL
5. ✅ Test with real PayPal account
6. ✅ Set `NODE_ENV=production`
7. ✅ Enable rate limiting
8. ✅ Review security headers

### Monitoring

- Monitor payment success/failure rates
- Track subscription renewals
- Check webhook delivery
- Review error logs
- Monitor database growth

## Support

### PayPal Resources

- Documentation: https://developer.paypal.com/docs/api/overview/
- Support: https://developer.paypal.com/support/
- Sandbox: https://www.sandbox.paypal.com/

### Code Files

- Backend Service: `backend/services/paypalService.js`
- Payment Routes: `backend/routes/payment.js`
- Database Schema: `backend/db/init.js`
- Frontend Component: `frontand/src/components/PayPalButton.tsx`
- Checkout Page: `frontand/src/pages/Checkout.tsx`

## Next Steps

### Recommended Enhancements

- [ ] Email receipts after payment
- [ ] Subscription renewal reminders
- [ ] Failed payment retry logic
- [ ] Proration for plan upgrades
- [ ] Annual billing discount
- [ ] Coupon/promo code system
- [ ] Admin dashboard for payments
- [ ] Export payment reports

### Already Implemented

✅ Payment order creation
✅ Payment capture
✅ Subscription management
✅ Payment history
✅ User subscription status
✅ Plan limits enforcement
✅ Database schema
✅ Frontend checkout flow
✅ Error handling
✅ Security measures

---

**Status:** ✅ Fully Implemented and Ready for Testing

**Last Updated:** 2024
**Version:** 1.0.0
