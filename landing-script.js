// Landing page script for TELUS Digital login

let selectedLoginType = null;

// Initialize the landing page
document.addEventListener('DOMContentLoaded', function() {
    // Load data script first
    const script = document.createElement('script');
    script.src = 'data.js';
    document.head.appendChild(script);
    
    script.onload = function() {
        initializeLandingPage();
    };
});

function initializeLandingPage() {
    setupEventListeners();
    checkExistingSession();
}

function setupEventListeners() {
    // Form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Demo credentials click
    const demoCredentials = document.querySelector('.demo-credentials');
    if (demoCredentials) {
        demoCredentials.addEventListener('click', handleDemoCredentialsClick);
    }
}

function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        // Redirect based on user role
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }
}

function selectLoginType(type) {
    selectedLoginType = type;
    
    // Update UI to show selected state
    const options = document.querySelectorAll('.login-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.currentTarget.classList.add('selected');
    
    // Show login form
    const formContainer = document.getElementById('loginFormContainer');
    if (formContainer) {
        formContainer.style.display = 'block';
        
        // Update button text based on selection
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.textContent = `Continue as ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        }
        
        // Scroll to form
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Auto-fill demo credentials based on selection
    if (type === 'admin') {
        document.getElementById('email').value = 'admin@demo.com';
        document.getElementById('password').value = 'admin123';
    } else {
        document.getElementById('email').value = 'user@demo.com';
        document.getElementById('password').value = 'password123';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    if (!selectedLoginType) {
        showMessage('Please select a login type first', 'error');
        return;
    }
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('continueBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate authentication delay
    setTimeout(() => {
        try {
            const user = DataManager.authenticateUser(email, password);
            
            if (!user) {
                showMessage('Invalid email or password', 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }
            
            // Check if user role matches selected login type
            if (selectedLoginType === 'admin' && user.role !== 'admin') {
                showMessage('This account does not have admin privileges', 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }
            
            if (selectedLoginType === 'user' && user.role === 'admin') {
                showMessage('Admin accounts should use Admin login', 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }
            
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            }, 1500);
            
        } catch (error) {
            showMessage('Login error: ' + error.message, 'error');
            resetSubmitButton(submitBtn, originalText);
        }
    }, 1000);
}

function resetSubmitButton(button, originalText) {
    button.textContent = originalText;
    button.classList.remove('loading');
    button.disabled = false;
}

function handleDemoCredentialsClick(e) {
    const text = e.target.textContent;
    
    if (text.includes('user@demo.com')) {
        // Auto-select user login type
        const userOption = document.querySelector('.login-option[onclick*="user"]');
        if (userOption) {
            userOption.click();
        }
        document.getElementById('email').value = 'user@demo.com';
        document.getElementById('password').value = 'password123';
    } else if (text.includes('admin@demo.com')) {
        // Auto-select admin login type
        const adminOption = document.querySelector('.login-option[onclick*="admin"]');
        if (adminOption) {
            adminOption.click();
        }
        document.getElementById('email').value = 'admin@demo.com';
        document.getElementById('password').value = 'admin123';
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the welcome card
    const welcomeCard = document.querySelector('.welcome-card');
    welcomeCard.insertBefore(messageDiv, welcomeCard.firstChild);
    
    // Auto-remove after 5 seconds (except for success messages during redirect)
    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Add visual feedback for form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add focus effects to form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
        });
    });
    
    // Add keyboard navigation for login options
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('login-option')) {
            e.target.click();
        }
    });
});

// Add accessibility attributes
document.addEventListener('DOMContentLoaded', function() {
    const loginOptions = document.querySelectorAll('.login-option');
    loginOptions.forEach((option, index) => {
        option.setAttribute('tabindex', '0');
        option.setAttribute('role', 'button');
        option.setAttribute('aria-label', option.querySelector('h3').textContent);
    });
});
