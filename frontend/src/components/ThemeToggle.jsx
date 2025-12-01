// ThemeToggle.jsx - React Component for Theme Toggle Button
import React, { useState, useEffect } from "react";

const ThemeToggle = ({ className = "", position = "fixed" }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Get initial theme from ThemeManager
    if (window.ThemeManager) {
      setTheme(window.ThemeManager.getCurrentTheme());
    }

    // Listen for theme changes
    const handleThemeChange = (e) => {
      setTheme(e.detail.theme);
    };

    window.addEventListener("themeChanged", handleThemeChange);

    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
    };
  }, []);

  const handleToggle = () => {
    if (window.ThemeManager) {
      const newTheme = window.ThemeManager.toggleTheme();
      setTheme(newTheme);
    }
  };

  const buttonStyles =
    position === "fixed" ? "fixed top-4 right-4 z-50" : "relative";

  return (
    <button
      onClick={handleToggle}
      className={`theme-toggle-btn ${buttonStyles} ${className}`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={
        theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
      }
    >
      <span className="theme-icon">
        {theme === "dark" ? (
          // Sun icon for light mode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="theme-icon-svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="theme-icon-svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
