// src/pages/Contact.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaPaperPlane,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaClock,
  FaInstagram,
} from "../components/Icons";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch((process.env.REACT_APP_API_BASE_URL || "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api") + "/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitResult({
          success: true,
          message:
            data.message ||
            "Thank you for your message! We will get back to you soon.",
        });

        // Clear form
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitResult({
          success: false,
          message:
            data.message || "Failed to send message. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setSubmitResult({
        success: false,
        message:
          "Failed to send message. Please try again later or contact us at contact@healthyseo.tech",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Contact Us"
      subtitle="Get in touch with our team. We're here to help!"
      icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
    >
      {submitResult && (
        <motion.div variants={fadeIn}>
          <Alert
            type={submitResult.success ? "success" : "error"}
            title={submitResult.success ? "Message Sent!" : "Error"}
            message={submitResult.message}
          />
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Contact Form */}
        <motion.div variants={staggerItem}>
          <Card variant="glass" padding="lg" hover>
            <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
              Send Us a Message
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                icon={<FaUser />}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                icon={<FaEnvelope />}
                placeholder="john@example.com"
                required
              />

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-white/10 text-slate-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-900 dark:text-slate-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-gray-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="primary"
                icon={<FaPaperPlane />}
                loading={isSubmitting}
                fullWidth
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={staggerItem} className="space-y-6">
          <Card variant="glass" padding="lg">
            <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
              Contact Information
            </h2>
            <div className="space-y-6">
              <motion.div variants={fadeIn} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-4 text-slate-900 dark:text-white">
                  <h3 className="font-medium mb-1">Address</h3>
                  <p className="text-slate-700 dark:text-white/80">
                    123 Tech Plaza, Suite 456
                    <br />
                    San Francisco, CA 94107
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaPhone className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-4 text-slate-900 dark:text-white">
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-slate-700 dark:text-white/80">
                    +1 (555) 123-4567
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaEnvelope className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-4 text-slate-900 dark:text-white">
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-slate-700 dark:text-white/80">
                    contact@healthyseo.tech
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaInstagram className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-4 text-slate-900 dark:text-white">
                  <h3 className="font-medium mb-1">Instagram</h3>
                  <a 
                    href="https://instagram.com/healthyseo.tech" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-700 dark:text-white/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    @healthyseo.tech
                  </a>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaUser className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-4 text-slate-900 dark:text-white">
                  <h3 className="font-medium mb-1">Client ID</h3>
                  <p className="text-slate-700 dark:text-white/80 break-all">
                    1000.9BIMMKZ87YX1HFCMX5C3QWUXY7G8BH
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FaUser className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                </div>
                <div className="ml-4 text-slate-900 dark:text-white">
                  <h3 className="font-medium mb-1">Client Secret</h3>
                  <p className="text-slate-700 dark:text-white/80 break-all">
                    da693c766bf7f6462a70264e074731d064578cf695
                  </p>
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card variant="glass" padding="lg" hover>
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Business Hours
              </h2>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/10">
                <span className="font-medium text-slate-900 dark:text-white">
                  Monday - Friday:
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  9:00 AM - 6:00 PM PST
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/10">
                <span className="font-medium text-slate-900 dark:text-white">
                  Saturday:
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  10:00 AM - 4:00 PM PST
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-slate-900 dark:text-white">
                  Sunday:
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  Closed
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-white/10">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Support Response Times
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                We typically respond to all inquiries within 1-2 business days.
                For urgent matters, please contact us by phone.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Map */}
      <motion.div variants={slideUp} className="mt-8">
        <Card variant="glass" padding="none">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg h-80 w-full">
            {/* In a real application, you would embed a Google Map here */}
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FaMapMarkerAlt className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Interactive Map</p>
              <p className="text-sm">Google Maps would be embedded here</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </PageContainer>
  );
};

export default Contact;
