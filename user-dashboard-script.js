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
    
    // Force immediate data load and update
    console.log('Forcing immediate data load on page initialization...');
    loadTaskData();
    loadDocumentData();
    updateOverviewStats();
    
    // Log current localStorage data for debugging
    const currentDocData = localStorage.getItem('telus_document_status');
    console.log('Current document data on page load:', currentDocData);
    
    // Setup sync listeners after a short delay to ensure SyncManager is loaded
    setTimeout(() => {
        setupSyncListeners();
    }, 100);
    
    // Additional forced refresh after a short delay to catch any timing issues
    setTimeout(() => {
        console.log('Secondary data refresh after initialization...');
        loadTaskData();
        loadDocumentData();
        updateOverviewStats();
        
        // Log again to see if data changed
        const updatedDocData = localStorage.getItem('telus_document_status');
        console.log('Document data after secondary refresh:', updatedDocData);
    }, 500);
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
        
        // Update main userName element (if exists)
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.name;
        }
        
        // Update profile section in navbar
        const profileName = document.getElementById('profileName');
        const profileRole = document.getElementById('profileRole');
        
        if (profileName && profileRole) {
            // Extract first name from full name
            const firstName = user.name ? user.name.split(' ')[0] : 'User';
            
            // Get designation from admin-created users or use role as fallback
            let designation = 'Team Member'; // Default
            
            if (user.designation) {
                // Admin-created user with designation
                designation = user.designation;
            } else if (user.role === 'admin') {
                designation = 'Administrator';
            } else if (user.role === 'user') {
                designation = 'Team Member';
            }
            
            // Update profile display
            profileName.textContent = firstName;
            profileRole.textContent = designation;
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
    updateOverallProgress();
}

// Load task data from localStorage with assignment filtering
function loadTaskData() {
    const taskData = localStorage.getItem('telus_task_status');
    if (taskData) {
        const tasks = JSON.parse(taskData);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email;
        
        let pending = 0;
        let completed = 0;
        
        Object.entries(tasks).forEach(([taskId, task]) => {
            // Check if task is assigned to current user
            if (isItemAssignedToUser(taskId, userEmail)) {
                if (task.status === 'pending') {
                    pending++;
                } else if (task.status === 'completed') {
                    completed++;
                }
            }
        });
        
        dashboardData.tasks = {
            pending: pending,
            completed: completed,
            total: pending + completed
        };
    }
}

// Load document data from localStorage with assignment filtering
function loadDocumentData() {
    const docData = localStorage.getItem('telus_document_status');
    
    if (docData) {
        try {
            const documents = JSON.parse(docData);
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userEmail = currentUser.email;
            
            let pending = 0;
            let completed = 0;
            let underReview = 0;
            let approved = 0;
            
            Object.entries(documents).forEach(([docId, doc]) => {
                // Check if document is assigned to current user
                if (isItemAssignedToUser(docId, userEmail)) {
                    if (doc.status === 'pending') {
                        pending++;
                    } else if (doc.status === 'completed' || doc.status === 'approved') {
                        completed++;
                        if (doc.status === 'approved') {
                            approved++;
                        }
                    } else if (doc.status === 'under-review') {
                        underReview++;
                    }
                }
            });
            
            dashboardData.documents = {
                pending: pending,
                completed: completed,
                underReview: underReview,
                approved: approved,
                total: pending + completed + underReview
            };
        } catch (error) {
            console.error('Error parsing document data:', error);
        }
    } else {
        // Reset to default values when no data
        dashboardData.documents = {
            pending: 0,
            completed: 0,
            underReview: 0,
            approved: 0,
            total: 0
        };
    }
}

// Update task statistics in UI
function updateTaskStats() {
    const tasksPending = document.getElementById('tasksPending');
    const tasksCompleted = document.getElementById('tasksCompleted');
    
    if (tasksPending) tasksPending.textContent = dashboardData.tasks.pending;
    if (tasksCompleted) tasksCompleted.textContent = dashboardData.tasks.completed;
}

// Update document statistics in UI
function updateDocumentStats() {
    const docsPending = document.getElementById('docsPending');
    const docsCompleted = document.getElementById('docsCompleted');
    const docsUnderReview = document.getElementById('docsUnderReview');
    
    if (docsPending) docsPending.textContent = dashboardData.documents.pending;
    if (docsCompleted) docsCompleted.textContent = dashboardData.documents.completed;
    if (docsUnderReview) docsUnderReview.textContent = dashboardData.documents.underReview || 0;
}

// Update team statistics in UI
function updateTeamStats() {
    // Team stats are static for demo purposes
    // In a real application, these would come from an API
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
        // Force reload data from localStorage
        loadTaskData();
        loadDocumentData();
        updateOverviewStats();
        
        // Trigger sync manager refresh if available
        if (window.SyncManager) {
            window.SyncManager.refreshAllData();
        }
        
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

// Setup SyncManager listeners for real-time updates
function setupSyncListeners() {
    if (window.SyncManager) {
        // Listen for task changes
        window.SyncManager.addListener('tasks', (data, source) => {
            console.log('Tasks updated from:', source);
            loadTaskData();
            updateTaskStats();
            updateOverallProgress();
            updateOverviewStats();
            if (source === 'admin') {
                showMessage('Tasks updated by administrator', 'info');
            }
        });
        
        // Listen for document changes
        window.SyncManager.addListener('documents', (data, source) => {
            console.log('Documents updated from:', source);
            loadDocumentData();
            updateDocumentStats();
            updateOverallProgress();
            updateOverviewStats();
            if (source === 'admin') {
                showMessage('Documents updated by administrator', 'info');
            }
        });
        
        
        // Listen for activity changes
        window.SyncManager.addListener('activities', (data, source) => {
            console.log('Activities updated from:', source);
        });
        
        console.log('SyncManager listeners setup complete');
    } else {
        console.warn('SyncManager not available, retrying in 500ms...');
        setTimeout(setupSyncListeners, 500);
    }
}

// Enhanced localStorage event listeners for real-time synchronization
function setupEnhancedStorageListeners() {
    console.log('Setting up enhanced localStorage event listeners...');
    
    // Listen for storage changes to update dashboard when data changes (cross-tab sync)
    window.addEventListener('storage', function(e) {
        console.log('Storage event detected:', e.key, e.newValue);
        
        if (e.key === 'telus_document_status') {
            console.log('Document data changed, updating dashboard...');
            loadDocumentData();
            updateDocumentStats();
            updateOverallProgress();
            showMessage('Documents updated by administrator', 'info');
            
            // Log the current document data for debugging
            const currentData = localStorage.getItem('telus_document_status');
            console.log('Current document data after storage event:', currentData);
        } else if (e.key === 'telus_task_status') {
            console.log('Task data changed, updating dashboard...');
            loadTaskData();
            updateTaskStats();
            updateOverallProgress();
            showMessage('Tasks updated by administrator', 'info');
        }
    });

    // Listen for custom events for same-tab synchronization
    window.addEventListener('dataUpdated', function(e) {
        console.log('Custom data update event:', e.detail);
        const { type } = e.detail || {};
        
        if (type === 'documents' || !type) {
            loadDocumentData();
            updateDocumentStats();
        }
        if (type === 'tasks' || !type) {
            loadTaskData();
            updateTaskStats();
        }
        updateOverallProgress();
        showMessage('Data updated by administrator', 'info');
    });

    // Listen for TELUS data sync events
    window.addEventListener('telusDataSync', function(e) {
        console.log('TELUS data sync event:', e.detail);
        const { type, source } = e.detail || {};
        
        if (type === 'documents') {
            console.log('Documents synced, refreshing document overview...');
            loadDocumentData();
            updateDocumentStats();
            updateOverallProgress();
            
            if (source === 'admin') {
                showMessage('Documents updated by administrator', 'info');
            }
        } else if (type === 'tasks') {
            console.log('Tasks synced, refreshing task overview...');
            loadTaskData();
            updateTaskStats();
            updateOverallProgress();
            
            if (source === 'admin') {
                showMessage('Tasks updated by administrator', 'info');
            }
        }
    });
    
    // Add periodic refresh to catch any missed updates
    setInterval(function() {
        const currentDocData = localStorage.getItem('telus_document_status');
        if (currentDocData) {
            try {
                const docs = JSON.parse(currentDocData);
                const docCount = Object.keys(docs).length;
                
                // Only update if we detect a change in document count
                if (docCount !== dashboardData.documents.total) {
                    console.log('Periodic check detected document changes, refreshing...');
                    loadDocumentData();
                    updateDocumentStats();
                    updateOverallProgress();
                }
            } catch (error) {
                console.error('Error in periodic document check:', error);
            }
        }
    }, 5000); // Check every 5 seconds
    
    console.log('Enhanced localStorage event listeners setup complete');
}

// Call the enhanced setup function
setupEnhancedStorageListeners();

// Assignment filtering functions (Phase 3)
function getAssignment(itemId) {
    try {
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        return assignments[itemId] || null;
    } catch (error) {
        console.error('Error getting assignment:', error);
        return null;
    }
}

function isItemAssignedToUser(itemId, userEmail) {
    try {
        const assignment = getAssignment(itemId);
        if (!assignment) {
            // If no assignment exists, it's visible to all users (backward compatibility)
            return true;
        }
        
        // Check if assigned to all users or specifically to this user
        return assignment.assignedUsers.includes('all') || assignment.assignedUsers.includes(userEmail);
    } catch (error) {
        console.error('Error checking item assignment:', error);
        // Default to true for backward compatibility
        return true;
    }
}

function getUserAssignments(userEmail) {
    try {
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        const userAssignments = {
            tasks: [],
            documents: []
        };
        
        Object.entries(assignments).forEach(([itemId, assignment]) => {
            // Check if user is assigned or if it's assigned to all users
            if (assignment.assignedUsers.includes('all') || assignment.assignedUsers.includes(userEmail)) {
                if (assignment.type === 'task') {
                    userAssignments.tasks.push(itemId);
                } else if (assignment.type === 'document') {
                    userAssignments.documents.push(itemId);
                }
            }
        });
        
        return userAssignments;
    } catch (error) {
        console.error('Error getting user assignments:', error);
        return { tasks: [], documents: [] };
    }
}

// Listen for assignment updates
window.addEventListener('assignmentUpdated', function(e) {
    console.log('Assignment updated, refreshing user dashboard...', e.detail);
    const { type, source } = e.detail || {};
    
    // Refresh dashboard data when assignments change
    loadTaskData();
    loadDocumentData();
    updateOverviewStats();
    
    if (source === 'admin') {
        showMessage('Task assignments updated by administrator', 'info');
    }
});

// Export functions for global access
window.refreshActivity = refreshActivity;
window.closeModal = closeModal;
window.addToFavorites = addToFavorites;
window.logout = logout;
window.toggleProfileDropdown = toggleProfileDropdown;
window.goToProfile = goToProfile;
