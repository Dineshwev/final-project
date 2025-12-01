// Firebase Authentication Manager
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Get Firebase configuration from meta tags
function getFirebaseConfig() {
  const getMetaValue = (name) => {
    const meta = document.querySelector(`meta[name="env-FIREBASE_${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  };
  
  return {
    apiKey: getMetaValue('API_KEY'),
    authDomain: getMetaValue('AUTH_DOMAIN'),
    projectId: getMetaValue('PROJECT_ID'),
    storageBucket: getMetaValue('STORAGE_BUCKET'),
    messagingSenderId: getMetaValue('MESSAGING_SENDER_ID'),
    appId: getMetaValue('APP_ID'),
    measurementId: getMetaValue('MEASUREMENT_ID')
  };
}

// Firebase configuration
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Authentication state observer
function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    const authStatus = document.querySelector('.auth-status');
    const userMenu = document.querySelector('.user-menu');
    const restrictedElements = document.querySelectorAll('.auth-required');
    
    if (user) {
      // User is signed in
      console.log("User is signed in:", user.displayName || user.email);
      
      // Update user profile elements
      const userNameElements = document.querySelectorAll('.user-name');
      const userImage = document.querySelector('.auth-menu-toggle img');
      
      userNameElements.forEach(el => {
        if (el) el.textContent = user.displayName || user.email.split('@')[0];
      });
      
      if (userImage && user.photoURL) {
        userImage.src = user.photoURL;
      }
      
      // Show user menu, hide login/register buttons
      if (authStatus) authStatus.classList.add('hidden');
      if (userMenu) userMenu.classList.remove('hidden');
      
      // Show restricted elements
      restrictedElements.forEach(el => {
        if (el) el.classList.remove('hidden');
      });
      
    } else {
      // User is signed out
      console.log("User is signed out");
      
      // Hide user menu, show login/register buttons
      if (authStatus) authStatus.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
      
      // Hide restricted elements
      restrictedElements.forEach(el => {
        if (el) el.classList.add('hidden');
      });
      
      // Redirect from protected pages
      const protectedPages = ['/settings.html', '/history.html', '/results.html', '/profile.html'];
      const currentPath = window.location.pathname;
      
      for (const page of protectedPages) {
        if (currentPath.endsWith(page)) {
          window.location.href = 'login.html';
          break;
        }
      }
    }
  });
}

// Handle logout
function setupLogout() {
  const logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          window.location.href = 'index.html';
        } catch (error) {
          console.error("Error signing out:", error);
        }
      });
    }
  });
}

// Setup dropdown menu behavior
function setupUserMenuToggle() {
  const userMenuToggle = document.querySelector('.auth-menu-toggle');
  const userMenuDropdown = document.querySelector('.auth-menu-dropdown');
  
  if (userMenuToggle && userMenuDropdown) {
    userMenuToggle.addEventListener('click', () => {
      userMenuDropdown.classList.toggle('show');
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!userMenuToggle.contains(e.target) && !userMenuDropdown.contains(e.target)) {
        userMenuDropdown.classList.remove('show');
      }
    });
  }
}

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  setupLogout();
  setupUserMenuToggle();
});

// Export auth functions
export const firebaseAuth = {
  getCurrentUser: () => auth.currentUser,
  signOut: () => signOut(auth)
};