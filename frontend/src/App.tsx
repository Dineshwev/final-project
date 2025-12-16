import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./context/AuthContext.js";
import { ApiProvider } from "./context/ApiContext";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import History from "./pages/History";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Compare from "./pages/Compare";
import RankTracker from "./pages/RankTracker";
import ChartsGallery from "./pages/ChartsGallery";
import AlertSettings from "./pages/AlertSettings";
import AlertsDashboard from "./pages/AlertsDashboard";
import PricingPremium from "./pages/PricingPremium";
import Checkout from "./pages/Checkout";
import OGValidator from "./pages/OGValidator";
import TwitterCardValidator from "./pages/TwitterCardValidator";
import SocialShareTracker from "./pages/SocialShareTracker";
import SocialPresenceValidator from "./pages/SocialPresenceValidator";
import PinterestRichPinValidator from "./pages/PinterestRichPinValidator";
import RefundPolicy from "./pages/RefundPolicy";

// Scan Mode Components
import BasicScanContainer from "./scan-modes/basic/BasicScanContainer";
import GlobalScanContainer from "./scan-modes/global/GlobalScanContainer";
import FeatureScanContainer from "./scan-modes/feature/FeatureScanContainer";

// Feature Scan Page Wrapper
const FeatureScanPage: React.FC<{ tool?: string }> = ({ tool }) => {
  const { tool: urlTool } = useParams<{ tool: string }>();
  const featureKey = tool || urlTool;
  
  if (!featureKey) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Feature Tool</h1>
        <p className="text-gray-600">No tool specified in the URL.</p>
      </div>
    );
  }

  return <FeatureScanContainer featureKey={featureKey} className="w-full" />;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Root route - Basic Scan (Public Access) */}
        <Route
          path="/"
          element={
            <Page>
              <BasicScanContainer />
            </Page>
          }
        />
        {/* Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Page>
                <Dashboard />
              </Page>
            </ProtectedRoute>
          }
        />
        {/* New Global Scan route */}
        <Route
          path="/dashboard/new-scan"
          element={
            <ProtectedRoute>
              <Page>
                <GlobalScanContainer />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <Page>
              <Login />
            </Page>
          }
        />
        <Route
          path="/register"
          element={
            <Page>
              <Register />
            </Page>
          }
        />
        <Route
          path="/about"
          element={
            <Page>
              <About />
            </Page>
          }
        />
        <Route
          path="/contact"
          element={
            <Page>
              <Contact />
            </Page>
          }
        />
        <Route
          path="/terms"
          element={
            <Page>
              <Terms />
            </Page>
          }
        />
        <Route
          path="/privacy"
          element={
            <Page>
              <Privacy />
            </Page>
          }
        />
        {/* Features route for individual tools */}
        <Route
          path="/features/:tool"
          element={
            <Page>
              <FeatureScanPage />
            </Page>
          }
        />
        <Route
          path="/compare"
          element={
            <Page>
              <Compare />
            </Page>
          }
        />
        <Route
          path="/link-checker"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="link-checker" />
              </Page>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rank-tracker"
          element={
            <ProtectedRoute>
              <Page>
                <RankTracker />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Page>
                <History />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:scanId"
          element={
            <ProtectedRoute>
              <Page>
                <Results />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Page>
                <Settings />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Page>
                <Profile />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/readability"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="readability" />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Security Headers Checker Route - Protected */}
        <Route
          path="/security-headers"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="security-headers" />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Multi-Language SEO Checker Route - Protected */}
        <Route
          path="/multi-language-seo"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="multi-language-seo" />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Open Graph Validator Route - Protected */}
        <Route
          path="/og-validator"
          element={
            <ProtectedRoute>
              <Page>
                <OGValidator />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Twitter Card Validator Route - Protected */}
        <Route
          path="/twitter-card"
          element={
            <ProtectedRoute>
              <Page>
                <TwitterCardValidator />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Social Share Tracker Route - Protected */}
        <Route
          path="/share-tracker"
          element={
            <ProtectedRoute>
              <Page>
                <SocialShareTracker />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Social Presence Validator Route - Protected */}
        <Route
          path="/social-presence"
          element={
            <ProtectedRoute>
              <Page>
                <SocialPresenceValidator />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Pinterest Rich Pin Validator Route - Protected */}
        <Route
          path="/pinterest-rich-pin"
          element={
            <ProtectedRoute>
              <Page>
                <PinterestRichPinValidator />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Accessibility Checker Route - Protected */}
        <Route
          path="/accessibility"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="accessibility" />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/toxic-backlinks"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="toxic-backlinks" />
              </Page>
            </ProtectedRoute>
          }
        />
        <Route
          path="/duplicate-content"
          element={
            <ProtectedRoute>
              <Page>
                <FeatureScanPage tool="duplicate-content" />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Pricing Page - Public */}
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <Page>
                <ChartsGallery />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Alert Settings Route - Protected */}
        <Route
          path="/alert-settings"
          element={
            <ProtectedRoute>
              <Page>
                <AlertSettings />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Alerts Dashboard Route - Protected */}
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Page>
                <AlertsDashboard />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Pricing Page - Public */}
        <Route
          path="/pricing"
          element={
            <Page>
              <PricingPremium />
            </Page>
          }
        />

        {/* Checkout Page - Protected */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Page>
                <Checkout />
              </Page>
            </ProtectedRoute>
          }
        />

        {/* Refund Policy Page - Public */}
        <Route
          path="/refund-policy"
          element={
            <Page>
              <RefundPolicy />
            </Page>
          }
        />

        {/* Results route - Global Scan Only */}

        {/* 404 - Catch all route */}
        <Route
          path="*"
          element={
            <Page>
              <NotFound />
            </Page>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ApiProvider>
          <Layout>
            <React.Suspense
              fallback={
                <div className="flex justify-center items-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <AnimatedRoutes />
            </React.Suspense>
          </Layout>
        </ApiProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
