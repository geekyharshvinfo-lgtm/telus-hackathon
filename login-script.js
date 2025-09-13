// Login script for authentication (login.html)

// Load the data script and initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load mock data script
    const script = document.createElement('script');
    script.src = 'data.js';
    document.head.appendChild(script);
    
    // Wait for data to load then initialize
    script.onload = function() {
        initializeLoginPage();
    };
});

function initializeLoginPage() {
    setupLoginForm();
    checkIfAlreadyLoggedIn();
}

function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

function checkIfAlreadyLoggedIn() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const isAdminLogin = document.getElementById('admin-login').checked;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        try {
            const user = DataManager.authenticateUser(email, password);
            
            if (!user) {
                showMessage('Invalid email or password', 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }
            
            // Check if admin login is required but user is not admin
            if (isAdminLogin && user.role !== 'admin') {
                showMessage('Admin privileges required for admin login', 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }
            
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect based on user role and login type
            setTimeout(() => {
                if (user.role === 'admin' && isAdminLogin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
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
    button.disabled = false;
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.login-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} login-message`;
    messageDiv.textContent = message;
    
    // Insert before the form
    const form = document.getElementById('login-form');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto-remove after 5 seconds (except for success messages during redirect)
    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Demo credential auto-fill functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.alert-info')) {
        const demoText = e.target.textContent;
        if (demoText.includes('user@demo.com')) {
            document.getElementById('email').value = 'user@demo.com';
            document.getElementById('password').value = 'password123';
            document.getElementById('admin-login').checked = false;
        } else if (demoText.includes('admin@demo.com')) {
            document.getElementById('email').value = 'admin@demo.com';
            document.getElementById('password').value = 'admin123';
            document.getElementById('admin-login').checked = true;
        }
    }
});

// Add some visual feedback for the admin checkbox
document.addEventListener('change', function(e) {
    if (e.target.id === 'admin-login') {
        const form = document.getElementById('login-form');
        if (e.target.checked) {
            form.style.borderLeft = '4px solid #dc3545';
            showMessage('Admin login mode enabled', 'info');
        } else {
            form.style.borderLeft = 'none';
        }
    }
});

// Password visibility toggle (optional enhancement)
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
}

// Add password toggle button if needed
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn btn-outline-secondary btn-sm';
        toggleBtn.textContent = '👁️';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.right = '10px';
        toggleBtn.style.top = '50%';
        toggleBtn.style.transform = 'translateY(-50%)';
        toggleBtn.onclick = togglePasswordVisibility;
        
        // Make password field container relative
        passwordField.parentNode.style.position = 'relative';
        passwordField.style.paddingRight = '50px';
        passwordField.parentNode.appendChild(toggleBtn);
    }
});
