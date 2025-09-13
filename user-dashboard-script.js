// Enhanced User Dashboard Script with Overview Dashboard

// Global variables
let currentFilter = 'all';
let userStats = {
    viewCount: 0,
    lastVisit: 'Today',
    favoriteCount: 0
};

// Dashboard overview data
let dashboardData = {
    tasks: {
        pending: 2,
        completed: 1,
        total: 3
    },
    documents: {
        pending: 2,
        completed: 1,
        total: 3
    },
    team: {
        totalMembers: 12,
        onlineMembers: 8,
        awayMembers: 2,
        offlineMembers: 2,
        activeProjects: 3
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadUserStats();
    updateOverviewStats();
});

// Initialize dashboard components
function initializeDashboard() {
    checkUserAuth();
    loadUserInfo();
    updateOverviewStats();
    
    // Log dashboard visit
    if (window.DataManager) {
        window.DataManager.logActivity('dashboard', 'User visited dashboard');
    }
}

// Check user authentication
function checkUserAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role === 'admin') {
        // Admin can view user dashboard but show admin badge
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.name + ' (Admin)';
        }
    }
}

// Load user information
function loadUserInfo() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.name;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshActivity);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('profileDropdown');
        const trigger = document.querySelector('.profile-trigger');
        
        if (dropdown && trigger && !trigger.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Update overview statistics
function updateOverviewStats() {
    // Load task data from localStorage
    loadTaskData();
    loadDocumentData();
    
    // Update task statistics
    updateTaskStats();
    updateDocumentStats();
    updateTeamStats();
    updateProgressBars();
    updateOverallProgress();
}

// Load task data from localStorage
function loadTaskData() {
    const taskData = localStorage.getItem('telus_task_status');
    if (taskData) {
        const tasks = JSON.parse(taskData);
        let pending = 0;
        let completed = 0;
        
        Object.values(tasks).forEach(task => {
            if (task.status === 'pending') {
                pending++;
            } else if (task.status === 'completed') {
                completed++;
            }
        });
        
        dashboardData.tasks = {
            pending: pending,
            completed: completed,
            total: pending + completed
        };
    }
}

// Load document data from localStorage
function loadDocumentData() {
    const docData = localStorage.getItem('telus_document_status');
    if (docData) {
        const documents = JSON.parse(docData);
        let pending = 0;
        let completed = 0;
        
        Object.values(documents).forEach(doc => {
            if (doc.status === 'pending') {
                pending++;
            } else if (doc.status === 'completed') {
                completed++;
            }
        });
        
        dashboardData.documents = {
            pending: pending,
            completed: completed,
            total: pending + completed
        };
    }
}

// Update task statistics in UI
function updateTaskStats() {
    const tasksPending = document.getElementById('tasksPending');
    const tasksCompleted = document.getElementById('tasksCompleted');
    const tasksProgress = document.getElementById('tasksProgress');
    const tasksProgressText = document.getElementById('tasksProgressText');
    
    if (tasksPending) tasksPending.textContent = dashboardData.tasks.pending;
    if (tasksCompleted) tasksCompleted.textContent = dashboardData.tasks.completed;
    
    // Calculate progress percentage
    const progressPercentage = dashboardData.tasks.total > 0 
        ? Math.round((dashboardData.tasks.completed / dashboardData.tasks.total) * 100)
        : 0;
    
    if (tasksProgress) tasksProgress.style.width = progressPercentage + '%';
    if (tasksProgressText) tasksProgressText.textContent = progressPercentage + '% Complete';
}

// Update document statistics in UI
function updateDocumentStats() {
    const docsPending = document.getElementById('docsPending');
    const docsCompleted = document.getElementById('docsCompleted');
    const docsProgress = document.getElementById('docsProgress');
    const docsProgressText = document.getElementById('docsProgressText');
    
    if (docsPending) docsPending.textContent = dashboardData.documents.pending;
    if (docsCompleted) docsCompleted.textContent = dashboardData.documents.completed;
    
    // Calculate progress percentage
    const progressPercentage = dashboardData.documents.total > 0 
        ? Math.round((dashboardData.documents.completed / dashboardData.documents.total) * 100)
        : 0;
    
    if (docsProgress) docsProgress.style.width = progressPercentage + '%';
    if (docsProgressText) docsProgressText.textContent = progressPercentage + '% Complete';
}

// Update team statistics in UI
function updateTeamStats() {
    // Team stats are static for demo purposes
    // In a real application, these would come from an API
}

// Update progress bars
function updateProgressBars() {
    // Don't reset progress bars - they should maintain their values
    // The progress bars are already set with correct values in updateTaskStats() and updateDocumentStats()
    // No animation needed as it causes the bars to reset to zero
}

// Update overall progress circular indicator
function updateOverallProgress() {
    const overallPercentage = document.getElementById('overallPercentage');
    const progressRingCircle = document.querySelector('.progress-ring-circle');
    
    // Calculate overall progress as average of tasks and documents
    const taskProgress = dashboardData.tasks.total > 0 
        ? (dashboardData.tasks.completed / dashboardData.tasks.total) * 100
        : 0;
    
    const docProgress = dashboardData.documents.total > 0 
        ? (dashboardData.documents.completed / dashboardData.documents.total) * 100
        : 0;
    
    // Average of both sections
    const overallProgress = Math.round((taskProgress + docProgress) / 2);
    
    // Update percentage text
    if (overallPercentage) {
        overallPercentage.textContent = overallProgress + '%';
    }
    
    // Update circular progress ring
    if (progressRingCircle) {
        const radius = 32; // radius from SVG
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (overallProgress / 100) * circumference;
        
        progressRingCircle.style.strokeDasharray = circumference;
        progressRingCircle.style.strokeDashoffset = offset;
    }
}

// Refresh activity feed
function refreshActivity() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    }
    
    // Simulate refresh delay
    setTimeout(() => {
        updateOverviewStats();
        
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
        
        // Show success message
        showMessage('Dashboard refreshed successfully!', 'success');
        
        // Log refresh activity
        if (window.DataManager) {
            window.DataManager.logActivity('refresh', 'User manually refreshed dashboard');
        }
    }, 1000);
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.dashboard-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} dashboard-message`;
    messageDiv.textContent = message;
    
    // Insert at top of dashboard content
    const dashboardContent = document.querySelector('.content-container');
    if (dashboardContent) {
        dashboardContent.insertBefore(messageDiv, dashboardContent.firstChild);
    }
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Load user stats from localStorage
function loadUserStats() {
    const savedStats = localStorage.getItem('userDashboardStats');
    if (savedStats) {
        userStats = { ...userStats, ...JSON.parse(savedStats) };
    }
    
    // Load favorites count
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    userStats.favoriteCount = favorites.length;
    
    updateUserStatsDisplay();
}

// Update user stats display
function updateUserStatsDisplay() {
    const viewCount = document.getElementById('viewCount');
    const lastVisit = document.getElementById('lastVisit');
    const favoriteCount = document.getElementById('favoriteCount');
    
    if (viewCount) viewCount.textContent = userStats.viewCount;
    if (lastVisit) lastVisit.textContent = userStats.lastVisit;
    if (favoriteCount) favoriteCount.textContent = userStats.favoriteCount;
}

// Save user stats to localStorage
function saveUserStats() {
    localStorage.setItem('userDashboardStats', JSON.stringify(userStats));
}

// Modal functions
function openContentModal(contentId) {
    const content = contentData.find(item => item.id == contentId);
    if (!content) return;
    
    const modal = document.getElementById('contentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalDate = document.getElementById('modalDate');
    
    if (modal && modalTitle && modalDescription && modalDate) {
        modalTitle.textContent = content.title;
        modalDescription.textContent = content.description;
        modalDate.textContent = content.dateCreated;
        
        if (modalImage && content.imageUrl) {
            modalImage.src = content.imageUrl;
            modalImage.style.display = 'block';
        } else if (modalImage) {
            modalImage.style.display = 'none';
        }
        
        modal.style.display = 'flex';
        
        // Update view count
        userStats.viewCount++;
        updateUserStatsDisplay();
        saveUserStats();
        
        // Log view activity
        if (window.DataManager) {
            window.DataManager.logActivity('view', `Viewed content: ${content.title}`);
        }
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('contentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add to favorites
function addToFavorites() {
    userStats.favoriteCount++;
    updateUserStatsDisplay();
    saveUserStats();
    
    // Log favorite activity
    if (window.DataManager) {
        window.DataManager.logActivity('favorite', 'Added content to favorites');
    }
    
    showMessage('Added to favorites!', 'success');
}

// Logout function
function logout() {
    // Log logout activity
    if (window.DataManager) {
        window.DataManager.logActivity('logout', 'User logged out from dashboard');
    }
    
    // Update last visit time
    userStats.lastVisit = new Date().toLocaleDateString();
    saveUserStats();
    
    // Clear user session
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Profile dropdown functionality
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Go to profile function (placeholder)
function goToProfile() {
    // Close dropdown first
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    showMessage('Profile section coming soon!', 'info');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('contentModal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Listen for storage changes to update dashboard when data changes
window.addEventListener('storage', function(e) {
    if (e.key === 'telus_task_status' || e.key === 'telus_document_status') {
        updateOverviewStats();
    }
});

// Export functions for global access
window.refreshActivity = refreshActivity;
window.closeModal = closeModal;
window.addToFavorites = addToFavorites;
window.logout = logout;
window.toggleProfileDropdown = toggleProfileDropdown;
window.goToProfile = goToProfile;
