// src/pages/About.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaUsers,
  FaChartLine,
  FaCode,
} from "../components/Icons";
import {
  InformationCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const About: React.FC = () => {
  return (
    <PageContainer
      title="About Healthy SEO"
      subtitle="Empowering website owners with professional-grade SEO tools"
      icon={<InformationCircleIcon className="w-8 h-8" />}
      maxWidth="7xl"
    >
      {/* Mission Statement */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <Card variant="gradient" padding="xl">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="purple" size="lg" className="mb-6">
              <SparklesIcon className="w-4 h-4" />
              Our Mission
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Making Professional SEO Accessible to Everyone
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Our mission is to democratize professional-grade SEO tools, making
              them accessible to small business owners, developers, and
              enterprise organizations alike. We help you achieve better search
              rankings, increased traffic, and improved user experience through
              data-driven insights and comprehensive analysis.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Value Props */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
      >
        {[
          {
            icon: <FaChartLine className="w-6 h-6" />,
            title: "Data-Driven",
            description:
              "Actionable insights based on real data and industry best practices",
            color: "blue",
          },
          {
            icon: <ShieldCheckIcon className="w-6 h-6" />,
            title: "Comprehensive",
            description:
              "Analyze every aspect from SEO to security and performance",
            color: "green",
          },
          {
            icon: <RocketLaunchIcon className="w-6 h-6" />,
            title: "Fast & Reliable",
            description: "Lightning-fast scans with 99.9% uptime guarantee",
            color: "purple",
          },
          {
            icon: <SparklesIcon className="w-6 h-6" />,
            title: "Easy to Use",
            description:
              "Intuitive interface designed for users of all skill levels",
            color: "pink",
          },
        ].map((item, index) => (
          <motion.div key={index} variants={staggerItem}>
            <Card variant="glass" padding="lg" hover>
              <div
                className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center mb-4 shadow-lg text-white`}
              >
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Team Section */}
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <div className="text-center mb-12">
          <Badge variant="info" size="lg" className="mb-4">
            <FaUsers className="w-4 h-4" />
            Meet the Team
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Built by Experts, For Everyone
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our team of experienced SEO specialists, developers, and security
            experts is dedicated to your success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "John Smith",
              role: "Founder & CEO",
              avatar: "JS",
              exp: "15+ years in SEO",
              gradient: "from-blue-500 to-indigo-600",
            },
            {
              name: "Sarah Johnson",
              role: "CTO",
              avatar: "SJ",
              exp: "Full-stack & Performance",
              gradient: "from-purple-500 to-pink-600",
            },
            {
              name: "Mike Williams",
              role: "Security Lead",
              avatar: "MW",
              exp: "Cybersecurity Expert",
              gradient: "from-green-500 to-emerald-600",
            },
          ].map((member, index) => (
            <Card
              key={index}
              variant="glass"
              padding="lg"
              hover
              className="text-center"
            >
              <div
                className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${member.gradient} rounded-2xl flex items-center justify-center shadow-xl`}
              >
                <span className="text-3xl font-bold text-white">
                  {member.avatar}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {member.name}
              </h3>
              <Badge variant="info" size="sm" className="mb-3">
                {member.role}
              </Badge>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {member.exp}
              </p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Technology */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <Card variant="glass" padding="xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaCode className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Built with Modern Technologies
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Cutting-edge tools for accurate, fast results
              </p>
            </div>
          </div>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4 mt-8"
          >
            {[
              "Advanced crawling engine that simulates how search engines see your website",
              "Integration with Google's PageSpeed Insights API for performance metrics",
              "Security scanning based on OWASP guidelines and best practices",
              "Semantic analysis for content optimization and keyword research",
              "Machine learning algorithms to provide tailored recommendations",
              "Real-time monitoring and automated alerting system",
            ].map((feature, index) => (
              <motion.li
                key={index}
                variants={staggerItem}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div variants={slideUp} initial="hidden" animate="visible">
        <Card variant="gradient" padding="xl" className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Improve Your Website?
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Get started today with our comprehensive SEO analysis and take your
            website to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button
                variant="primary"
                size="lg"
                icon={<RocketLaunchIcon className="w-5 h-5" />}
              >
                Try It Free
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </PageContainer>
  );
};

export default About;
