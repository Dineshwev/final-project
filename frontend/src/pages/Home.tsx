// src/pages/Home.tsx - Premium SEO Analyzer Landing Page
import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import ScanForm from "../components/ScanForm";
import {
  FaChartBar,
  FaShieldAlt,
  FaSearchPlus,
  FaRocket,
} from "../components/Icons";
import FeatureCard from "../components/FeatureCard";
import {
  BarChart3,
  Gauge,
  TrendingUp,
  Zap,
  Shield,
  Search,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";

const Home: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [seoScore, setSeoScore] = useState(0);
  const [activeUsers, setActiveUsers] = useState(1247);

  // Animate SEO score counter on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = 95 / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= 95) {
        setSeoScore(95);
        clearInterval(interval);
      } else {
        setSeoScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  // Simulate active users incrementing
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0 },
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Premium Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden py-20 md:py-32"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main gradient orbs */}
          <motion.div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(30, 64, 175, 0.4) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 -right-40 w-[800px] h-[800px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(124, 58, 237, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.3) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Trusted by 50,000+ Businesses Worldwide
                </span>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-slate-900" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-slate-900" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-slate-900" />
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content */}
              <div className="text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                >
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-300%">
                    Skyrocket Your SEO
                  </span>
                  <br />
                  <span className="text-white">Rankings Today</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0"
                >
                  Comprehensive website analysis powered by AI. Get actionable
                  insights to dominate search results and outrank competitors.
                </motion.p>

                {/* Live Activity Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center lg:justify-start gap-2 mb-8"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="relative">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-sm text-emerald-300 font-medium">
                      {activeUsers.toLocaleString()} users analyzing now
                    </span>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                >
                  <Link
                    to="/dashboard/new-scan"
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-2">
                      Start Free Analysis
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    to="/pricing"
                    className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    View Pricing
                  </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Free forever plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Cancel anytime</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Interactive Demo Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: -10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [-10, 10, -10],
                }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.5 },
                  x: { duration: 0.8, delay: 0.5 },
                  y: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="relative"
              >
                {/* Main Dashboard Card */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        SEO Health Score
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Real-time analysis
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                      Excellent
                    </div>
                  </div>

                  {/* Score Circle */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="12"
                          fill="none"
                        />
                        <motion.circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 88 * (1 - seoScore / 100),
                          }}
                          transition={{ duration: 2, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
                            />
                            <stop
                              offset="100%"
                              style={{ stopColor: "#8b5cf6", stopOpacity: 1 }}
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {seoScore}
                        </motion.span>
                        <span className="text-slate-400 text-sm">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300 text-sm">
                          Performance
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">98%</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300 text-sm">Security</span>
                      </div>
                      <div className="text-2xl font-bold text-white">A+</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-300 text-sm">
                          SEO Score
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        92/100
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-slate-300 text-sm">Speed</span>
                      </div>
                      <div className="text-2xl font-bold text-white">1.2s</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4 shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-emerald-400" />
                    <div>
                      <div className="text-white font-bold">Top 1%</div>
                      <div className="text-emerald-300 text-xs">
                        Performance
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 shadow-lg"
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-400" />
                    <div>
                      <div className="text-white font-bold">+127%</div>
                      <div className="text-blue-300 text-xs">More Traffic</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Scan Form Below Hero */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 max-w-3xl mx-auto"
            >
              <ScanForm className="w-full backdrop-blur-md bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section - Premium Dark Theme */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            style={{ filter: "blur(100px)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            style={{ filter: "blur(100px)" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Why Choose
              </span>{" "}
              <span className="text-white">Our Platform?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-xl max-w-2xl mx-auto"
            >
              Comprehensive tools designed to skyrocket your online presence and
              dominate search results
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "AI-Powered Analysis",
                description:
                  "Advanced algorithms analyze 200+ ranking factors in real-time",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-500/10 to-cyan-500/10",
              },
              {
                icon: Shield,
                title: "Security Fortress",
                description:
                  "Enterprise-grade security scanning with instant threat detection",
                gradient: "from-emerald-500 to-teal-500",
                bgGradient: "from-emerald-500/10 to-teal-500/10",
              },
              {
                icon: Search,
                title: "Competitor Intel",
                description:
                  "Spy on competitors and discover their winning strategies",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-500/10 to-pink-500/10",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Instant reports with actionable recommendations in seconds",
                gradient: "from-amber-500 to-orange-500",
                bgGradient: "from-amber-500/10 to-orange-500/10",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.bgGradient} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon
                      className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}
                      style={{ filter: "drop-shadow(0 0 10px currentColor)" }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>

                  {/* Hover effect overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section - Premium */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 bg-slate-900 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-xl max-w-2xl mx-auto"
            >
              Three simple steps to dominate search results
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent hidden md:block" />

            {[
              {
                step: "01",
                title: "Enter Your URL",
                description:
                  "Simply paste your website URL and choose your analysis preferences in seconds",
                icon: Search,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "02",
                title: "AI Analysis",
                description:
                  "Our advanced AI scans 200+ ranking factors and generates comprehensive insights",
                icon: Gauge,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "03",
                title: "Actionable Report",
                description:
                  "Get a detailed report with prioritized fixes to boost your rankings immediately",
                icon: TrendingUp,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Step number badge */}
                <div className="relative z-10 mb-6">
                  <div
                    className={`w-20 h-20 mx-auto bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 hover:rotate-3`}
                  >
                    <span className="text-3xl font-bold text-white">
                      {step.step}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full">
                  <div className="flex justify-center mb-4">
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-slate-300 text-center">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-8 -right-4 z-20"
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-8 h-8 text-purple-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action Section - Premium */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
            animate={{
              y: [0, -50, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Dominate Search Results?
              </h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Join 50,000+ businesses already using our platform to skyrocket
                their organic traffic and crush the competition
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">127%</div>
                  <div className="text-sm text-white/80">
                    Avg. Traffic Increase
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">50K+</div>
                  <div className="text-sm text-white/80">Happy Customers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">4.9/5</div>
                  <div className="text-sm text-white/80">Customer Rating</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/dashboard/new-scan"
                  className="group px-8 py-4 bg-white text-purple-600 hover:bg-gray-50 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Free Analysis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  to="/pricing"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-xl font-bold text-lg transform transition-all duration-300 hover:-translate-y-1"
                >
                  View Pricing Plans
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Free forever plan available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium Dark */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-slate-950 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"
            style={{ filter: "blur(120px)" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Loved by Thousands
              </span>{" "}
              <span className="text-white">of Businesses</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-xl max-w-2xl mx-auto"
            >
              See how businesses are crushing their SEO goals with our platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                rating: 5,
                text: "This tool helped me identify critical SEO issues I wasn't aware of. After implementing the recommendations, my organic traffic increased by 147% in just two months!",
                author: "Sarah Chen",
                role: "E-commerce Site Owner",
                avatar: "SC",
                color: "from-blue-500 to-cyan-500",
                metric: "+147%",
                metricLabel: "Traffic",
              },
              {
                rating: 5,
                text: "As a marketing agency, we use this tool for all our client websites. The detailed reports and real-time monitoring save us countless hours of manual analysis.",
                author: "Marcus Rodriguez",
                role: "Digital Marketing Director",
                avatar: "MR",
                color: "from-purple-500 to-pink-500",
                metric: "500+",
                metricLabel: "Projects",
              },
              {
                rating: 5,
                text: "The security analysis feature detected vulnerabilities that other premium tools completely missed. Game-changer for anyone serious about their online presence.",
                author: "David Kim",
                role: "Web Developer",
                avatar: "DK",
                color: "from-emerald-500 to-teal-500",
                metric: "99.9%",
                metricLabel: "Secure",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Success metric badge */}
                  <div className="absolute -top-4 -right-4">
                    <div
                      className={`px-4 py-2 bg-gradient-to-r ${testimonial.color} rounded-xl shadow-lg`}
                    >
                      <div className="text-white font-bold text-lg">
                        {testimonial.metric}
                      </div>
                      <div className="text-white/80 text-xs">
                        {testimonial.metricLabel}
                      </div>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-300 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <span className="font-bold text-white text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50,000+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-slate-400">Average Rating</div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-slate-400">Sites Analyzed</div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
