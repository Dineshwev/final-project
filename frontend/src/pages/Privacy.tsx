import React from "react";
import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const Privacy: React.FC = () => {
  return (
    <PageContainer
      title="Privacy Policy"
      subtitle="Your privacy is important to us. Learn how we protect your data"
      icon={<ShieldCheckIcon className="w-8 h-8" />}
    >
      <motion.div
        className="prose prose-lg dark:prose-invert max-w-none"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              1. Information We Collect
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We collect information you provide directly to us, such as when
              you create an account, submit website URLs for analysis, or
              contact us for support.
            </p>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We also collect information automatically when you use our
              service, including:
            </p>
            <ul className="list-disc ml-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>
                Log information (IP address, browser type, operating system,
                pages visited)
              </li>
              <li>Device information</li>
              <li>Usage information and scan history</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              2. How We Use Information
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We use the information we collect to:
            </p>
            <ul className="list-disc ml-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              3. Information Sharing
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We do not share your personal information with third parties
              except in the following circumstances:
            </p>
            <ul className="list-disc ml-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>With your consent</li>
              <li>To comply with laws or respond to legal requests</li>
              <li>To protect our rights, property, or safety</li>
              <li>In connection with a merger, sale, or acquisition</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              4. Data Security
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, and unauthorized access,
              disclosure, alteration, and destruction.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              5. Your Choices
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Account Information: You may update or correct information about
              yourself by logging into your account settings.
            </p>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Cookies: Most web browsers are set to accept cookies by default.
              If you prefer, you can usually choose to set your browser to
              remove or reject cookies.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              6. Changes to This Policy
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We may change this privacy policy from time to time. If we make
              changes, we will notify you by revising the date at the top of the
              policy and, in some cases, we may provide you with additional
              notice.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              7. Contact Us
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              If you have any questions about this privacy policy, please
              contact us through the Contact page.
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default Privacy;
