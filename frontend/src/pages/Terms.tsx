import React from "react";
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import {
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const Terms: React.FC = () => {
  return (
    <PageContainer
      title="Terms of Service"
      subtitle="Please read our terms carefully before using our services"
      icon={<DocumentTextIcon className="w-8 h-8" />}
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
              1. Introduction
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Welcome to our SEO Analysis Tool. By using our service, you agree
              to be bound by these Terms of Service. Please read them carefully.
              If you do not agree to these terms, please do not use our service.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              2. Use of Service
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Our service provides SEO analysis for websites. You agree to use
              this service only for lawful purposes and in a manner that does
              not infringe upon or restrict the rights of others.
            </p>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              You are responsible for maintaining the confidentiality of your
              account information and for all activities that occur under your
              account.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              3. Service Limitations
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We reserve the right to modify, suspend, or discontinue the
              service at any time, with or without notice.
            </p>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We are not responsible for any harm that may result from
              downloading or accessing any information or content on the
              Internet through our service.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              4. Data Privacy
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Please refer to our Privacy Policy for information on how we
              collect, use, and disclose information from our users.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              5. Changes to Terms
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              We reserve the right to update or modify these Terms of Service at
              any time without prior notice. Your continued use of the service
              after any changes indicates your acceptance of the new Terms.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
              6. Contact Us
            </h2>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              If you have any questions about these Terms, please contact us
              through the Contact page.
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default Terms;
