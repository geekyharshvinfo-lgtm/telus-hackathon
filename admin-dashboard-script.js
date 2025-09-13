// Admin Dashboard Script for TELUS Digital

let editingContentId = null;
let confirmCallback = null;

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if DataManager is already available
    if (typeof DataManager !== 'undefined') {
        initializeAdminDashboard();
    } else {
        // Load data script first
        const script = document.createElement('script');
        script.src = 'data.js';
        document.head.appendChild(script);
        
        script.onload = function() {
            initializeAdminDashboard();
        };
    }
});

function initializeAdminDashboard() {
    checkAdminAuth();
    loadAdminInfo();
    loadAdminStats();
    loadContentTable();
    loadRecentActivity();
    setupEventListeners();
    setupRealTimeSync();
}

function checkAdminAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'user-dashboard.html';
        return;
    }
}

function loadAdminInfo() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const adminName = document.getElementById('adminName');
        if (adminName) {
            adminName.textContent = user.name;
        }
    }
}

function setupEventListeners() {
    // Content form submission
    const contentForm = document.getElementById('contentForm');
    if (contentForm) {
        contentForm.addEventListener('submit', handleContentSubmit);
    }
    
    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterTable, 300));
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTable);
    }
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        loadAdminStats();
        loadRecentActivity();
    }, 30000);
}

function loadAdminStats() {
    try {
        const allContent = DataManager.getAllContent();
        const activeContent = allContent.filter(item => item.status === 'active');
        
        // Update stats display
        updateStatElement('totalContent', allContent.length);
        updateStatElement('activeContent', activeContent.length);
        
        // Simulate today's views (would come from analytics in real app)
        const todayViews = Math.floor(Math.random() * 100) + 50;
        updateStatElement('todayViews', todayViews);
        
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

function updateStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

function loadContentTable() {
    const tableBody = document.getElementById('contentTableBody');
    const tableEmpty = document.getElementById('tableEmpty');
    
    if (!tableBody) return;
    
    try {
        const content = DataManager.getAllContent();
        
        if (content.length === 0) {
            showEmptyTable();
            return;
        }
        
        hideEmptyTable();
        renderContentTable(content);
        
    } catch (error) {
        console.error('Error loading content table:', error);
        showEmptyTable();
    }
}

function renderContentTable(content) {
    const tableBody = document.getElementById('contentTableBody');
    tableBody.innerHTML = '';
    
    content.forEach(item => {
        const row = createTableRow(item);
        tableBody.appendChild(row);
    });
}

function createTableRow(item) {
    const row = document.createElement('tr');
    
    const statusBadge = item.status === 'active' 
        ? '<span class="status-badge active">Active</span>'
        : '<span class="status-badge inactive">Inactive</span>';
    
    const truncatedDescription = item.description.length > 50 
        ? item.description.substring(0, 50) + '...'
        : item.description;
    
    row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.title}</td>
        <td>${truncatedDescription}</td>
        <td>${formatDate(item.dateCreated)}</td>
        <td>${statusBadge}</td>
        <td>
            <button class="action-btn edit" onclick="editContent(${item.id})">Edit</button>
            <button class="action-btn delete" onclick="confirmDeleteContent(${item.id})">Delete</button>
        </td>
    `;
    
    return row;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showAddContentForm() {
    editingContentId = null;
    const form = document.getElementById('addContentForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (formTitle) formTitle.textContent = 'Add New Content';
    if (submitBtn) submitBtn.textContent = 'Add Content';
    
    // Clear form
    document.getElementById('contentForm').reset();
}

function hideAddContentForm() {
    const form = document.getElementById('addContentForm');
    if (form) {
        form.style.display = 'none';
    }
    editingContentId = null;
}

function editContent(id) {
    try {
        const content = DataManager.getContentById(id);
        if (!content) {
            showMessage('Content not found', 'error');
            return;
        }
        
        editingContentId = id;
        
        // Populate form
        document.getElementById('contentTitle').value = content.title;
        document.getElementById('contentDescription').value = content.description;
        document.getElementById('contentImage').value = content.imageUrl || '';
        
        // Update form UI
        const form = document.getElementById('addContentForm');
        const formTitle = document.getElementById('formTitle');
        const submitBtn = document.getElementById('submitBtn');
        
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (formTitle) formTitle.textContent = 'Edit Content';
        if (submitBtn) submitBtn.textContent = 'Update Content';
        
    } catch (error) {
        console.error('Error editing content:', error);
        showMessage('Error loading content for editing', 'error');
    }
}

function handleContentSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('contentTitle').value.trim();
    const description = document.getElementById('contentDescription').value.trim();
    const imageUrl = document.getElementById('contentImage').value.trim();
    
    if (!title || !description) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        try {
            if (editingContentId) {
                // Update existing content
                const success = DataManager.updateContent(editingContentId, {
                    title,
                    description,
                    imageUrl: imageUrl || 'https://via.placeholder.com/300x200/6c757d/ffffff?text=No+Image'
                });
                
                if (success) {
                    showMessage('Content updated successfully!', 'success');
                    logActivity('Updated content', title);
                } else {
                    showMessage('Error updating content', 'error');
                }
            } else {
                // Add new content
                const newContent = DataManager.addContent({
                    title,
                    description,
                    imageUrl: imageUrl || 'https://via.placeholder.com/300x200/6c757d/ffffff?text=No+Image'
                });
                
                if (newContent) {
                    showMessage('Content added successfully!', 'success');
                    logActivity('Added new content', title);
                } else {
                    showMessage('Error adding content', 'error');
                }
            }
            
            // Refresh data
            loadContentTable();
            loadAdminStats();
            hideAddContentForm();
            
        } catch (error) {
            console.error('Error saving content:', error);
            showMessage('Error saving content', 'error');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
}

function confirmDeleteContent(id) {
    try {
        const content = DataManager.getContentById(id);
        if (!content) {
            showMessage('Content not found', 'error');
            return;
        }
        
        const confirmMessage = document.getElementById('confirmMessage');
        if (confirmMessage) {
            confirmMessage.textContent = `Are you sure you want to delete "${content.title}"? This action cannot be undone.`;
        }
        
        confirmCallback = () => deleteContent(id);
        
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error preparing delete confirmation:', error);
        showMessage('Error preparing delete operation', 'error');
    }
}

function deleteContent(id) {
    try {
        const content = DataManager.getContentById(id);
        const success = DataManager.deleteContent(id);
        
        if (success) {
            showMessage('Content deleted successfully!', 'success');
            logActivity('Deleted content', content ? content.title : `ID: ${id}`);
            loadContentTable();
            loadAdminStats();
        } else {
            showMessage('Error deleting content', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting content:', error);
        showMessage('Error deleting content', 'error');
    }
    
    closeConfirmModal();
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    confirmCallback = null;
}

function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
}

function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    try {
        let content = DataManager.getAllContent();
        
        // Apply search filter
        if (searchTerm) {
            content = content.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            content = content.filter(item => item.status === statusFilter);
        }
        
        renderContentTable(content);
        
        if (content.length === 0) {
            showNoResultsMessage();
        }
        
    } catch (error) {
        console.error('Error filtering table:', error);
    }
}

function showNoResultsMessage() {
    const tableBody = document.getElementById('contentTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--telus-gray-500);">
                    No content matches your search criteria
                </td>
            </tr>
        `;
    }
}

function showEmptyTable() {
    const tableEmpty = document.getElementById('tableEmpty');
    const tableContainer = document.querySelector('.table-responsive');
    
    if (tableEmpty) tableEmpty.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
}

function hideEmptyTable() {
    const tableEmpty = document.getElementById('tableEmpty');
    const tableContainer = document.querySelector('.table-responsive');
    
    if (tableEmpty) tableEmpty.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';
}

function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const activities = getRecentActivities();
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">📝</div>
                <div class="activity-content">
                    <h4>No recent activity</h4>
                    <p>Activity will appear here as you manage content</p>
                </div>
                <div class="activity-time">-</div>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = '';
    activities.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityList.appendChild(activityItem);
    });
}

function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const icon = getActivityIcon(activity.type);
    const timeAgo = getTimeAgo(activity.timestamp);
    
    item.innerHTML = `
        <div class="activity-icon">${icon}</div>
        <div class="activity-content">
            <h4>${activity.action}</h4>
            <p>${activity.details}</p>
        </div>
        <div class="activity-time">${timeAgo}</div>
    `;
    
    return item;
}

function getActivityIcon(type) {
    const icons = {
        'add': '➕',
        'edit': '✏️',
        'delete': '🗑️',
        'login': '🔐',
        'default': '📝'
    };
    return icons[type] || icons.default;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

function logActivity(action, details) {
    const activities = getRecentActivities();
    const newActivity = {
        id: Date.now(),
        type: action.toLowerCase().includes('add') ? 'add' : 
              action.toLowerCase().includes('edit') || action.toLowerCase().includes('update') ? 'edit' : 
              action.toLowerCase().includes('delete') ? 'delete' : 'default',
        action,
        details,
        timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    
    // Keep only last 10 activities
    const limitedActivities = activities.slice(0, 10);
    localStorage.setItem('adminActivities', JSON.stringify(limitedActivities));
    
    // Refresh activity display
    loadRecentActivity();
}

function getRecentActivities() {
    const activities = localStorage.getItem('adminActivities');
    return activities ? JSON.parse(activities) : [];
}

function refreshActivity() {
    loadRecentActivity();
    showMessage('Activity refreshed', 'info');
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.dashboard-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} dashboard-message`;
    messageDiv.textContent = message;
    
    // Insert at top of dashboard content
    const dashboardContent = document.querySelector('.dashboard-content .container');
    if (dashboardContent) {
        dashboardContent.insertBefore(messageDiv, dashboardContent.firstChild);
    }
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function logout() {
    // Log logout activity
    logActivity('Admin logout', 'Logged out of admin dashboard');
    
    // Clear session
    localStorage.removeItem('currentUser');
    
    // Redirect to landing page
    window.location.href = 'index.html';
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const confirmModal = document.getElementById('confirmModal');
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal && confirmModal.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeConfirmModal();
        }
    }
});

// Setup real-time synchronization
function setupRealTimeSync() {
    if (typeof DataManager !== 'undefined' && DataManager.setupRealTimeSync) {
        DataManager.setupRealTimeSync(function(detail) {
            console.log('Content data changed, refreshing admin dashboard...');
            loadContentTable();
            loadAdminStats();
        });
    }
}

// Log admin login on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            logActivity('Admin login', `${user.name} accessed admin dashboard`);
        }
    }, 1000);
});
