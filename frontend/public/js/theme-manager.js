// Theme Manager - Dark/Light Mode Toggle System
// This script should be loaded in the <head> to prevent flash of unstyled content

(function () {
  const THEME_KEY = "seo-analyzer-theme";
  const DARK_THEME = "dark";
  const LIGHT_THEME = "light";

  // Theme Manager Object
  const ThemeManager = {
    // Get current theme from localStorage or default to light
    getCurrentTheme: function () {
      return localStorage.getItem(THEME_KEY) || LIGHT_THEME;
    },

    // Set theme and save to localStorage
    setTheme: function (theme) {
      const root = document.documentElement;

      if (theme === DARK_THEME) {
        root.classList.add("dark-mode");
        root.classList.remove("light-mode");
      } else {
        root.classList.add("light-mode");
        root.classList.remove("dark-mode");
      }

      localStorage.setItem(THEME_KEY, theme);

      // Dispatch custom event for components that need to react
      window.dispatchEvent(
        new CustomEvent("themeChanged", { detail: { theme } })
      );
    },

    // Toggle between themes
    toggleTheme: function () {
      const currentTheme = this.getCurrentTheme();
      const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
      this.setTheme(newTheme);
      return newTheme;
    },

    // Initialize theme on page load
    init: function () {
      const savedTheme = this.getCurrentTheme();
      this.setTheme(savedTheme);
    },
  };

  // Apply theme immediately to prevent flash
  ThemeManager.init();

  // Make ThemeManager globally available
  window.ThemeManager = ThemeManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializeThemeToggleButtons();
    });
  } else {
    initializeThemeToggleButtons();
  }

  // Initialize all theme toggle buttons
  function initializeThemeToggleButtons() {
    const toggleButtons = document.querySelectorAll(".theme-toggle-btn");

    toggleButtons.forEach(function (button) {
      // Update button icon based on current theme
      updateButtonIcon(button);

      // Add click event listener
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const newTheme = ThemeManager.toggleTheme();

        // Update all toggle buttons on the page
        document
          .querySelectorAll(".theme-toggle-btn")
          .forEach(updateButtonIcon);

        // Add animation class
        button.classList.add("theme-toggle-animate");
        setTimeout(function () {
          button.classList.remove("theme-toggle-animate");
        }, 300);
      });
    });
  }

  // Update button icon based on theme
  function updateButtonIcon(button) {
    const currentTheme = ThemeManager.getCurrentTheme();
    const iconContainer = button.querySelector(".theme-icon");

    if (!iconContainer) return;

    if (currentTheme === DARK_THEME) {
      // Show sun icon (to switch to light mode)
      iconContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="theme-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `;
      button.setAttribute("title", "Switch to Light Mode");
      button.setAttribute("aria-label", "Switch to Light Mode");
    } else {
      // Show moon icon (to switch to dark mode)
      iconContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="theme-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
      button.setAttribute("title", "Switch to Dark Mode");
      button.setAttribute("aria-label", "Switch to Dark Mode");
    }
  }

  // Listen for theme changes and update buttons
  window.addEventListener("themeChanged", function () {
    document.querySelectorAll(".theme-toggle-btn").forEach(updateButtonIcon);
  });

  // Re-initialize buttons when new content is added dynamically
  window.addEventListener("load", function () {
    initializeThemeToggleButtons();
  });
})();
