// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaInstagram } from "../components/Icons";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white mt-auto border-t border-slate-800">
      {/* Subtle divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Healthy SEO</h3>
                <p className="text-sm text-slate-400">Professional Analytics</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 text-base leading-relaxed max-w-md">
              Advanced website health analyzer to improve your site's SEO,
              security, and performance with professional-grade tools.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                  <FaEnvelope className="text-slate-400 group-hover:text-white" size={16} />
                </div>
                <a
                  href="mailto:contact@healthyseo.tech"
                  className="text-slate-400 hover:text-white transition-colors font-medium"
                >
                  contact@healthyseo.tech
                </a>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                  <FaInstagram className="text-slate-400 group-hover:text-white" size={16} />
                </div>
                <a
                  href="https://instagram.com/healthyseo.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors font-medium"
                >
                  @healthyseo.tech
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                  Scan History
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-purple-300 transition-colors"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-purple-300 transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center group">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-purple-300 transition-colors"></span>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Footer Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">
              &copy; {currentYear} Healthy SEO. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-xs text-slate-500">Made with ❤️ for better SEO</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
