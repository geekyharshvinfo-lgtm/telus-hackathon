// Login script for Supabase authentication (login.html)

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
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

async function checkIfAlreadyLoggedIn() {
    try {
        if (!window.SupabaseService) {
            console.log('Supabase service not available yet');
            return;
        }
        
        const { data: { user } } = await window.SupabaseService.supabase.auth.getUser();
        if (user) {
            // Get user profile to check role
            const userProfile = await window.SupabaseService.getProfile(user.id);
            if (userProfile && userProfile.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

async function handleLogin(e) {
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
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Check if Supabase service is available
        if (!window.SupabaseService) {
            throw new Error('Supabase service not available. Please refresh the page.');
        }
        
        // Attempt to sign in with Supabase
        const { data, error } = await window.SupabaseService.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        if (!data.user) {
            throw new Error('Login failed - no user data received');
        }
        
        console.log('✅ User signed in successfully:', data.user.id);
        
        // Get user profile to check role
        const userProfile = await window.SupabaseService.getProfile(data.user.id);
        
        if (!userProfile) {
            console.warn('⚠️ User profile not found, checking localStorage fallback');
            // Try localStorage fallback for demo users
            const result = await window.SupabaseService.signIn(email, password);
            if (result.success && result.user) {
                const userRole = result.user.role;
                // Check role-based redirects with fallback user data
                if (isAdminLogin && userRole !== 'admin') {
                    showMessage('Admin privileges required for admin login', 'error');
                    resetSubmitButton(submitBtn, originalText);
                    return;
                }
                
                if (!isAdminLogin && userRole === 'admin') {
                    showMessage('Please use admin login for administrator accounts', 'error');
                    resetSubmitButton(submitBtn, originalText);
                    return;
                }
                
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    if (userRole === 'admin' && isAdminLogin) {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                }, 1500);
                return;
            }
            throw new Error('User profile not found. Please contact support.');
        }
        
        console.log('✅ User profile found:', userProfile);
        
        // Check if admin login is required but user is not admin
        if (isAdminLogin && userProfile.role !== 'admin') {
            showMessage('Admin privileges required for admin login', 'error');
            resetSubmitButton(submitBtn, originalText);
            return;
        }
        
        // Check if user is trying regular login but is admin
        if (!isAdminLogin && userProfile.role === 'admin') {
            showMessage('Please use admin login for administrator accounts', 'error');
            resetSubmitButton(submitBtn, originalText);
            return;
        }
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect based on user role and login type
        setTimeout(() => {
            if (userProfile.role === 'admin' && isAdminLogin) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and confirm your account';
        } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
        resetSubmitButton(submitBtn, originalText);
    }
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
