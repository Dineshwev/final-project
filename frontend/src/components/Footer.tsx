// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaInstagram } from "../components/Icons";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Healthy SEO</h3>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
              Advanced website health analyzer to improve your site's SEO,
              security, and performance.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-gray-400 flex-shrink-0" size={18} />
                <a
                  href="mailto:contact@healthyseo.tech"
                  className="text-gray-400 hover:text-white text-sm sm:text-base break-all sm:break-normal"
                >
                  contact@healthyseo.tech
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <FaInstagram className="text-gray-400 flex-shrink-0" size={18} />
                <a
                  href="https://instagram.com/healthyseo.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm sm:text-base"
                >
                  @healthyseo.tech
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  Scan History
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors touch-manipulation">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; {currentYear} Healthy SEO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
