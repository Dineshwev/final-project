import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationBell";

const Navigation = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFeaturesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mainNavLinks = [
    { path: "/", label: "Dashboard", icon: HomeIcon },
    { path: "/dashboard/new-scan", label: "New Scan", icon: MagnifyingGlassIcon },
    { path: "/pricing", label: "Pricing", icon: SparklesIcon },
  ];

  const featureLinks = [
    { path: "/compare", label: "Compare", icon: ChartBarIcon },
    { path: "/features/schema", label: "Schema Validator", icon: ChartBarIcon },
    {
      path: "/features/backlinks",
      label: "Toxic Backlink Detector",
      icon: ChartBarIcon,
    },
    {
      path: "/features/accessibility",
      label: "Accessibility (WCAG)",
      icon: ChartBarIcon,
    },
    {
      path: "/features/multilang",
      label: "Multi-Language SEO",
      icon: ChartBarIcon,
    },
    { path: "/charts", label: "Charts Gallery", icon: ChartBarIcon },
    { path: "/rank-tracker", label: "Rank Tracker", icon: ChartBarIcon },
    { path: "/og-validator", label: "OG Validator", icon: ChartBarIcon },
    { path: "/twitter-card", label: "Twitter Card", icon: ChartBarIcon },
    { path: "/share-tracker", label: "Share Tracker", icon: ChartBarIcon },
    { path: "/social-presence", label: "Social Presence", icon: ChartBarIcon },
    {
      path: "/pinterest-rich-pin",
      label: "Pinterest Rich Pins",
      icon: ChartBarIcon,
    },
    },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl p-1.5 sm:p-2 transform transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col hidden xs:flex">
                <span className="text-white font-bold text-lg sm:text-xl tracking-tight leading-none">
                  SEO Health
                </span>
                <span className="text-xs text-cyan-400 font-medium hidden sm:block">
                  Professional Analytics
                </span>
              </div>
              <div className="flex xs:hidden">
                <span className="text-white font-bold text-lg tracking-tight">
                  SEO
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {/* Main Nav Links */}
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              const isNewScan = link.label === "New Scan";
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 xl:px-5 py-2.5 xl:py-3 rounded-xl text-sm xl:text-base font-semibold transition-all whitespace-nowrap ${
                    isNewScan
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 ring-2 ring-blue-500/20"
                      : active
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-sm hover:scale-102"
                  }`}
                >
                  <Icon className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span>{link.label}</span>
                  {isNewScan && (
                    <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </Link>
              );
            })}

            {/* Features Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className={`flex items-center space-x-2 px-4 xl:px-5 py-2.5 xl:py-3 rounded-xl text-sm xl:text-base font-semibold transition-all whitespace-nowrap ${
                  featureLinks.some((f) => isActive(f.path))
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-sm hover:scale-102"
                }`}
              >
                <SparklesIcon className="h-4 w-4 xl:h-5 xl:w-5" />
                <span>Features</span>
                <ChevronDownIcon
                  className={`h-3 w-3 xl:h-4 xl:w-4 transition-transform duration-300 ${
                    featuresOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Enhanced Dropdown Menu */}
              {featuresOpen && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 py-3 z-50 animate-scaleIn">
                  <div className="px-5 py-3 border-b border-white/10">
                    <p className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      SEO Analysis Tools
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Professional website analysis features</p>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar py-2">
                    {featureLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.path);
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setFeaturesOpen(false)}
                          className={`flex items-center space-x-3 px-5 py-3 text-sm font-medium transition-all mx-2 rounded-xl group ${
                            active
                              ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg"
                              : "text-slate-300 hover:bg-white/15 hover:text-white hover:scale-102"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                          </div>
                          <span className="font-medium">{link.label}</span>
                          {!active && (
                            <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-white/10">
                    <p className="text-xs text-slate-400 text-center">More tools coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side controls */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Link */}
            <Link
              to="/profile"
              className="group relative flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 transition-all duration-300 border border-white/20 hover:border-transparent shadow-lg hover:shadow-xl"
              aria-label="Profile"
            >
              <div className="relative">
                <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-white/50 transition-all shadow-md">
                  <svg
                    className="w-4 h-4 xl:w-5 xl:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 xl:w-3 xl:h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse shadow-sm"></span>
              </div>
              <span className="text-white group-hover:text-white font-semibold text-sm xl:text-base transition-colors hidden xl:inline">
                Profile
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/20 p-2.5 rounded-lg transition-all backdrop-blur-sm touch-manipulation"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-3 pt-3 pb-4 space-y-2">
            {/* Main Nav Links */}
            {mainNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium touch-manipulation ${
                    active
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-white/10 hover:text-white active:bg-white/20"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Features Section */}
            <div className="pt-2">
              <button
                onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-base font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-5 w-5" />
                  <span>Features</span>
                </div>
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${
                    mobileFeaturesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Features Submenu */}
              {mobileFeaturesOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {featureLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium ${
                          active
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-t border-white/10 bg-slate-800/50">
            <div className="px-4 py-4">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-2xl transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </div>
                <span className="flex-1">My Profile</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
