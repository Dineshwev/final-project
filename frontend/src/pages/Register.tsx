// src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaGoogle } from "../components/Icons";
import { motion } from "framer-motion";
import { UserPlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import PageContainer from "../components/PageContainer";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Alert from "../components/Alert";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "../utils/animations";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    try {
      setError(null);
      setLoading(true);

      const result = await register(email, password, name);

      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Failed to register");
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError(null);
      setGoogleLoading(true);

      // This will redirect the user to Google sign-in page
      const result = await loginWithGoogle();

      // If we get here and it's not successful, show error
      if (!result.success && result.error) {
        setError(result.error);
        setGoogleLoading(false);
      }
      // Note: If successful, the page will redirect away, so no need to handle success here
    } catch (err) {
      setError("An error occurred during Google sign up");
      console.error("Google sign up error:", err);
      setGoogleLoading(false);
    }
  };

  return (
    <PageContainer
      title="Join Us Today"
      subtitle="Create your account and start analyzing your website performance"
      icon={<UserPlusIcon className="w-8 h-8" />}
      maxWidth="md"
    >
      <Card variant="glass" padding="xl" hover className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl"
          >
            <UserPlusIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Sign in instead
            </Link>
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Registration Failed"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Registration Form */}
        <motion.form
          variants={slideUp}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={<FaUser />}
            iconPosition="left"
            required
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<FaEnvelope />}
            iconPosition="left"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<FaLock />}
            iconPosition="left"
            required
            autoComplete="new-password"
            helperText="Must be at least 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={<FaLock />}
            iconPosition="left"
            required
            autoComplete="new-password"
            error={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />

          {/* Terms Checkbox */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              required
              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="success"
            size="lg"
            fullWidth
            loading={loading}
            disabled={googleLoading}
            icon={<CheckCircleIcon className="w-5 h-5" />}
            iconPosition="left"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </motion.form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
              Or sign up with
            </span>
          </div>
        </div>

        {/* Google Signup Button */}
        <Button
          type="button"
          onClick={handleGoogleSignup}
          variant="outline"
          size="lg"
          fullWidth
          loading={googleLoading}
          disabled={loading}
          icon={<FaGoogle className="text-red-600" />}
          iconPosition="left"
        >
          {googleLoading ? "Signing up with Google..." : "Sign up with Google"}
        </Button>

        {/* Benefits List */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-8 space-y-3"
        >
          {[
            "Unlimited website scans",
            "Detailed performance analytics",
            "SEO optimization insights",
            "Real-time monitoring",
          ].map((benefit, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{benefit}</span>
            </motion.div>
          ))}
        </motion.div>
      </Card>
    </PageContainer>
  );
};

export default Register;
