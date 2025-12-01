/**
 * Authentication module for SEO Pulse
 * Handles user login, registration, and session management
 */

// Authentication state management
const auth = {
  isAuthenticated: false,
  user: null,
  token: null,
  
  // Initialize auth from localStorage
  init() {
    const token = localStorage.getItem('seo_token');
    const user = JSON.parse(localStorage.getItem('seo_user') || 'null');
    
    if (token && user) {
      this.isAuthenticated = true;
      this.token = token;
      this.user = user;
      this.updateUI();
      return true;
    }
    
    return false;
  },
  
  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      this.isAuthenticated = true;
      this.token = data.token;
      this.user = data.user;
      
      // Save to localStorage
      localStorage.setItem('seo_token', data.token);
      localStorage.setItem('seo_user', JSON.stringify(data.user));
      
      this.updateUI();
      return true;
      
    } catch (error) {
      console.error('Login error:', error.message);
      return { error: error.message };
    }
  },
  
  // Register new user
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      return true;
      
    } catch (error) {
      console.error('Registration error:', error.message);
      return { error: error.message };
    }
  },
  
  // Logout user
  logout() {
    this.isAuthenticated = false;
    this.token = null;
    this.user = null;
    localStorage.removeItem('seo_token');
    localStorage.removeItem('seo_user');
    this.updateUI();
    
    // Redirect to login if needed
    if (window.location.pathname !== '/' && 
        window.location.pathname !== '/index.html' && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
      window.location.href = '/login.html';
    }
  },
  
  // Update UI based on auth state
  updateUI() {
    const authLinks = document.querySelectorAll('.auth-status');
    const userMenus = document.querySelectorAll('.user-menu');
    const restrictedElements = document.querySelectorAll('.auth-required');
    
    if (this.isAuthenticated) {
      // Update user profile elements
      const userNameElements = document.querySelectorAll('.user-name');
      const userEmailElements = document.querySelectorAll('.user-email');
      
      userNameElements.forEach(el => {
        if (el) el.textContent = this.user.name;
      });
      
      userEmailElements.forEach(el => {
        if (el) el.textContent = this.user.email;
      });
      
      // Show user menu, hide login/register buttons
      authLinks.forEach(el => {
        if (el) el.classList.add('hidden');
      });
      
      userMenus.forEach(el => {
        if (el) el.classList.remove('hidden');
      });
      
      // Show restricted elements
      restrictedElements.forEach(el => {
        if (el) el.classList.remove('hidden');
      });
      
    } else {
      // Hide user menu, show login/register buttons
      authLinks.forEach(el => {
        if (el) el.classList.remove('hidden');
      });
      
      userMenus.forEach(el => {
        if (el) el.classList.add('hidden');
      });
      
      // Hide restricted elements
      restrictedElements.forEach(el => {
        if (el) el.classList.add('hidden');
      });
    }
  },
  
  // Get auth headers for API requests
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  },
  
  // Check if token is valid
  async validateToken() {
    if (!this.token) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error.message);
      this.logout();
      return false;
    }
  }
};

// DOM Ready - Initialize Auth
document.addEventListener('DOMContentLoaded', () => {
  auth.init();
  
  // Setup login form if present
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const errorMsg = document.getElementById('login-error');
      
      // Basic validation
      if (!email || !password) {
        if (errorMsg) errorMsg.textContent = 'Please enter both email and password';
        return;
      }
      
      // Visual feedback
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';
      }
      
      const result = await auth.login(email, password);
      
      if (result === true) {
        window.location.href = '/';
      } else {
        if (errorMsg) errorMsg.textContent = result.error || 'Login failed. Please check your credentials.';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      }
    });
  }
  
  // Setup registration form if present
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const errorMsg = document.getElementById('register-error');
      
      // Basic validation
      if (!name || !email || !password) {
        if (errorMsg) errorMsg.textContent = 'Please fill all required fields';
        return;
      }
      
      if (password !== passwordConfirm) {
        if (errorMsg) errorMsg.textContent = 'Passwords do not match';
        return;
      }
      
      // Visual feedback
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';
      }
      
      const result = await auth.register(name, email, password);
      
      if (result === true) {
        window.location.href = '/login.html?registered=true';
      } else {
        if (errorMsg) errorMsg.textContent = result.error || 'Registration failed. Please try again.';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
        }
      }
    });
  }
  
  // Handle logout button clicks
  const logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
      });
    }
  });
  
  // Toggle user menu dropdown
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
});

// Check for successful registration parameter
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const registered = params.get('registered');
  const loginSuccess = document.getElementById('login-success');
  
  if (registered === 'true' && loginSuccess) {
    loginSuccess.textContent = 'Registration successful! Please login with your new account.';
    loginSuccess.classList.remove('hidden');
  }
});