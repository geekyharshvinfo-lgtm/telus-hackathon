// Signup script for user registration (signup.html)

// Load the data script and initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load mock data script
    const script = document.createElement('script');
    script.src = 'data.js';
    document.head.appendChild(script);
    
    // Wait for data to load then initialize
    script.onload = function() {
        initializeSignupPage();
    };
});

function initializeSignupPage() {
    setupSignupForm();
    checkIfAlreadyLoggedIn();
}

function setupSignupForm() {
    const form = document.getElementById('signup-form');
    if (form) {
        form.addEventListener('submit', handleSignup);
    }
    
    // Add real-time validation
    setupRealTimeValidation();
}

function checkIfAlreadyLoggedIn() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'index.html';
    }
}

function setupRealTimeValidation() {
    const confirmPassword = document.getElementById('confirm-password');
    const password = document.getElementById('password');
    
    if (confirmPassword && password) {
        confirmPassword.addEventListener('input', function() {
            validatePasswordMatch();
        });
        
        password.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
    
    const email = document.getElementById('email');
    if (email) {
        email.addEventListener('blur', function() {
            validateEmail();
        });
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const confirmField = document.getElementById('confirm-password');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmField.setCustomValidity('Passwords do not match');
        confirmField.classList.add('is-invalid');
        showFieldError(confirmField, 'Passwords do not match');
    } else {
        confirmField.setCustomValidity('');
        confirmField.classList.remove('is-invalid');
        hideFieldError(confirmField);
    }
}

function validateEmail() {
    const email = document.getElementById('email').value;
    const emailField = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        emailField.setCustomValidity('Please enter a valid email address');
        emailField.classList.add('is-invalid');
        showFieldError(emailField, 'Please enter a valid email address');
    } else {
        emailField.setCustomValidity('');
        emailField.classList.remove('is-invalid');
        hideFieldError(emailField);
    }
}

function showFieldError(field, message) {
    // Remove existing error message
    hideFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    errorDiv.id = field.id + '-error';
    
    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const existingError = document.getElementById(field.id + '-error');
    if (existingError) {
        existingError.remove();
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validate all fields
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showMessage('Please accept the Terms and Conditions', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#signup-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        try {
            const result = DataManager.registerUser(name, email, password);
            
            if (!result.success) {
                showMessage(result.message, 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }
            
            showMessage('Account created successfully! Redirecting to login...', 'success');
            
            // Redirect to login page after successful registration
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            showMessage('Registration error: ' + error.message, 'error');
            resetSubmitButton(submitBtn, originalText);
        }
    }, 1500);
}

function resetSubmitButton(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.signup-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} signup-message`;
    messageDiv.textContent = message;
    
    // Insert before the form
    const form = document.getElementById('signup-form');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto-remove after 5 seconds (except for success messages during redirect)
    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Password strength indicator
function checkPasswordStrength(password) {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    return {
        score: strength,
        checks: checks,
        text: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] || 'Very Weak'
    };
}

// Add password strength indicator
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        const strengthDiv = document.createElement('div');
        strengthDiv.className = 'password-strength mt-2';
        strengthDiv.innerHTML = `
            <div class="progress" style="height: 5px;">
                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <small class="text-muted">Password strength: <span class="strength-text">Enter password</span></small>
        `;
        passwordField.parentNode.appendChild(strengthDiv);
        
        passwordField.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            const progressBar = strengthDiv.querySelector('.progress-bar');
            const strengthText = strengthDiv.querySelector('.strength-text');
            
            const percentage = (strength.score / 5) * 100;
            progressBar.style.width = percentage + '%';
            
            // Color coding
            progressBar.className = 'progress-bar';
            if (strength.score <= 1) {
                progressBar.classList.add('bg-danger');
            } else if (strength.score <= 2) {
                progressBar.classList.add('bg-warning');
            } else if (strength.score <= 3) {
                progressBar.classList.add('bg-info');
            } else {
                progressBar.classList.add('bg-success');
            }
            
            strengthText.textContent = this.value ? strength.text : 'Enter password';
        });
    }
});
