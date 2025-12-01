// src/pages/Checkout.tsx - Payment Checkout Page with PayPal Integration
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { FaCreditCard, FaLock } from "../components/Icons";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import PayPalButton from "../components/PayPalButton";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plan = searchParams.get("plan") || "basic";
  const billing = searchParams.get("billing") || "monthly";

  const planNames: Record<string, string> = {
    basic: "Starter",
    advanced: "Professional",
    business: "Enterprise",
  };

  const planPrices: Record<string, number> = {
    basic: 29,
    advanced: 79,
    business: 149,
  };

  const planFeatures: Record<string, string[]> = {
    basic: [
      "10 websites monitoring",
      "100 keywords tracking",
      "Basic SEO audit",
      "Weekly reports",
      "Email support",
    ],
    advanced: [
      "50 websites monitoring",
      "500 keywords tracking",
      "Advanced SEO audit with AI",
      "Daily reports",
      "Priority support",
    ],
    business: [
      "Unlimited websites",
      "Unlimited keywords",
      "Enterprise AI audit suite",
      "Real-time monitoring",
      "24/7 phone support",
    ],
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Payment successful:", data);
    setTimeout(() => {
      navigate("/dashboard", {
        state: {
          paymentSuccess: true,
          subscription: data.subscription,
        },
      });
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
  };

  const handlePaymentCancel = () => {
    console.log("Payment cancelled by user");
  };

  return (
    <PageContainer
      title="Complete Your Subscription"
      subtitle="You're just one step away from accessing powerful SEO analytics"
      icon={<CreditCardIcon className="w-8 h-8" />}
      maxWidth="7xl"
    >
      {/* Back Button */}
      <motion.div variants={fadeIn}>
        <Button
          variant="secondary"
          icon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => navigate("/pricing")}
        >
          Back to Pricing
        </Button>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 gap-8 mt-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Order Summary */}
        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                <Badge variant="info">{planNames[plan]}</Badge>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                  Billing
                </span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {billing}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${planPrices[plan]}/mo
                </span>
              </div>
            </div>

            <Card variant="glass" padding="md">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Instant Activation
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your subscription will be activated immediately after
                    payment. Start using all premium features right away.
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>✓ Instant access to all features</p>
              <p>✓ 30-day money-back guarantee</p>
              <p>✓ Cancel anytime</p>
            </div>
          </Card>
        </motion.div>

        {/* Payment Method */}
        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-2 mb-6">
              <FaLock className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payment Method
              </h2>
            </div>

            {/* PayPal Integration */}
            <div className="mb-8">
              <PayPalButton
                planType={plan as "starter" | "professional" | "enterprise"}
                planName={planNames[plan]}
                amount={planPrices[plan]}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>

            {/* What's Included */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                What's Included:
              </h3>
              {planFeatures[plan].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <Card variant="glass" padding="md" className="mt-6">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Secure Payment
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your payment is encrypted and secure. We never store your
                    card details. All transactions are processed through PayPal.
                  </p>
                </div>
              </div>
            </Card>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              By completing this purchase, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default Checkout;
