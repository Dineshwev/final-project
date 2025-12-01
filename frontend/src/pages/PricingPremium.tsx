// src/pages/PricingPremium.tsx - Premium Dark Theme Pricing Page
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  X,
  Zap,
  Shield,
  Crown,
  ArrowRight,
  Users,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: string[];
  notIncluded?: string[];
  icon: any;
  gradient: string;
  badge?: string;
}

const PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Starter",
    tagline: "Perfect for individuals and small websites",
    monthlyPrice: 29,
    yearlyPrice: 23,
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "10 websites monitoring",
      "100 keywords tracking",
      "Basic SEO audit",
      "Weekly reports",
      "Email support",
      "Mobile app access",
      "Core web vitals tracking",
      "Basic competitor analysis",
    ],
    notIncluded: [
      "Advanced AI recommendations",
      "White-label reports",
      "Priority support",
    ],
  },
  {
    id: "advanced",
    name: "Professional",
    tagline: "Best for growing businesses and agencies",
    monthlyPrice: 79,
    yearlyPrice: 63,
    popular: true,
    icon: Crown,
    gradient: "from-purple-500 to-pink-500",
    badge: "Most Popular",
    features: [
      "50 websites monitoring",
      "500 keywords tracking",
      "Advanced SEO audit with AI",
      "Competitor deep-dive analysis",
      "Backlink monitoring & alerts",
      "Daily automated reports",
      "Priority support (24h response)",
      "API access (10K requests/month)",
      "White-label reports",
      "Team collaboration (5 users)",
      "Custom integrations",
      "Advanced analytics dashboard",
    ],
  },
  {
    id: "business",
    name: "Enterprise",
    tagline: "Ultimate solution for large organizations",
    monthlyPrice: 149,
    yearlyPrice: 119,
    icon: Shield,
    gradient: "from-emerald-500 to-teal-500",
    badge: "Best Value",
    features: [
      "Unlimited websites",
      "Unlimited keywords",
      "Enterprise AI audit suite",
      "Real-time monitoring & alerts",
      "White-label everything",
      "Custom integrations & API",
      "Dedicated account manager",
      "24/7 phone & chat support",
      "Unlimited API requests",
      "Team collaboration (unlimited)",
      "Custom reporting engine",
      "Advanced security features",
      "Multi-language SEO support",
      "Priority feature requests",
    ],
  },
];

const PricingPremium: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer for urgency
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectPlan = (planId: string) => {
    navigate(`/checkout?plan=${planId}&billing=${billingPeriod}`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(30, 64, 175, 0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Limited Time Offer Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-sm mb-6"
          >
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-200">
              Limited Time Offer Ends In:{" "}
              <span className="font-bold">
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Simple Pricing,
            </span>
            <br />
            <span className="text-white">Powerful Results</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Choose the perfect plan to skyrocket your SEO rankings. All plans
            include a 14-day free trial with full access.
          </p>

          {/* Billing Toggle with Savings Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-full p-2"
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`relative px-6 py-3 rounded-full font-semibold transition-all ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                Save 30%
              </span>
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-slate-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {PLANS.map((plan, index) => {
            const price =
              billingPeriod === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;
            const savings = plan.monthlyPrice * 12 - plan.yearlyPrice * 12;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative group ${
                  plan.popular ? "md:-mt-4 md:mb-4" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div
                      className={`px-4 py-1.5 bg-gradient-to-r ${plan.gradient} rounded-full shadow-lg`}
                    >
                      <span className="text-white font-bold text-sm flex items-center gap-1">
                        <Star className="w-4 h-4 fill-white" />
                        {plan.badge}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 ${
                    plan.popular
                      ? "border-purple-500/50 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30"
                      : "border-white/10 hover:border-white/20"
                  } hover:-translate-y-2`}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} bg-opacity-20 mb-6`}
                  >
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 mb-6">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-slate-400">/month</span>
                    </div>
                    {billingPeriod === "yearly" && (
                      <div className="text-sm text-emerald-400 font-medium">
                        Save ${savings} per year
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 mb-8 group/btn ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                      Everything included:
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Not Included (for Basic plan) */}
                  {plan.notIncluded && (
                    <div className="pt-6 border-t border-white/10 space-y-3">
                      <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                        Not included:
                      </div>
                      <ul className="space-y-2">
                        {plan.notIncluded.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-500 text-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Social Proof Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-12 mb-20"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-400" />
                <div className="text-4xl font-bold text-white">50K+</div>
              </div>
              <div className="text-slate-400">Happy Customers</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <div className="text-4xl font-bold text-white">127%</div>
              </div>
              <div className="text-slate-400">Avg. Traffic Increase</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                <div className="text-4xl font-bold text-white">4.9/5</div>
              </div>
              <div className="text-slate-400">Customer Rating</div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="text-white">Frequently Asked </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.",
              },
              {
                q: "What happens after the free trial?",
                a: "After your 14-day free trial, you'll be charged based on your selected plan. Cancel anytime before the trial ends to avoid charges.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund within 30 days of purchase.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Absolutely! You can cancel your subscription at any time from your account settings. No questions asked, no hidden fees.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-300">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-slate-300 mb-8">
            Our team is here to help you choose the right plan
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-500/50"
          >
            Contact Sales
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPremium;
