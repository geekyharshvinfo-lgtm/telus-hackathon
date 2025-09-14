// Enhanced Admin Dashboard Script for TELUS Digital
// Mirrors user dashboard functionality with administrative controls

// Global variables
let currentSection = 'overview';
let editingItemId = null;
let confirmCallback = null;
let currentFormType = null;

// Admin dashboard data
let adminData = {
    tasks: {
        pending: 0,
        completed: 0,
        total: 0
    },
    documents: {
        pending: 0,
        approved: 0,
        total: 0
    },
    users: {
        total: 0,
        active: 0,
        online: 0,
        away: 0,
        offline: 0
    },
    expertise: {
        content: 0,
        views: 0,
        design: 0,
        development: 0,
        marketing: 0
    }
};

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

// Initialize admin dashboard
function initializeAdminDashboard() {
    checkAdminAuth();
    loadAdminInfo();
    setupEventListeners();
    setupRealTimeSyncListeners(); // Add real-time sync listeners
    loadAllData();
    updateAdminStats();
    loadRecentActivity();
    
    // Log admin access
    logAdminActivity('Admin Login', 'Administrator accessed the admin dashboard');
}

// Check admin authentication
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

// Load admin information
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

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Search and filter functionality for different sections
    setupSearchAndFilters();
    
    // Modal close events
    setupModalEvents();
}

// Setup search and filter functionality
function setupSearchAndFilters() {
    // Task filters
    const taskSearchInput = document.getElementById('taskSearchInput');
    const taskStatusFilter = document.getElementById('taskStatusFilter');
    
    if (taskSearchInput) {
        taskSearchInput.addEventListener('input', debounce(() => filterTasks(), 300));
    }
    if (taskStatusFilter) {
        taskStatusFilter.addEventListener('change', filterTasks);
    }
    
    // Document filters
    const docSearchInput = document.getElementById('docSearchInput');
    const docStatusFilter = document.getElementById('docStatusFilter');
    
    if (docSearchInput) {
        docSearchInput.addEventListener('input', debounce(() => filterDocuments(), 300));
    }
    if (docStatusFilter) {
        docStatusFilter.addEventListener('change', filterDocuments);
    }
    
    // Content filters
    const contentSearchInput = document.getElementById('contentSearchInput');
    const contentCategoryFilter = document.getElementById('contentCategoryFilter');
    
    if (contentSearchInput) {
        contentSearchInput.addEventListener('input', debounce(() => filterContent(), 300));
    }
    if (contentCategoryFilter) {
        contentCategoryFilter.addEventListener('change', filterContent);
    }
    
    // User filters
    const userSearchInput = document.getElementById('userSearchInput');
    const userRoleFilter = document.getElementById('userRoleFilter');
    
    if (userSearchInput) {
        userSearchInput.addEventListener('input', debounce(() => filterUsers(), 300));
    }
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', filterUsers);
    }
}

// Setup modal events
function setupModalEvents() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        const modals = ['quickAddModal', 'formModal', 'confirmModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && e.target === modal) {
                closeModal(modalId);
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Setup real-time sync listeners for user-to-admin synchronization
function setupRealTimeSyncListeners() {
    console.log('Setting up real-time sync listeners for admin dashboard...');
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', function(e) {
        if (!e.key) return;
        
        if (e.key === 'telus_task_status') {
            console.log('Tasks updated by user, refreshing admin view...');
            showSyncNotification('Tasks updated by user');
            loadTaskData();
            updateAdminStats();
            if (currentSection === 'tasks') {
                loadTasksTable();
            }
        } else if (e.key === 'telus_document_status') {
            console.log('Documents updated by user, refreshing admin view...');
            showSyncNotification('Documents updated by user');
            loadDocumentData();
            updateAdminStats();
            if (currentSection === 'documents') {
                loadDocumentsTable();
            }
        }
    });
    
    // Listen for custom sync events (same-tab sync)
    window.addEventListener('telusDataSync', function(e) {
        if (!e.detail) return;
        
        const { type, source, data } = e.detail;
        
        if (source === 'user') {
            if (type === 'tasks') {
                console.log('Tasks synced from user, refreshing admin dashboard...');
                showSyncNotification('Task status updated by user');
                loadTaskData();
                updateAdminStats();
                if (currentSection === 'tasks') {
                    loadTasksTable();
                }
            } else if (type === 'documents') {
                console.log('Documents synced from user, refreshing admin dashboard...');
                showSyncNotification('Document status updated by user');
                loadDocumentData();
                updateAdminStats();
                if (currentSection === 'documents') {
                    loadDocumentsTable();
                }
            }
        }
    });
    
    // Register with SyncManager for automatic updates
    if (window.SyncManager) {
        console.log('Registering with SyncManager for real-time updates...');
        
        // Listen for task updates
        window.SyncManager.addListener('tasks', function(taskData, source) {
            if (source === 'user') {
                console.log('SyncManager: Tasks updated by user, refreshing admin dashboard...');
                showSyncNotification('Task completed by user');
                loadTaskData();
                updateAdminStats();
                if (currentSection === 'tasks') {
                    loadTasksTable();
                }
            }
        });
        
        // Listen for document updates
        window.SyncManager.addListener('documents', function(docData, source) {
            if (source === 'user') {
                console.log('SyncManager: Documents updated by user, refreshing admin dashboard...');
                showSyncNotification('Document submitted by user');
                loadDocumentData();
                updateAdminStats();
                if (currentSection === 'documents') {
                    loadDocumentsTable();
                }
            }
        });
        
        console.log('SyncManager listeners registered successfully');
    } else {
        console.warn('SyncManager not available, using fallback sync methods');
    }
}

// Show sync notification when data is updated by users
function showSyncNotification(message) {
    // Remove existing sync notifications
    const existingNotifications = document.querySelectorAll('.sync-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new sync notification
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
        z-index: 9999;
        font-weight: 500;
        font-size: 0.9em;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid #20c997;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="fas fa-sync-alt" style="margin-right: 8px; animation: spin 1s linear infinite;"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add CSS animation
    if (!document.querySelector('#syncNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'syncNotificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 4000);
}

// Load all data from localStorage and external sources
function loadAllData() {
    loadTaskData();
    loadDocumentData();
    loadUserData();
    loadExpertiseData();
}

// Load task data
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
        
        adminData.tasks = {
            pending: pending,
            completed: completed,
            total: pending + completed
        };
    }
}

// Load document data
function loadDocumentData() {
    const docData = localStorage.getItem('telus_document_status');
    if (docData) {
        const documents = JSON.parse(docData);
        let pending = 0;
        let approved = 0;
        
        Object.values(documents).forEach(doc => {
            if (doc.status === 'pending') {
                pending++;
            } else if (doc.status === 'approved' || doc.status === 'completed') {
                approved++;
            }
        });
        
        adminData.documents = {
            pending: pending,
            approved: approved,
            total: pending + approved
        };
    }
}

// Load user data
function loadUserData() {
    // Simulate user data (in real app, this would come from a database)
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const totalUsers = users.length + 1; // +1 for admin
    
    adminData.users = {
        total: totalUsers,
        active: Math.floor(totalUsers * 0.7), // 70% active
        online: Math.floor(totalUsers * 0.4), // 40% online
        away: Math.floor(totalUsers * 0.2), // 20% away
        offline: Math.floor(totalUsers * 0.4) // 40% offline
    };
}

// Load expertise hub data
function loadExpertiseData() {
    try {
        const allContent = DataManager ? DataManager.getAllContent() : [];
        const totalViews = allContent.reduce((sum, item) => sum + (item.views || 0), 0);
        
        // Count by category
        const categories = {
            design: 0,
            development: 0,
            marketing: 0
        };
        
        allContent.forEach(item => {
            if (item.category && categories.hasOwnProperty(item.category)) {
                categories[item.category]++;
            }
        });
        
        adminData.expertise = {
            content: allContent.length,
            views: totalViews,
            design: categories.design,
            development: categories.development,
            marketing: categories.marketing
        };
    } catch (error) {
        console.error('Error loading expertise data:', error);
        adminData.expertise = {
            content: 0,
            views: 0,
            design: 0,
            development: 0,
            marketing: 0
        };
    }
}

// Update admin statistics display
function updateAdminStats() {
    // Update task stats
    updateElement('adminTasksPending', adminData.tasks.pending);
    updateElement('adminTasksCompleted', adminData.tasks.completed);
    updateProgressBar('adminTasksProgress', 'adminTasksProgressText', 
        adminData.tasks.completed, adminData.tasks.total);
    
    // Update document stats
    updateElement('adminDocsPending', adminData.documents.pending);
    updateElement('adminDocsApproved', adminData.documents.approved);
    updateProgressBar('adminDocsProgress', 'adminDocsProgressText', 
        adminData.documents.approved, adminData.documents.total);
    
    // Update user stats
    updateElement('adminTotalUsers', adminData.users.total);
    updateElement('adminActiveUsers', adminData.users.active);
    updateElement('adminOnlineUsers', `${adminData.users.online} Online`);
    updateElement('adminAwayUsers', `${adminData.users.away} Away`);
    updateElement('adminOfflineUsers', `${adminData.users.offline} Offline`);
    
    // Update expertise stats
    updateElement('adminExpertiseContent', adminData.expertise.content);
    updateElement('adminExpertiseViews', adminData.expertise.views);
    updateElement('adminDesignContent', `${adminData.expertise.design} Design`);
    updateElement('adminDevContent', `${adminData.expertise.development} Development`);
    updateElement('adminMarketingContent', `${adminData.expertise.marketing} Marketing`);
}

// Helper function to update element text content
function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Helper function to update progress bars
function updateProgressBar(progressId, textId, completed, total) {
    const progressBar = document.getElementById(progressId);
    const progressText = document.getElementById(textId);
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '% Complete';
    }
}

// Section switching functionality
function switchToSection(sectionName) {
    // Hide all sections
    const sections = ['overviewSection', 'tasksSection', 'documentsSection', 
                     'expertiseSection', 'usersSection'];
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show selected section
    const targetSection = sectionName === 'overview' ? 'overviewSection' : sectionName + 'Section';
    const element = document.getElementById(targetSection);
    if (element) {
        element.style.display = 'block';
    }
    
    // Update navigation
    updateNavigation(sectionName);
    
    // Load section-specific data
    loadSectionData(sectionName);
    
    currentSection = sectionName;
}

// Update navigation active state
function updateNavigation(sectionName) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section
    const activeLink = document.querySelector(`[onclick="switchToSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    } else if (sectionName === 'overview') {
        const overviewLink = document.querySelector('[href="admin-dashboard.html"]');
        if (overviewLink) {
            overviewLink.classList.add('active');
        }
    }
}

// Load section-specific data
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'tasks':
            loadTasksTable();
            break;
        case 'documents':
            loadDocumentsTable();
            break;
        case 'expertise':
            loadContentTable();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// Load tasks table
function loadTasksTable() {
    const tableBody = document.getElementById('tasksTableBody');
    if (!tableBody) return;
    
    const taskData = localStorage.getItem('telus_task_status');
    if (!taskData) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No tasks found</td></tr>';
        return;
    }
    
    const tasks = JSON.parse(taskData);
    tableBody.innerHTML = '';
    
    Object.entries(tasks).forEach(([taskId, task]) => {
        const row = createTaskRow(taskId, task);
        tableBody.appendChild(row);
    });
}

// Create task table row
function createTaskRow(taskId, task) {
    const row = document.createElement('tr');
    
    const statusBadge = task.status === 'completed' 
        ? '<span class="status-badge success">Completed</span>'
        : '<span class="status-badge warning">Pending</span>';
    
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    
    // Priority badge with color coding
    const priority = task.priority || 'medium';
    const priorityBadge = priority === 'high' 
        ? '<span class="priority-badge high"><i class="fas fa-exclamation-circle"></i> High</span>'
        : priority === 'low' 
        ? '<span class="priority-badge low"><i class="fas fa-circle"></i> Low</span>'
        : '<span class="priority-badge medium"><i class="fas fa-circle"></i> Medium</span>';
    
    // Completion date display
    const completionDate = task.completionDate 
        ? new Date(task.completionDate).toLocaleDateString()
        : task.status === 'completed' 
        ? 'Completed (no date)' 
        : 'Not completed';
    
    row.innerHTML = `
        <td>
            <div class="task-title-cell">
                <strong>${task.title || 'Untitled Task'}</strong>
                ${task.description ? `<div class="task-description-preview">${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}</div>` : ''}
            </div>
        </td>
        <td>John Doe</td>
        <td>${priorityBadge}</td>
        <td>${statusBadge}</td>
        <td>${dueDate}</td>
        <td>${completionDate}</td>
        <td>
            <button class="action-btn view" onclick="viewTaskDetails('${taskId}')" title="View Full Details">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit" onclick="editTask('${taskId}')" title="Edit Task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="confirmDeleteTask('${taskId}')" title="Delete Task">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Load documents table
function loadDocumentsTable() {
    const tableBody = document.getElementById('documentsTableBody');
    if (!tableBody) return;
    
    const docData = localStorage.getItem('telus_document_status');
    if (!docData) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No documents found</td></tr>';
        return;
    }
    
    const documents = JSON.parse(docData);
    tableBody.innerHTML = '';
    
    Object.entries(documents).forEach(([docId, doc]) => {
        const row = createDocumentRow(docId, doc);
        tableBody.appendChild(row);
    });
}

// Create document table row
function createDocumentRow(docId, doc) {
    const row = document.createElement('tr');
    
    let statusBadge;
    let actionButtons = '';
    
    switch (doc.status) {
        case 'approved':
        case 'completed':
            statusBadge = '<span class="status-badge success">Approved</span>';
            actionButtons = `
                <button class="action-btn view" onclick="viewDocument('${docId}')" title="View Document">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editDocument('${docId}')" title="Edit Document">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="confirmDeleteDocument('${docId}')" title="Delete Document">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            break;
        case 'rejected':
            statusBadge = '<span class="status-badge danger">Rejected</span>';
            actionButtons = `
                <button class="action-btn view" onclick="viewDocument('${docId}')" title="View Document">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn approve" onclick="approveDocument('${docId}')" title="Approve Document">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn edit" onclick="editDocument('${docId}')" title="Edit Document">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="confirmDeleteDocument('${docId}')" title="Delete Document">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            break;
        case 'under-review':
            statusBadge = '<span class="status-badge info">Under Review</span>';
            actionButtons = `
                <button class="action-btn preview" onclick="previewDocumentSubmission('${docId}')" title="Preview Submission">
                    <i class="fas fa-search"></i>
                </button>
            `;
            break;
        default:
            statusBadge = '<span class="status-badge warning">Pending</span>';
            actionButtons = `
                <button class="action-btn view" onclick="viewDocument('${docId}')" title="View Document">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editDocument('${docId}')" title="Edit Document">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="confirmDeleteDocument('${docId}')" title="Delete Document">
                    <i class="fas fa-trash"></i>
                </button>
            `;
    }
    
    const uploadDate = doc.dateCreated ? new Date(doc.dateCreated).toLocaleDateString() : new Date().toLocaleDateString();
    const docType = doc.type || 'PDF';
    const userResponse = doc.userResponse || 'No response yet';
    
    row.innerHTML = `
        <td>${doc.title || 'Untitled Document'}</td>
        <td>John Doe</td>
        <td>${docType}</td>
        <td>${statusBadge}</td>
        <td>${uploadDate}</td>
        <td>${actionButtons}</td>
    `;
    
    // Add data attributes for easy access
    row.setAttribute('data-doc-id', docId);
    row.setAttribute('data-status', doc.status);
    row.setAttribute('data-user-response', userResponse);
    
    return row;
}

// Load content table
function loadContentTable() {
    const tableBody = document.getElementById('contentTableBody');
    if (!tableBody) return;
    
    try {
        const allContent = DataManager ? DataManager.getAllContent() : [];
        
        if (allContent.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No content found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        
        allContent.forEach(content => {
            const row = createContentRow(content);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading content table:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading content</td></tr>';
    }
}

// Create content table row
function createContentRow(content) {
    const row = document.createElement('tr');
    
    const statusBadge = content.status === 'active' 
        ? '<span class="status-badge success">Active</span>'
        : '<span class="status-badge warning">Inactive</span>';
    
    row.innerHTML = `
        <td>${content.id}</td>
        <td>${content.title}</td>
        <td>${content.category || 'General'}</td>
        <td>${content.views || 0}</td>
        <td>${statusBadge}</td>
        <td>${formatDate(content.dateCreated)}</td>
        <td>
            <button class="action-btn edit" onclick="editContent(${content.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="confirmDeleteContent(${content.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Load users table
function loadUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Add current admin user to the list
    const allUsers = [...users, currentUser];
    
    if (allUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    allUsers.forEach((user, index) => {
        if (user.email) { // Only show users with email
            const row = createUserRow(index + 1, user);
            tableBody.appendChild(row);
        }
    });
}

// Create user table row
function createUserRow(userId, user) {
    const row = document.createElement('tr');
    
    const roleBadge = user.role === 'admin' 
        ? '<span class="status-badge danger">Admin</span>'
        : '<span class="status-badge primary">User</span>';
    
    const statusBadge = '<span class="status-badge success">Active</span>';
    
    // POD badge with color coding
    const podBadge = user.pod 
        ? `<span class="pod-badge" style="background: var(--telus-purple); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">${user.pod}</span>`
        : '<span style="color: #6c757d; font-style: italic;">No POD</span>';
    
    row.innerHTML = `
        <td>${userId}</td>
        <td>
            <div style="display: flex; flex-direction: column;">
                <strong>${user.name || 'Unknown'}</strong>
                ${user.designation ? `<small style="color: #6c757d;">${user.designation}</small>` : ''}
            </div>
        </td>
        <td>${user.email}</td>
        <td>${podBadge}</td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td>${new Date().toLocaleDateString()}</td>
        <td>
            <button class="action-btn edit" onclick="editUser(${userId})" title="Edit User">
                <i class="fas fa-edit"></i>
            </button>
            ${user.role !== 'admin' ? `<button class="action-btn delete" onclick="confirmDeleteUser(${userId})" title="Delete User">
                <i class="fas fa-trash"></i>
            </button>` : ''}
        </td>
    `;
    
    return row;
}

// Load analytics
function loadAnalytics() {
    // Placeholder for analytics functionality
    console.log('Loading analytics...');
}

// Filter functions
function filterTasks() {
    const searchTerm = document.getElementById('taskSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('taskStatusFilter')?.value || 'all';
    
    // Reload table with filters applied
    loadTasksTable();
}

function filterDocuments() {
    const searchTerm = document.getElementById('docSearchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('docStatusFilter')?.value || 'all';
    
    // Reload table with filters applied
    loadDocumentsTable();
}

function filterContent() {
    const searchTerm = document.getElementById('contentSearchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('contentCategoryFilter')?.value || 'all';
    
    // Reload table with filters applied
    loadContentTable();
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearchInput')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || 'all';
    
    // Reload table with filters applied
    loadUsersTable();
}

// Add new item functions
function addNewTask() {
    currentFormType = 'task';
    editingItemId = null;
    showFormModal('Add New Task', getTaskFormFields());
    closeQuickAddModal();
}

function addNewDocument() {
    currentFormType = 'document';
    editingItemId = null;
    showFormModal('Add New Document', getDocumentFormFields());
    closeQuickAddModal();
}

function addNewContent() {
    currentFormType = 'content';
    editingItemId = null;
    showFormModal('Add New Content', getContentFormFields());
    closeQuickAddModal();
}

function addNewUser() {
    currentFormType = 'user';
    editingItemId = null;
    showFormModal('Add New User', getUserFormFields());
    closeQuickAddModal();
}

// Edit functions
function editTask(taskId) {
    currentFormType = 'task';
    editingItemId = taskId;
    
    const taskData = localStorage.getItem('telus_task_status');
    if (taskData) {
        const tasks = JSON.parse(taskData);
        const task = tasks[taskId];
        if (task) {
            showFormModal('Edit Task', getTaskFormFields(), task);
        }
    }
}

function editDocument(docId) {
    currentFormType = 'document';
    editingItemId = docId;
    
    const docData = localStorage.getItem('telus_document_status');
    if (docData) {
        const documents = JSON.parse(docData);
        const doc = documents[docId];
        if (doc) {
            showFormModal('Edit Document', getDocumentFormFields(), doc);
        }
    }
}

function editContent(contentId) {
    currentFormType = 'content';
    editingItemId = contentId;
    
    try {
        const content = DataManager ? DataManager.getContentById(contentId) : null;
        if (content) {
            showFormModal('Edit Content', getContentFormFields(), content);
        }
    } catch (error) {
        console.error('Error editing content:', error);
        showMessage('Error loading content for editing', 'error');
    }
}

function editUser(userId) {
    currentFormType = 'user';
    editingItemId = userId;
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const allUsers = [...users, currentUser];
    
    const user = allUsers[userId - 1];
    if (user) {
        showFormModal('Edit User', getUserFormFields(), user);
    }
}

// View functions
function viewTaskDetails(taskId) {
    const taskData = localStorage.getItem('telus_task_status');
    if (taskData) {
        try {
            const tasks = JSON.parse(taskData);
            const task = tasks[taskId];
            if (task) {
                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }) : 'No due date';
                
                const createdDate = task.dateCreated ? new Date(task.dateCreated).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }) : 'Unknown';
                
                const completionDate = task.completionDate ? new Date(task.completionDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }) : null;
                
                // Create enhanced task detail modal
                const taskDetailModal = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.6);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                        backdrop-filter: blur(2px);
                    " onclick="this.remove()">
                        <div style="
                            background: white;
                            padding: 0;
                            border-radius: 16px;
                            max-width: 700px;
                            width: 95%;
                            max-height: 90vh;
                            overflow: hidden;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            animation: modalSlideIn 0.3s ease-out;
                        " onclick="event.stopPropagation()">
                            <style>
                                @keyframes modalSlideIn {
                                    from { transform: translateY(-20px); opacity: 0; }
                                    to { transform: translateY(0); opacity: 1; }
                                }
                            </style>
                            
                            <!-- Header -->
                            <div style="
                                background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                                color: white;
                                padding: 25px 30px;
                                border-radius: 16px 16px 0 0;
                            ">
                                <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center;">
                                    <i class="fas fa-tasks" style="margin-right: 12px; font-size: 1.2em;"></i>
                                    Task Details
                                </h3>
                                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.95em;">
                                    Complete task information and user progress
                                </p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 30px; max-height: 60vh; overflow-y: auto;">
                                <!-- Task Header Info -->
                                <div style="
                                    background: #f8f9fa;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid var(--telus-purple);
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: var(--telus-purple); font-size: 1.3em;">
                                        ${task.title || 'Untitled Task'}
                                    </h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.95em;">
                                        <div>
                                            <strong style="color: #495057;">Priority:</strong><br>
                                            <span style="
                                                color: ${task.priority === 'high' ? '#dc3545' : task.priority === 'low' ? '#28a745' : '#fd7e14'};
                                                font-weight: 600;
                                                text-transform: capitalize;
                                            ">${task.priority || 'Medium'} Priority</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Status:</strong><br>
                                            <span style="
                                                color: ${task.status === 'completed' ? '#28a745' : '#fd7e14'};
                                                font-weight: 600;
                                                text-transform: capitalize;
                                            ">${task.status === 'completed' ? 'Completed' : 'Pending'}</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Created Date:</strong><br>
                                            <span style="color: #212529;">${createdDate}</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Due Date:</strong><br>
                                            <span style="color: #212529;">${dueDate}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Task Description -->
                                <div style="
                                    background: #e8f5e8;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid #28a745;
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: #155724; font-size: 1.1em;">
                                        <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                                        Task Description
                                    </h4>
                                    <div style="
                                        background: white;
                                        padding: 15px;
                                        border-radius: 8px;
                                        border: 1px solid #c3e6cb;
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                        line-height: 1.6;
                                        color: #212529;
                                    ">
                                        ${task.description || 'No description provided'}
                                    </div>
                                </div>
                                
                                <!-- Task Resources -->
                                <div style="
                                    background: #fff3cd;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid #ffc107;
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: #856404; font-size: 1.1em;">
                                        <i class="fas fa-link" style="margin-right: 8px;"></i>
                                        Resources & Materials
                                    </h4>
                                    <div style="
                                        background: white;
                                        padding: 15px;
                                        border-radius: 8px;
                                        border: 1px solid #ffeaa7;
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                        line-height: 1.6;
                                        color: #212529;
                                    ">
                                        ${task.resources ? 
                                            task.resources.split('\n').map(resource => 
                                                `<div style="margin-bottom: 8px;">
                                                    <i class="fas fa-file" style="margin-right: 8px; color: #6c757d;"></i>
                                                    ${resource.trim()}
                                                </div>`
                                            ).join('') : 
                                            '<div style="color: #6c757d; font-style: italic;">No resources provided</div>'
                                        }
                                    </div>
                                </div>
                                
                                <!-- User Completion Info (if completed) -->
                                ${task.status === 'completed' ? `
                                <div style="
                                    background: #d1ecf1;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid #17a2b8;
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: #0c5460; font-size: 1.1em;">
                                        <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                                        User Completion Details
                                    </h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                        <div>
                                            <strong style="color: #495057;">Completed On:</strong><br>
                                            <span style="color: #212529;">${completionDate || 'Date not recorded'}</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Assigned User:</strong><br>
                                            <span style="color: #212529;">John Doe</span>
                                        </div>
                                    </div>
                                    ${task.userResponse ? `
                                    <div>
                                        <strong style="color: #495057;">User Response:</strong><br>
                                        <div style="
                                            background: white;
                                            padding: 12px;
                                            border-radius: 6px;
                                            border: 1px solid #bee5eb;
                                            margin-top: 8px;
                                            font-style: italic;
                                            color: #212529;
                                        ">
                                            ${task.userResponse}
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                                ` : ''}
                            </div>
                            
                            <!-- Actions -->
                            <div style="
                                background: #f8f9fa;
                                padding: 25px 30px;
                                border-radius: 0 0 16px 16px;
                                border-top: 1px solid #e9ecef;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                flex-wrap: wrap;
                                gap: 15px;
                            ">
                                <div style="color: #6c757d; font-size: 0.9em;">
                                    <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                                    Task ID: ${taskId}
                                </div>
                                <div style="display: flex; gap: 12px;">
                                    <button onclick="editTask('${taskId}'); this.closest('div[style*=\"position: fixed\"]').remove();" 
                                            style="
                                                background: linear-gradient(135deg, #007bff, #0056b3);
                                                color: white;
                                                border: none;
                                                padding: 12px 24px;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-weight: 600;
                                                font-size: 0.95em;
                                                transition: all 0.2s ease;
                                                box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                                            "
                                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0, 123, 255, 0.4)';"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 123, 255, 0.3)';">
                                        <i class="fas fa-edit" style="margin-right: 8px;"></i>
                                        Edit Task
                                    </button>
                                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove();" 
                                            style="
                                                background: #6c757d;
                                                color: white;
                                                border: none;
                                                padding: 12px 20px;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-weight: 500;
                                                font-size: 0.95em;
                                                transition: all 0.2s ease;
                                            "
                                            onmouseover="this.style.background='#5a6268';"
                                            onmouseout="this.style.background='#6c757d';">
                                        <i class="fas fa-times" style="margin-right: 8px;"></i>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add modal to page
                document.body.insertAdjacentHTML('beforeend', taskDetailModal);
            }
        } catch (error) {
            console.error('Error viewing task details:', error);
            showMessage('Error loading task details', 'error');
        }
    }
}

function viewDocument(docId) {
    showMessage('Document viewer functionality coming soon!', 'info');
}

// Delete confirmation functions
function confirmDeleteTask(taskId) {
    confirmCallback = () => deleteTask(taskId);
    showConfirmModal('Are you sure you want to delete this task?');
}

function confirmDeleteDocument(docId) {
    confirmCallback = () => deleteDocument(docId);
    showConfirmModal('Are you sure you want to delete this document?');
}

function confirmDeleteContent(contentId) {
    confirmCallback = () => deleteContent(contentId);
    showConfirmModal('Are you sure you want to delete this content?');
}

function confirmDeleteUser(userId) {
    confirmCallback = () => deleteUser(userId);
    showConfirmModal('Are you sure you want to delete this user?');
}

// Delete functions
function deleteTask(taskId) {
    const taskData = localStorage.getItem('telus_task_status');
    if (taskData) {
        const tasks = JSON.parse(taskData);
        delete tasks[taskId];
        localStorage.setItem('telus_task_status', JSON.stringify(tasks));
        
        loadTaskData();
        updateAdminStats();
        loadTasksTable();
        
        logAdminActivity('Task Deleted', `Deleted task ${taskId}`);
        showMessage('Task deleted successfully!', 'success');
    }
    closeConfirmModal();
}

function deleteDocument(docId) {
    const docData = localStorage.getItem('telus_document_status');
    if (docData) {
        const documents = JSON.parse(docData);
        delete documents[docId];
        localStorage.setItem('telus_document_status', JSON.stringify(documents));
        
        loadDocumentData();
        updateAdminStats();
        loadDocumentsTable();
        
        logAdminActivity('Document Deleted', `Deleted document ${docId}`);
        showMessage('Document deleted successfully!', 'success');
    }
    closeConfirmModal();
}

function deleteContent(contentId) {
    try {
        if (DataManager && DataManager.deleteContent) {
            const success = DataManager.deleteContent(contentId);
            if (success) {
                loadExpertiseData();
                updateAdminStats();
                loadContentTable();
                
                logAdminActivity('Content Deleted', `Deleted content ${contentId}`);
                showMessage('Content deleted successfully!', 'success');
            } else {
                showMessage('Error deleting content', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        showMessage('Error deleting content', 'error');
    }
    closeConfirmModal();
}

function deleteUser(userId) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (userId <= users.length) {
        users.splice(userId - 1, 1);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        loadUserData();
        updateAdminStats();
        loadUsersTable();
        
        logAdminActivity('User Deleted', `Deleted user ${userId}`);
        showMessage('User deleted successfully!', 'success');
    }
    closeConfirmModal();
}

// Form field generators
function getTaskFormFields() {
    const isEditing = editingItemId !== null;
    
    let formFields = `
        <div class="form-group">
            <label for="taskTitle" class="required">Task Name *</label>
            <input type="text" id="taskTitle" name="title" required placeholder="Enter task name">
        </div>
        <div class="form-group">
            <label for="taskDescription" class="required">Description *</label>
            <textarea id="taskDescription" name="description" rows="4" required placeholder="Describe the task details and requirements"></textarea>
        </div>
        <div class="form-group">
            <label for="taskResources">Resources</label>
            <textarea id="taskResources" name="resources" rows="3" placeholder="List any resources, links, or materials needed for this task"></textarea>
        </div>
        <div class="form-group">
            <label for="taskAssignTo">Assign To</label>
            <div class="user-selector-container">
                <div class="user-selector-display" id="taskUserSelector" onclick="openUserSelectionModal('task')">
                    <div class="selected-users" id="taskSelectedUsers">
                        <span class="default-selection">All Users (Default)</span>
                    </div>
                    <i class="fas fa-chevron-down selector-arrow"></i>
                </div>
                <input type="hidden" id="taskAssignTo" name="assignTo" value="all">
            </div>
            <div class="form-help-text">Click to select specific users or leave as "All Users" for everyone.</div>
        </div>
        <div class="form-group">
            <label for="taskDueDate" class="required">Due Date *</label>
            <input type="date" id="taskDueDate" name="dueDate" required>
        </div>
        <div class="form-group">
            <label for="taskPriority" class="required">Priority *</label>
            <select id="taskPriority" name="priority" required>
                <option value="">Select Priority</option>
                <option value="low">Low Priority</option>
                <option value="high">High Priority</option>
            </select>
        </div>
    `;
    
    // Only add status field when editing
    if (isEditing) {
        formFields += `
        <div class="form-group">
            <label for="taskStatus">Status</label>
            <select id="taskStatus" name="status">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
            </select>
        </div>
        `;
    }
    
    return formFields;
}

function getDocumentFormFields() {
    const isEditing = editingItemId !== null;
    
    let formFields = `
        <div class="form-group">
            <label for="docTitle" class="required">Document Name *</label>
            <input type="text" id="docTitle" name="title" required placeholder="Enter document name">
        </div>
        <div class="form-group">
            <label for="docDescription" class="required">Description *</label>
            <textarea id="docDescription" name="description" rows="4" required placeholder="Describe the document content and purpose"></textarea>
        </div>
        <div class="form-group">
            <label for="docAssignTo">Assign To</label>
            <div class="user-selector-container">
                <div class="user-selector-display" id="docUserSelector" onclick="openUserSelectionModal('document')">
                    <div class="selected-users" id="docSelectedUsers">
                        <span class="default-selection">All Users (Default)</span>
                    </div>
                    <i class="fas fa-chevron-down selector-arrow"></i>
                </div>
                <input type="hidden" id="docAssignTo" name="assignTo" value="all">
            </div>
            <div class="form-help-text">Click to select specific users or leave as "All Users" for everyone.</div>
        </div>
        <div class="form-group">
            <label for="docFile">Document PDF Sample (Optional)</label>
            <div class="file-upload-wrapper">
                <label for="docFile" class="file-upload-btn">
                    <i class="fas fa-upload"></i>
                    Choose PDF File
                </label>
                <input type="file" id="docFile" name="file" accept=".pdf">
                <div class="file-name-display" id="docFileDisplay" style="display: none;"></div>
            </div>
            <div class="form-help-text">Upload a PDF sample of the document (Max 10MB) - Optional</div>
        </div>
        <div class="form-group">
            <label for="docDueDate" class="required">Due Date *</label>
            <input type="date" id="docDueDate" name="dueDate" required>
        </div>
        <div class="form-group">
            <label for="docPriority" class="required">Priority *</label>
            <select id="docPriority" name="priority" required>
                <option value="">Select Priority</option>
                <option value="low">Low Priority</option>
                <option value="high">High Priority</option>
            </select>
        </div>
        <div class="form-group">
            <label for="docType">Document Type</label>
            <select id="docType" name="type">
                <option value="pdf">PDF Document</option>
                <option value="report">Report</option>
                <option value="proposal">Proposal</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
            </select>
        </div>
    `;
    
    // Only add status field when editing
    if (isEditing) {
        formFields += `
        <div class="form-group">
            <label for="docStatus">Status</label>
            <select id="docStatus" name="status">
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
        `;
    }
    
    return formFields;
}

function getContentFormFields() {
    return `
        <div class="form-group">
            <label for="contentTitle">Content Title *</label>
            <input type="text" id="contentTitle" name="title" required>
        </div>
        <div class="form-group">
            <label for="contentDescription">Description *</label>
            <textarea id="contentDescription" name="description" rows="4" required></textarea>
        </div>
        <div class="form-group">
            <label for="contentCategory">Category</label>
            <select id="contentCategory" name="category">
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
            </select>
        </div>
        <div class="form-group">
            <label for="contentImageUrl">Image URL</label>
            <input type="url" id="contentImageUrl" name="imageUrl" placeholder="https://example.com/image.jpg">
        </div>
    `;
}

function getUserFormFields() {
    return `
        <div class="form-group">
            <label for="userName">Full Name *</label>
            <input type="text" id="userName" name="name" required placeholder="Enter full name">
        </div>
        <div class="form-group">
            <label for="userDesignation">Designation *</label>
            <input type="text" id="userDesignation" name="designation" required placeholder="e.g., Senior Product Manager" value="Product Manager">
        </div>
        <div class="form-group">
            <label for="userRole">Role/Department</label>
            <select id="userRole" name="role">
                <option value="Product Management" selected>Product Management</option>
                <option value="Product Designer">Product Designer</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Solution Engineer">Solution Engineer</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Quality Analyst">Quality Analyst</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Consultant">Consultant</option>
                <option value="user">User (Basic)</option>
                <option value="admin">Admin</option>
            </select>
        </div>
        <div class="form-group">
            <label for="userPod">POD Assignment</label>
            <select id="userPod" name="pod">
                <option value="Platform" selected>Platform Team</option>
                <option value="Growth">Growth Team</option>
                <option value="CC">Control Centre</option>
                <option value="TS">Talent Studio</option>
                <option value="GTS">Ground Truth Studio</option>
                <option value="FTS">Fine Tune Studio</option>
            </select>
        </div>
        <div class="form-group">
            <label for="userEmail">Email</label>
            <input type="email" id="userEmail" name="email" value="user.name@telus.com" placeholder="Auto-generated from name">
        </div>
        <div class="form-group">
            <label for="userPhone">Phone</label>
            <input type="tel" id="userPhone" name="phone" value="+1 (555) 123-4567">
        </div>
        <div class="form-group">
            <label for="userLocation">Location</label>
            <input type="text" id="userLocation" name="location" value="Vancouver, BC">
        </div>
        <div class="form-group">
            <label for="userExperience">Experience Level</label>
            <select id="userExperience" name="experience">
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years" selected>3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="10+ years">10+ years</option>
            </select>
        </div>
        <div class="form-group">
            <label for="userSkills">Skills (comma-separated)</label>
            <input type="text" id="userSkills" name="skills" value="Product Strategy, Agile, Analytics" placeholder="e.g., React, Node.js, Python">
        </div>
        <div class="form-group">
            <label for="userProject">Current Project</label>
            <input type="text" id="userProject" name="currentProject" value="Digital Platform Enhancement">
        </div>
        <div class="form-group">
            <label for="userAvailability">Availability</label>
            <select id="userAvailability" name="availability">
                <option value="Available" selected>Available</option>
                <option value="Busy">Busy</option>
                <option value="Away">Away</option>
            </select>
        </div>
        <div class="form-group">
            <label for="userDescription">Description</label>
            <textarea id="userDescription" name="description" rows="3" placeholder="Brief professional description">Experienced professional focused on delivering innovative solutions and driving team collaboration.</textarea>
        </div>
        <div class="form-group">
            <label for="userPassword">Password (Optional)</label>
            <input type="password" id="userPassword" name="password" placeholder="Leave blank for default password">
        </div>
    `;
}

// Modal functions
function showQuickAddModal() {
    const modal = document.getElementById('quickAddModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeQuickAddModal() {
    const modal = document.getElementById('quickAddModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showFormModal(title, formFields, data = null) {
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('formModalTitle');
    const formFieldsContainer = document.getElementById('formFields');
    
    if (modal && modalTitle && formFieldsContainer) {
        modalTitle.textContent = title;
        formFieldsContainer.innerHTML = formFields;
        
        // Setup file upload handling if document form
        if (currentFormType === 'document') {
            setupFileUploadHandling();
        }
        
        // Setup auto-email generation for user form
        if (currentFormType === 'user') {
            setupAutoEmailGeneration();
        }
        
        // Populate form with existing data if editing
        if (data) {
            populateForm(data);
        }
        
        modal.style.display = 'flex';
    }
}

function closeFormModal() {
    const modal = document.getElementById('formModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentFormType = null;
    editingItemId = null;
}

function showConfirmModal(message) {
    const modal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    
    if (modal && confirmMessage) {
        confirmMessage.textContent = message;
        modal.style.display = 'flex';
    }
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

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAllModals() {
    const modals = ['quickAddModal', 'formModal', 'confirmModal'];
    modals.forEach(modalId => {
        closeModal(modalId);
    });
}

// Form handling
function populateForm(data) {
    Object.keys(data).forEach(key => {
        const input = document.getElementById(getFieldId(currentFormType, key));
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else {
                input.value = data[key] || '';
            }
        }
    });
}

function getFieldId(formType, fieldName) {
    const prefixes = {
        task: 'task',
        document: 'doc',
        content: 'content',
        user: 'user'
    };
    
    const prefix = prefixes[formType] || '';
    return prefix + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const submitBtn = document.getElementById('formSubmitBtn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        try {
            let success = false;
            
            switch (currentFormType) {
                case 'task':
                    success = saveTask(data);
                    break;
                case 'document':
                    success = saveDocument(data);
                    break;
                case 'content':
                    success = saveContent(data);
                    break;
                case 'user':
                    success = saveUser(data);
                    break;
            }
            
            if (success) {
                closeFormModal();
                loadAllData();
                updateAdminStats();
                loadSectionData(currentSection);
                
                const action = editingItemId ? 'updated' : 'added';
                showMessage(`${currentFormType.charAt(0).toUpperCase() + currentFormType.slice(1)} ${action} successfully!`, 'success');
                
                logAdminActivity(
                    `${currentFormType.charAt(0).toUpperCase() + currentFormType.slice(1)} ${action}`,
                    `${action.charAt(0).toUpperCase() + action.slice(1)} ${currentFormType}: ${data.title || data.name || 'Item'}`
                );
            } else {
                showMessage(`Error ${editingItemId ? 'updating' : 'adding'} ${currentFormType}`, 'error');
            }
        } catch (error) {
            console.error('Error saving form:', error);
            showMessage(`Error ${editingItemId ? 'updating' : 'adding'} ${currentFormType}`, 'error');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
}

// Save functions using SyncManager with assignment tracking
function saveTask(data) {
    try {
        // Handle user assignments
        const assignedUsers = data.assignTo ? (Array.isArray(data.assignTo) ? data.assignTo : [data.assignTo]) : ['all'];
        
        if (window.SyncManager) {
            if (editingItemId) {
                // Update existing task - PRESERVE USER COMPLETION DATA
                const existingTasks = window.SyncManager.getTasks();
                const existingTask = existingTasks[editingItemId];
                
                if (existingTask) {
                    // Create updated task preserving user completion fields
                    const updatedTaskData = {
                        // Admin-editable fields only
                        title: data.title,
                        description: data.description,
                        resources: data.resources,
                        dueDate: data.dueDate,
                        priority: data.priority,
                        // Only update status if explicitly provided and different
                        ...(data.status && data.status !== existingTask.status && { status: data.status }),
                        // Always update lastModified
                        lastModified: new Date().toISOString(),
                        // PRESERVE user completion fields
                        completionDate: existingTask.completionDate,
                        userResponse: existingTask.userResponse,
                        // Preserve creation date
                        dateCreated: existingTask.dateCreated || new Date().toISOString()
                    };
                    
                    const updatedTask = window.SyncManager.updateTask(editingItemId, updatedTaskData, 'admin');
                    
                    // Update assignment tracking
                    if (updatedTask) {
                        saveAssignment('task', editingItemId, assignedUsers);
                    }
                    
                    console.log('Task updated preserving user completion data:', updatedTask);
                    return !!updatedTask;
                } else {
                    console.error('Task not found for editing:', editingItemId);
                    return false;
                }
            } else {
                // Add new task
                const newTask = window.SyncManager.addTask(data, 'admin');
                
                // Save assignment tracking for new task
                if (newTask && newTask.id) {
                    saveAssignment('task', newTask.id, assignedUsers);
                }
                
                return !!newTask;
            }
        } else {
            // Fallback to direct localStorage manipulation
            console.warn('SyncManager not available, using fallback method');
            const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
            let taskId = editingItemId;
            
            if (editingItemId) {
                // Update existing task - PRESERVE USER COMPLETION DATA
                const existingTask = tasks[editingItemId];
                if (existingTask) {
                    const preservedTask = {
                        // Core task identity
                        id: existingTask.id || editingItemId,
                        // Admin-editable fields (these can be updated)
                        title: data.title,
                        description: data.description,
                        resources: data.resources,
                        dueDate: data.dueDate,
                        priority: data.priority,
                        // Status handling - only update if explicitly provided and different
                        status: (data.status && data.status !== existingTask.status) ? data.status : existingTask.status,
                        // Timestamps
                        dateCreated: existingTask.dateCreated || new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        // CRITICAL: Explicitly preserve user completion data
                        completionDate: existingTask.completionDate,
                        userResponse: existingTask.userResponse,
                        // Preserve any other existing fields that might exist
                        type: existingTask.type || 'task'
                    };
                    
                    tasks[editingItemId] = preservedTask;
                    console.log('Task updated with explicit field preservation (fallback):', tasks[editingItemId]);
                } else {
                    console.error('Task not found for editing in fallback method:', editingItemId);
                    return false;
                }
            } else {
                // Add new task
                taskId = 'task_' + Date.now();
                tasks[taskId] = {
                    id: taskId,
                    ...data,
                    status: 'pending', // Default status for new tasks
                    dateCreated: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
            }
            
            localStorage.setItem('telus_task_status', JSON.stringify(tasks));
            
            // Save assignment tracking
            saveAssignment('task', taskId, assignedUsers);
            
            // Trigger storage event for cross-tab sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'telus_task_status',
                newValue: JSON.stringify(tasks),
                storageArea: localStorage
            }));
            
            // Also trigger custom event for same-tab sync
            window.dispatchEvent(new CustomEvent('dataUpdated', {
                detail: { type: 'tasks', source: 'admin', data: tasks }
            }));
            
            console.log('Task saved and events triggered');
            return true;
        }
    } catch (error) {
        console.error('Error saving task:', error);
        return false;
    }
}

function saveDocument(data) {
    try {
        // Handle user assignments
        const assignedUsers = data.assignTo ? (Array.isArray(data.assignTo) ? data.assignTo : [data.assignTo]) : ['all'];
        
        if (window.SyncManager) {
            if (editingItemId) {
                // Update existing document
                const updatedDoc = window.SyncManager.updateDocument(editingItemId, data, 'admin');
                
                // Update assignment tracking
                if (updatedDoc) {
                    saveAssignment('document', editingItemId, assignedUsers);
                }
                
                return !!updatedDoc;
            } else {
                // Add new document
                const newDoc = window.SyncManager.addDocument(data, 'admin');
                
                // Save assignment tracking for new document
                if (newDoc && newDoc.id) {
                    saveAssignment('document', newDoc.id, assignedUsers);
                }
                
                return !!newDoc;
            }
        } else {
            // Fallback to direct localStorage manipulation
            console.warn('SyncManager not available, using fallback method');
            const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
            let docId = editingItemId;
            
            if (editingItemId) {
                // Update existing document
                documents[editingItemId] = {
                    ...documents[editingItemId],
                    ...data,
                    lastModified: new Date().toISOString()
                };
            } else {
                // Add new document
                docId = 'doc_' + Date.now();
                documents[docId] = {
                    id: docId,
                    ...data,
                    status: 'pending', // Default status for new documents
                    dateCreated: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
            }
            
            localStorage.setItem('telus_document_status', JSON.stringify(documents));
            
            // Save assignment tracking
            saveAssignment('document', docId, assignedUsers);
            
            // Trigger storage event for cross-tab sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'telus_document_status',
                newValue: JSON.stringify(documents),
                storageArea: localStorage
            }));
            
            return true;
        }
    } catch (error) {
        console.error('Error saving document:', error);
        return false;
    }
}

function saveContent(data) {
    try {
        if (!DataManager) return false;
        
        if (editingItemId) {
            // Update existing content
            return DataManager.updateContent(editingItemId, data);
        } else {
            // Add new content
            const newContent = DataManager.addContent({
                ...data,
                imageUrl: data.imageUrl || 'https://via.placeholder.com/300x200/6c757d/ffffff?text=No+Image'
            });
            return !!newContent;
        }
    } catch (error) {
        console.error('Error saving content:', error);
        return false;
    }
}

function saveUser(data) {
    try {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Create comprehensive user profile for expertise hub integration
        const expertiseUser = {
            id: editingItemId ? editingItemId : Date.now(),
            name: data.name,
            designation: data.designation,
            role: data.role,
            pod: data.pod,
            email: data.email,
            phone: data.phone || '+1 (555) 123-4567',
            location: data.location || 'Vancouver, BC',
            experience: data.experience || '3-5 years',
            skills: data.skills ? data.skills.split(',').map(s => s.trim()) : ['Product Strategy', 'Agile', 'Analytics'],
            currentProject: data.currentProject || 'Digital Platform Enhancement',
            availability: data.availability || 'Available',
            avatar: generateDefaultAvatar(data.name),
            description: data.description || 'Experienced professional focused on delivering innovative solutions and driving team collaboration.',
            dateCreated: new Date().toISOString(),
            // Keep password for admin user management
            password: data.password || 'defaultPassword123'
        };
        
        if (editingItemId) {
            // Update existing user
            const userIndex = editingItemId - 1;
            if (userIndex < users.length) {
                users[userIndex] = { ...users[userIndex], ...expertiseUser };
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                // Update expertise hub data
                updateExpertiseHubUser(expertiseUser);
                
                console.log('User updated and synced to expertise hub:', expertiseUser);
                return true;
            }
        } else {
            // Add new user
            users.push(expertiseUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // Add to expertise hub
            addToExpertiseHub(expertiseUser);
            
            console.log('New user created and added to expertise hub:', expertiseUser);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error saving user:', error);
        return false;
    }
}

// Add user to expertise hub
function addToExpertiseHub(user) {
    try {
        // Get existing expertise hub users
        const expertiseUsers = JSON.parse(localStorage.getItem('expertise_hub_users') || '[]');
        
        // Add new user to expertise hub
        expertiseUsers.push(user);
        localStorage.setItem('expertise_hub_users', JSON.stringify(expertiseUsers));
        
        // Trigger sync event for expertise hub
        window.dispatchEvent(new CustomEvent('expertiseHubUserAdded', {
            detail: { user: user, source: 'admin' }
        }));
        
        console.log('User added to expertise hub:', user.name);
    } catch (error) {
        console.error('Error adding user to expertise hub:', error);
    }
}

// Update user in expertise hub
function updateExpertiseHubUser(user) {
    try {
        // Get existing expertise hub users
        const expertiseUsers = JSON.parse(localStorage.getItem('expertise_hub_users') || '[]');
        
        // Find and update user
        const userIndex = expertiseUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            expertiseUsers[userIndex] = user;
        } else {
            // If not found, add as new user
            expertiseUsers.push(user);
        }
        
        localStorage.setItem('expertise_hub_users', JSON.stringify(expertiseUsers));
        
        // Trigger sync event for expertise hub
        window.dispatchEvent(new CustomEvent('expertiseHubUserUpdated', {
            detail: { user: user, source: 'admin' }
        }));
        
        console.log('User updated in expertise hub:', user.name);
    } catch (error) {
        console.error('Error updating user in expertise hub:', error);
    }
}

// Activity and logging functions
function loadRecentActivity() {
    const activityFeed = document.getElementById('adminActivityFeed');
    if (!activityFeed) return;
    
    const activities = getAdminActivities();
    
    if (activities.length === 0) {
        activityFeed.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">No recent activity</div>
                    <div class="activity-description">System activity will appear here</div>
                    <div class="activity-time">-</div>
                </div>
            </div>
        `;
        return;
    }
    
    activityFeed.innerHTML = '';
    activities.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityFeed.appendChild(activityItem);
    });
}

function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const icon = getActivityIcon(activity.type);
    const timeAgo = getTimeAgo(activity.timestamp);
    
    item.innerHTML = `
        <div class="activity-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-title">${activity.action}</div>
            <div class="activity-description">${activity.details}</div>
            <div class="activity-time">${timeAgo}</div>
        </div>
    `;
    
    return item;
}

function getActivityIcon(type) {
    const icons = {
        'login': 'fa-sign-in-alt',
        'add': 'fa-plus-circle',
        'edit': 'fa-edit',
        'delete': 'fa-trash',
        'update': 'fa-sync-alt',
        'default': 'fa-info-circle'
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

function logAdminActivity(action, details) {
    const activities = getAdminActivities();
    const newActivity = {
        id: Date.now(),
        type: action.toLowerCase().includes('login') ? 'login' :
              action.toLowerCase().includes('add') ? 'add' :
              action.toLowerCase().includes('edit') || action.toLowerCase().includes('update') ? 'edit' :
              action.toLowerCase().includes('delete') ? 'delete' : 'default',
        action,
        details,
        timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    
    // Keep only last 20 activities
    const limitedActivities = activities.slice(0, 20);
    localStorage.setItem('adminActivities', JSON.stringify(limitedActivities));
    
    // Refresh activity display if on overview section
    if (currentSection === 'overview') {
        loadRecentActivity();
    }
}

function getAdminActivities() {
    const activities = localStorage.getItem('adminActivities');
    return activities ? JSON.parse(activities) : [];
}

// Utility functions
function refreshAllData() {
    const refreshBtn = document.querySelector('[onclick="refreshAllData()"]');
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
    }
    
    setTimeout(() => {
        loadAllData();
        updateAdminStats();
        loadSectionData(currentSection);
        loadRecentActivity();
        
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
        
        showMessage('Data refreshed successfully!', 'success');
        logAdminActivity('Data Refresh', 'Administrator refreshed all dashboard data');
    }, 1000);
}

function refreshActivity() {
    loadRecentActivity();
    showMessage('Activity refreshed!', 'info');
}

function exportAnalytics() {
    showMessage('Analytics export functionality coming soon!', 'info');
    logAdminActivity('Export Analytics', 'Administrator requested analytics export');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.admin-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} admin-message`;
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

function logout() {
    // Log logout activity
    logAdminActivity('Admin Logout', 'Administrator logged out of admin dashboard');
    
    // Clear session
    localStorage.removeItem('currentUser');
    
    // Redirect to landing page
    window.location.href = 'index.html';
}

// File upload handling
function setupFileUploadHandling() {
    const fileInput = document.getElementById('docFile');
    const fileDisplay = document.getElementById('docFileDisplay');
    const uploadBtn = document.querySelector('.file-upload-btn');
    
    if (fileInput && fileDisplay && uploadBtn) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (file.type !== 'application/pdf') {
                    showMessage('Please select a PDF file only.', 'error');
                    fileInput.value = '';
                    fileDisplay.style.display = 'none';
                    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose PDF File';
                    return;
                }
                
                // Validate file size (10MB limit)
                const maxSize = 10 * 1024 * 1024; // 10MB in bytes
                if (file.size > maxSize) {
                    showMessage('File size must be less than 10MB.', 'error');
                    fileInput.value = '';
                    fileDisplay.style.display = 'none';
                    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose PDF File';
                    return;
                }
                
                // Display selected file
                fileDisplay.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
                fileDisplay.style.display = 'block';
                uploadBtn.innerHTML = '<i class="fas fa-check"></i> File Selected';
                uploadBtn.style.background = 'var(--telus-green)';
                uploadBtn.style.borderColor = 'var(--telus-green)';
                uploadBtn.style.color = 'var(--telus-white)';
            } else {
                // Reset if no file selected
                fileDisplay.style.display = 'none';
                uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choose PDF File';
                uploadBtn.style.background = 'var(--telus-white)';
                uploadBtn.style.borderColor = 'var(--telus-purple)';
                uploadBtn.style.color = 'var(--telus-purple)';
            }
        });
        
        // Handle drag and drop
        uploadBtn.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadBtn.style.background = 'rgba(75, 40, 109, 0.1)';
        });
        
        uploadBtn.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadBtn.style.background = 'var(--telus-white)';
        });
        
        uploadBtn.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadBtn.style.background = 'var(--telus-white)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }
}

// Format file size for display
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Document approval/rejection functions
function approveDocument(docId) {
    updateDocumentStatus(docId, 'approved', 'Document approved by administrator');
}

function rejectDocument(docId) {
    updateDocumentStatus(docId, 'rejected', 'Document rejected by administrator');
}

function updateDocumentStatus(docId, status, adminNote) {
    const docData = localStorage.getItem('telus_document_status');
    if (docData) {
        try {
            const documents = JSON.parse(docData);
            if (documents[docId]) {
                documents[docId] = {
                    ...documents[docId],
                    status: status,
                    lastModified: new Date().toISOString(),
                    adminNote: adminNote,
                    reviewDate: new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })
                };
                
                // Save back to localStorage
                localStorage.setItem('telus_document_status', JSON.stringify(documents));
                
                // Trigger storage event for user side sync
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'telus_document_status',
                    newValue: JSON.stringify(documents),
                    storageArea: localStorage
                }));
                
                // Also trigger custom event for same-tab sync
                window.dispatchEvent(new CustomEvent('telusDataSync', {
                    detail: { type: 'documents', source: 'admin', data: documents }
                }));
                
                // Refresh admin dashboard
                loadDocumentData();
                updateAdminStats();
                loadDocumentsTable();
                
                // Log activity
                const actionText = status === 'approved' ? 'approved' : 'rejected';
                logAdminActivity(`Document ${actionText}`, `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} document: ${documents[docId].title}`);
                
                // Show success message
                showMessage(`Document ${actionText} successfully!`, 'success');
                
                console.log(`Document ${docId} ${actionText}`);
            }
        } catch (error) {
            console.error('Error updating document status:', error);
            showMessage('Error updating document status', 'error');
        }
    }
}

function previewDocumentSubmission(docId) {
    const docData = localStorage.getItem('telus_document_status');
    if (docData) {
        try {
            const documents = JSON.parse(docData);
            const doc = documents[docId];
            if (doc) {
                const userResponse = doc.userResponse || 'No user response available';
                const uploadDate = doc.uploadDate || 'Unknown';
                const dueDate = doc.dueDate ? new Date(doc.dueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }) : 'No due date';
                
                // Create enhanced preview modal
                const previewModal = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.6);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                        backdrop-filter: blur(2px);
                    " onclick="this.remove()">
                        <div style="
                            background: white;
                            padding: 0;
                            border-radius: 16px;
                            max-width: 600px;
                            width: 95%;
                            max-height: 90vh;
                            overflow: hidden;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            animation: modalSlideIn 0.3s ease-out;
                        " onclick="event.stopPropagation()">
                            <style>
                                @keyframes modalSlideIn {
                                    from { transform: translateY(-20px); opacity: 0; }
                                    to { transform: translateY(0); opacity: 1; }
                                }
                            </style>
                            
                            <!-- Header -->
                            <div style="
                                background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                                color: white;
                                padding: 25px 30px;
                                border-radius: 16px 16px 0 0;
                            ">
                                <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center;">
                                    <i class="fas fa-search" style="margin-right: 12px; font-size: 1.2em;"></i>
                                    Document Submission Preview
                                </h3>
                                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.95em;">
                                    Review user submission and take action
                                </p>
                            </div>
                            
                            <!-- Content -->
                            <div style="padding: 30px; max-height: 60vh; overflow-y: auto;">
                                <!-- Document Info -->
                                <div style="
                                    background: #f8f9fa;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid var(--telus-purple);
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: var(--telus-purple); font-size: 1.1em;">
                                        <i class="fas fa-file-alt" style="margin-right: 8px;"></i>
                                        Document Information
                                    </h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.95em;">
                                        <div>
                                            <strong style="color: #495057;">Document Name:</strong><br>
                                            <span style="color: #212529;">${doc.title}</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Priority:</strong><br>
                                            <span style="
                                                color: ${doc.priority === 'high' ? '#dc3545' : doc.priority === 'medium' ? '#fd7e14' : '#28a745'};
                                                font-weight: 600;
                                                text-transform: capitalize;
                                            ">${doc.priority || 'Medium'} Priority</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Due Date:</strong><br>
                                            <span style="color: #212529;">${dueDate}</span>
                                        </div>
                                        <div>
                                            <strong style="color: #495057;">Upload Date:</strong><br>
                                            <span style="color: #212529;">${uploadDate}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- User Response -->
                                <div style="
                                    background: #e3f2fd;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid #2196f3;
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: #1976d2; font-size: 1.1em;">
                                        <i class="fas fa-user-edit" style="margin-right: 8px;"></i>
                                        User Submission Details
                                    </h4>
                                    <div style="
                                        background: white;
                                        padding: 15px;
                                        border-radius: 8px;
                                        border: 1px solid #bbdefb;
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                        line-height: 1.5;
                                        color: #212529;
                                    ">
                                        ${userResponse}
                                    </div>
                                </div>
                                
                                <!-- Description -->
                                ${doc.description ? `
                                <div style="
                                    background: #f1f8e9;
                                    border-radius: 12px;
                                    padding: 20px;
                                    margin-bottom: 25px;
                                    border-left: 4px solid #4caf50;
                                ">
                                    <h4 style="margin: 0 0 15px 0; color: #388e3c; font-size: 1.1em;">
                                        <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                                        Document Description
                                    </h4>
                                    <p style="margin: 0; color: #212529; line-height: 1.6;">
                                        ${doc.description}
                                    </p>
                                </div>
                                ` : ''}
                            </div>
                            
                            <!-- Actions -->
                            <div style="
                                background: #f8f9fa;
                                padding: 25px 30px;
                                border-radius: 0 0 16px 16px;
                                border-top: 1px solid #e9ecef;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                flex-wrap: wrap;
                                gap: 15px;
                            ">
                                <div style="color: #6c757d; font-size: 0.9em;">
                                    <i class="fas fa-clock" style="margin-right: 5px;"></i>
                                    Awaiting your decision
                                </div>
                                <div style="display: flex; gap: 12px;">
                                    <button id="approveBtn_${docId}" 
                                            style="
                                                background: linear-gradient(135deg, #28a745, #20c997);
                                                color: white;
                                                border: none;
                                                padding: 12px 24px;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-weight: 600;
                                                font-size: 0.95em;
                                                transition: all 0.2s ease;
                                                box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
                                            "
                                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(40, 167, 69, 0.4)';"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(40, 167, 69, 0.3)';">
                                        <i class="fas fa-check" style="margin-right: 8px;"></i>
                                        Approve Document
                                    </button>
                                    <button id="rejectBtn_${docId}" 
                                            style="
                                                background: linear-gradient(135deg, #dc3545, #e74c3c);
                                                color: white;
                                                border: none;
                                                padding: 12px 24px;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-weight: 600;
                                                font-size: 0.95em;
                                                transition: all 0.2s ease;
                                                box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
                                            "
                                            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(220, 53, 69, 0.4)';"
                                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(220, 53, 69, 0.3)';">
                                        <i class="fas fa-times" style="margin-right: 8px;"></i>
                                        Reject Document
                                    </button>
                                    <button id="closeBtn_${docId}" 
                                            style="
                                                background: #6c757d;
                                                color: white;
                                                border: none;
                                                padding: 12px 20px;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-weight: 500;
                                                font-size: 0.95em;
                                                transition: all 0.2s ease;
                                            "
                                            onmouseover="this.style.background='#5a6268';"
                                            onmouseout="this.style.background='#6c757d';">
                                        <i class="fas fa-times" style="margin-right: 8px;"></i>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add modal to page
                document.body.insertAdjacentHTML('beforeend', previewModal);
                
                // Add event listeners to the buttons after modal is added to DOM
                setTimeout(() => {
                    const approveBtn = document.getElementById(`approveBtn_${docId}`);
                    const rejectBtn = document.getElementById(`rejectBtn_${docId}`);
                    const closeBtn = document.getElementById(`closeBtn_${docId}`);
                    
                    if (approveBtn) {
                        approveBtn.addEventListener('click', function() {
                            approveDocument(docId);
                            // Close modal
                            const modal = this.closest('div[style*="position: fixed"]');
                            if (modal) modal.remove();
                        });
                    }
                    
                    if (rejectBtn) {
                        rejectBtn.addEventListener('click', function() {
                            rejectDocument(docId);
                            // Close modal
                            const modal = this.closest('div[style*="position: fixed"]');
                            if (modal) modal.remove();
                        });
                    }
                    
                    if (closeBtn) {
                        closeBtn.addEventListener('click', function() {
                            // Close modal
                            const modal = this.closest('div[style*="position: fixed"]');
                            if (modal) modal.remove();
                        });
                    }
                }, 100); // Small delay to ensure DOM is ready
            }
        } catch (error) {
            console.error('Error previewing document submission:', error);
            showMessage('Error loading document preview', 'error');
        }
    }
}

function viewDocumentResponse(docId) {
    // Redirect to the new preview function
    previewDocumentSubmission(docId);
}

// Setup auto-email generation for user form
function setupAutoEmailGeneration() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    
    if (nameInput && emailInput) {
        nameInput.addEventListener('input', function(e) {
            const name = e.target.value.trim();
            if (name) {
                // Generate email from name
                const emailName = name.toLowerCase()
                    .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
                    .replace(/\s+/g, '.') // Replace spaces with dots
                    .replace(/\.+/g, '.') // Replace multiple dots with single dot
                    .replace(/^\.+|\.+$/g, ''); // Remove leading/trailing dots
                
                emailInput.value = `${emailName}@telus.com`;
            } else {
                emailInput.value = 'user.name@telus.com';
            }
        });
    }
}

// Generate default avatar from initials
function generateDefaultAvatar(name) {
    if (!name) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';
    
    const initials = name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    
    // Use a placeholder service for avatar generation
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=120&background=4b286d&color=ffffff&bold=true`;
}

// Generate user options for assignment dropdown
function getUserOptionsForAssignment() {
    try {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Combine all users (exclude current admin from assignment options)
        const allUsers = users.filter(user => user.email && user.role !== 'admin');
        
        // Add demo user if not already in the list
        const demoUserExists = allUsers.some(user => user.email === 'user@demo.com');
        if (!demoUserExists) {
            allUsers.unshift({
                name: 'Demo User',
                email: 'user@demo.com',
                designation: 'Team Member',
                pod: 'Platform'
            });
        }
        
        if (allUsers.length === 0) {
            return '<option value="" disabled>No users available for assignment</option>';
        }
        
        // Group users by POD for better organization
        const usersByPod = {};
        allUsers.forEach(user => {
            const pod = user.pod || 'No POD';
            if (!usersByPod[pod]) {
                usersByPod[pod] = [];
            }
            usersByPod[pod].push(user);
        });
        
        let optionsHTML = '';
        
        // Create optgroups for each POD
        Object.keys(usersByPod).sort().forEach(pod => {
            optionsHTML += `<optgroup label="${pod} Team">`;
            usersByPod[pod].forEach(user => {
                const displayName = `${user.name} (${user.designation || 'Team Member'})`;
                optionsHTML += `<option value="${user.email}">${displayName}</option>`;
            });
            optionsHTML += '</optgroup>';
        });
        
        return optionsHTML;
    } catch (error) {
        console.error('Error generating user options:', error);
        return '<option value="" disabled>Error loading users</option>';
    }
}

// Assignment tracking functions (Phase 2)
function saveAssignment(type, itemId, assignedUsers) {
    try {
        // Get existing assignments
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        
        // Clean assigned users array (remove 'all' if other users are selected)
        let cleanedUsers = assignedUsers.filter(user => user && user.trim() !== '');
        if (cleanedUsers.includes('all') && cleanedUsers.length > 1) {
            cleanedUsers = cleanedUsers.filter(user => user !== 'all');
        }
        
        // If no specific users selected or only 'all' selected, make it visible to all
        if (cleanedUsers.length === 0 || (cleanedUsers.length === 1 && cleanedUsers[0] === 'all')) {
            cleanedUsers = ['all'];
        }
        
        // Save assignment
        assignments[itemId] = {
            type: type,
            assignedUsers: cleanedUsers,
            dateAssigned: new Date().toISOString(),
            assignedBy: 'admin'
        };
        
        localStorage.setItem('telus_user_assignments', JSON.stringify(assignments));
        
        console.log(`Assignment saved for ${type} ${itemId}:`, cleanedUsers);
        
        // Trigger assignment sync event
        window.dispatchEvent(new CustomEvent('assignmentUpdated', {
            detail: { 
                type: type, 
                itemId: itemId, 
                assignedUsers: cleanedUsers,
                source: 'admin' 
            }
        }));
        
        return true;
    } catch (error) {
        console.error('Error saving assignment:', error);
        return false;
    }
}

function getAssignment(itemId) {
    try {
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        return assignments[itemId] || null;
    } catch (error) {
        console.error('Error getting assignment:', error);
        return null;
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

function getAssignmentSummary() {
    try {
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        const summary = {
            totalAssignments: 0,
            taskAssignments: 0,
            documentAssignments: 0,
            userAssignmentCounts: {}
        };
        
        Object.values(assignments).forEach(assignment => {
            summary.totalAssignments++;
            
            if (assignment.type === 'task') {
                summary.taskAssignments++;
            } else if (assignment.type === 'document') {
                summary.documentAssignments++;
            }
            
            // Count assignments per user
            assignment.assignedUsers.forEach(userEmail => {
                if (userEmail !== 'all') {
                    summary.userAssignmentCounts[userEmail] = (summary.userAssignmentCounts[userEmail] || 0) + 1;
                }
            });
        });
        
        return summary;
    } catch (error) {
        console.error('Error getting assignment summary:', error);
        return {
            totalAssignments: 0,
            taskAssignments: 0,
            documentAssignments: 0,
            userAssignmentCounts: {}
        };
    }
}

// Assignment Management Functions (Phase 4)
function loadAssignmentManagement() {
    const assignmentTableBody = document.getElementById('assignmentTableBody');
    if (!assignmentTableBody) return;
    
    try {
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
        const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        if (Object.keys(assignments).length === 0) {
            assignmentTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No assignments found</td></tr>';
            return;
        }
        
        assignmentTableBody.innerHTML = '';
        
        Object.entries(assignments).forEach(([itemId, assignment]) => {
            const row = createAssignmentRow(itemId, assignment, tasks, documents, users);
            assignmentTableBody.appendChild(row);
        });
        
        // Update assignment summary
        updateAssignmentSummary();
        
    } catch (error) {
        console.error('Error loading assignment management:', error);
        assignmentTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading assignments</td></tr>';
    }
}

function createAssignmentRow(itemId, assignment, tasks, documents, users) {
    const row = document.createElement('tr');
    
    // Get item details
    const item = assignment.type === 'task' ? tasks[itemId] : documents[itemId];
    const itemTitle = item ? item.title : 'Unknown Item';
    const itemStatus = item ? item.status : 'unknown';
    
    // Get assigned user names
    const assignedUserNames = assignment.assignedUsers.map(email => {
        if (email === 'all') return 'All Users';
        const user = users.find(u => u.email === email);
        return user ? user.name : email;
    }).join(', ');
    
    // Status badge
    const statusBadge = itemStatus === 'completed' || itemStatus === 'approved'
        ? '<span class="status-badge success">Completed</span>'
        : itemStatus === 'pending'
        ? '<span class="status-badge warning">Pending</span>'
        : itemStatus === 'under-review'
        ? '<span class="status-badge info">Under Review</span>'
        : '<span class="status-badge secondary">Unknown</span>';
    
    // Type badge
    const typeBadge = assignment.type === 'task'
        ? '<span class="type-badge task"><i class="fas fa-tasks"></i> Task</span>'
        : '<span class="type-badge document"><i class="fas fa-file-alt"></i> Document</span>';
    
    // Date assigned
    const dateAssigned = assignment.dateAssigned 
        ? new Date(assignment.dateAssigned).toLocaleDateString()
        : 'Unknown';
    
    row.innerHTML = `
        <td>
            <div class="item-title-cell">
                <strong>${itemTitle}</strong>
                <div class="item-id-small">ID: ${itemId}</div>
            </div>
        </td>
        <td>${typeBadge}</td>
        <td>
            <div class="assigned-users-cell">
                ${assignedUserNames}
                <div class="user-count-small">${assignment.assignedUsers.length} user(s)</div>
            </div>
        </td>
        <td>${statusBadge}</td>
        <td>${dateAssigned}</td>
        <td>
            <button class="action-btn view" onclick="viewAssignmentDetails('${itemId}')" title="View Assignment Details">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn edit" onclick="editAssignment('${itemId}')" title="Edit Assignment">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="confirmDeleteAssignment('${itemId}')" title="Remove Assignment">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

function updateAssignmentSummary() {
    const summary = getAssignmentSummary();
    
    // Update summary cards
    updateElement('totalAssignments', summary.totalAssignments);
    updateElement('taskAssignments', summary.taskAssignments);
    updateElement('documentAssignments', summary.documentAssignments);
    
    // Update user assignment breakdown
    const userBreakdown = document.getElementById('userAssignmentBreakdown');
    if (userBreakdown) {
        let breakdownHTML = '';
        const sortedUsers = Object.entries(summary.userAssignmentCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // Top 5 users
        
        if (sortedUsers.length === 0) {
            breakdownHTML = '<div class="no-data">No specific user assignments</div>';
        } else {
            sortedUsers.forEach(([email, count]) => {
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const user = users.find(u => u.email === email);
                const userName = user ? user.name : email;
                
                breakdownHTML += `
                    <div class="user-assignment-item">
                        <span class="user-name">${userName}</span>
                        <span class="assignment-count">${count} assignments</span>
                    </div>
                `;
            });
        }
        
        userBreakdown.innerHTML = breakdownHTML;
    }
}

function viewAssignmentDetails(itemId) {
    const assignment = getAssignment(itemId);
    if (!assignment) {
        showMessage('Assignment not found', 'error');
        return;
    }
    
    const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
    const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const item = assignment.type === 'task' ? tasks[itemId] : documents[itemId];
    const itemTitle = item ? item.title : 'Unknown Item';
    const itemDescription = item ? item.description : 'No description available';
    
    // Get assigned user details
    const assignedUserDetails = assignment.assignedUsers.map(email => {
        if (email === 'all') return { name: 'All Users', email: 'all', designation: 'Everyone' };
        const user = users.find(u => u.email === email);
        return user ? { 
            name: user.name, 
            email: user.email, 
            designation: user.designation || 'Team Member',
            pod: user.pod || 'No POD'
        } : { name: email, email: email, designation: 'Unknown' };
    });
    
    // Create assignment details modal
    const assignmentDetailModal = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(2px);
        " onclick="this.remove()">
            <div style="
                background: white;
                padding: 0;
                border-radius: 16px;
                max-width: 700px;
                width: 95%;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease-out;
            " onclick="event.stopPropagation()">
                <style>
                    @keyframes modalSlideIn {
                        from { transform: translateY(-20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                </style>
                
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                    color: white;
                    padding: 25px 30px;
                    border-radius: 16px 16px 0 0;
                ">
                    <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center;">
                        <i class="fas fa-user-check" style="margin-right: 12px; font-size: 1.2em;"></i>
                        Assignment Details
                    </h3>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.95em;">
                        Complete assignment information and user details
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px; max-height: 60vh; overflow-y: auto;">
                    <!-- Item Information -->
                    <div style="
                        background: #f8f9fa;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 25px;
                        border-left: 4px solid var(--telus-purple);
                    ">
                        <h4 style="margin: 0 0 15px 0; color: var(--telus-purple); font-size: 1.1em;">
                            <i class="fas fa-${assignment.type === 'task' ? 'tasks' : 'file-alt'}" style="margin-right: 8px;"></i>
                            ${assignment.type === 'task' ? 'Task' : 'Document'} Information
                        </h4>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #495057;">Title:</strong><br>
                            <span style="color: #212529; font-size: 1.1em;">${itemTitle}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #495057;">Description:</strong><br>
                            <div style="
                                background: white;
                                padding: 12px;
                                border-radius: 6px;
                                border: 1px solid #dee2e6;
                                margin-top: 5px;
                                color: #212529;
                                line-height: 1.5;
                            ">
                                ${itemDescription}
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <strong style="color: #495057;">Item ID:</strong><br>
                                <span style="color: #6c757d; font-family: monospace;">${itemId}</span>
                            </div>
                            <div>
                                <strong style="color: #495057;">Date Assigned:</strong><br>
                                <span style="color: #212529;">${new Date(assignment.dateAssigned).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Assigned Users -->
                    <div style="
                        background: #e8f5e8;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 25px;
                        border-left: 4px solid #28a745;
                    ">
                        <h4 style="margin: 0 0 15px 0; color: #155724; font-size: 1.1em;">
                            <i class="fas fa-users" style="margin-right: 8px;"></i>
                            Assigned Users (${assignedUserDetails.length})
                        </h4>
                        <div style="display: grid; gap: 12px;">
                            ${assignedUserDetails.map(user => `
                                <div style="
                                    background: white;
                                    padding: 15px;
                                    border-radius: 8px;
                                    border: 1px solid #c3e6cb;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <div>
                                        <div style="font-weight: 600; color: #212529;">${user.name}</div>
                                        <div style="color: #6c757d; font-size: 0.9em;">${user.designation}</div>
                                        ${user.pod && user.pod !== 'No POD' ? `<div style="color: #6c757d; font-size: 0.8em;">${user.pod} Team</div>` : ''}
                                    </div>
                                    <div style="color: #6c757d; font-size: 0.9em;">
                                        ${user.email}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
                <div style="
                    background: #f8f9fa;
                    padding: 25px 30px;
                    border-radius: 0 0 16px 16px;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                ">
                    <div style="color: #6c757d; font-size: 0.9em;">
                        <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                        Assigned by ${assignment.assignedBy || 'admin'}
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="editAssignment('${itemId}'); this.closest('div[style*=\"position: fixed\"]').remove();" 
                                style="
                                    background: linear-gradient(135deg, #007bff, #0056b3);
                                    color: white;
                                    border: none;
                                    padding: 12px 24px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                    font-size: 0.95em;
                                    transition: all 0.2s ease;
                                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                                "
                                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0, 123, 255, 0.4)';"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0, 123, 255, 0.3)';">
                            <i class="fas fa-edit" style="margin-right: 8px;"></i>
                            Edit Assignment
                        </button>
                        <button onclick="this.closest('div[style*=\"position: fixed\"]').remove();" 
                                style="
                                    background: #6c757d;
                                    color: white;
                                    border: none;
                                    padding: 12px 20px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 500;
                                    font-size: 0.95em;
                                    transition: all 0.2s ease;
                                "
                                onmouseover="this.style.background='#5a6268';"
                                onmouseout="this.style.background='#6c757d';">
                            <i class="fas fa-times" style="margin-right: 8px;"></i>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', assignmentDetailModal);
}

function editAssignment(itemId) {
    const assignment = getAssignment(itemId);
    if (!assignment) {
        showMessage('Assignment not found', 'error');
        return;
    }
    
    // Get the original item to edit its assignment
    if (assignment.type === 'task') {
        editTask(itemId);
    } else if (assignment.type === 'document') {
        editDocument(itemId);
    }
}

function confirmDeleteAssignment(itemId) {
    confirmCallback = () => deleteAssignment(itemId);
    showConfirmModal('Are you sure you want to remove this assignment? The item will become visible to all users.');
}

function deleteAssignment(itemId) {
    try {
        const assignments = JSON.parse(localStorage.getItem('telus_user_assignments') || '{}');
        
        if (assignments[itemId]) {
            delete assignments[itemId];
            localStorage.setItem('telus_user_assignments', JSON.stringify(assignments));
            
            // Trigger assignment update event
            window.dispatchEvent(new CustomEvent('assignmentUpdated', {
                detail: { 
                    type: 'assignment_deleted', 
                    itemId: itemId, 
                    source: 'admin' 
                }
            }));
            
            // Refresh assignment management if currently viewing
            if (currentSection === 'assignments') {
                loadAssignmentManagement();
            }
            
            logAdminActivity('Assignment Deleted', `Removed assignment for item ${itemId}`);
            showMessage('Assignment removed successfully! Item is now visible to all users.', 'success');
        } else {
            showMessage('Assignment not found', 'error');
        }
    } catch (error) {
        console.error('Error deleting assignment:', error);
        showMessage('Error removing assignment', 'error');
    }
    closeConfirmModal();
}

// Export functions for global access
window.switchToSection = switchToSection;
window.addNewTask = addNewTask;
window.addNewDocument = addNewDocument;
window.addNewContent = addNewContent;
window.addNewUser = addNewUser;
window.editTask = editTask;
window.editDocument = editDocument;
window.editContent = editContent;
window.editUser = editUser;
window.viewDocument = viewDocument;
window.viewDocumentResponse = viewDocumentResponse;
window.previewDocumentSubmission = previewDocumentSubmission;
window.approveDocument = approveDocument;
window.rejectDocument = rejectDocument;
window.confirmDeleteTask = confirmDeleteTask;
window.confirmDeleteDocument = confirmDeleteDocument;
window.confirmDeleteContent = confirmDeleteContent;
window.confirmDeleteUser = confirmDeleteUser;
window.showQuickAddModal = showQuickAddModal;
window.closeQuickAddModal = closeQuickAddModal;
window.closeFormModal = closeFormModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmAction = confirmAction;
window.refreshAllData = refreshAllData;
window.refreshActivity = refreshActivity;
window.exportAnalytics = exportAnalytics;
window.logout = logout;
window.loadAssignmentManagement = loadAssignmentManagement;
window.viewAssignmentDetails = viewAssignmentDetails;
window.editAssignment = editAssignment;
window.confirmDeleteAssignment = confirmDeleteAssignment;
window.openUserSelectionModal = openUserSelectionModal;

// User Selection Modal Functions
function openUserSelectionModal(formType) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Add demo user if not already in the list
    const demoUserExists = users.some(user => user.email === 'user@demo.com');
    if (!demoUserExists) {
        users.unshift({
            name: 'Demo User',
            email: 'user@demo.com',
            designation: 'Team Member',
            pod: 'Platform'
        });
    }
    
    // Group users by POD
    const usersByPod = {};
    users.forEach(user => {
        if (user.email && user.role !== 'admin') {
            const pod = user.pod || 'No POD';
            if (!usersByPod[pod]) {
                usersByPod[pod] = [];
            }
            usersByPod[pod].push(user);
        }
    });
    
    // Create modal HTML
    const modalHTML = `
        <div id="userSelectionModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(2px);
        " onclick="closeUserSelectionModal()">
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 95%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease-out;
            " onclick="event.stopPropagation()">
                
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                    color: white;
                    padding: 20px 25px;
                    border-radius: 16px 16px 0 0;
                ">
                    <h3 style="margin: 0; font-size: 1.3em; display: flex; align-items: center;">
                        <i class="fas fa-users" style="margin-right: 10px;"></i>
                        Select Users to Assign
                    </h3>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.9em;">
                        Choose specific users or leave as "All Users" for everyone
                    </p>
                </div>
                
                <!-- Content -->
                <div style="padding: 25px; max-height: 50vh; overflow-y: auto;">
                    <!-- All Users Option -->
                    <div style="
                        background: #f8f9fa;
                        border: 2px solid #e9ecef;
                        border-radius: 12px;
                        padding: 15px;
                        margin-bottom: 20px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    " onclick="selectAllUsers('${formType}')" 
                       onmouseover="this.style.borderColor='var(--telus-purple)'; this.style.background='#f3e5f5';"
                       onmouseout="this.style.borderColor='#e9ecef'; this.style.background='#f8f9fa';">
                        <div style="display: flex; align-items: center;">
                            <div style="
                                width: 20px;
                                height: 20px;
                                border: 2px solid var(--telus-purple);
                                border-radius: 4px;
                                margin-right: 12px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: var(--telus-purple);
                            " id="allUsersCheckbox">
                                <i class="fas fa-check" style="color: white; font-size: 12px;"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #212529;">All Users (Default)</div>
                                <div style="color: #6c757d; font-size: 0.9em;">Visible to everyone in the organization</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- User Groups by POD -->
                    ${Object.keys(usersByPod).sort().map(pod => `
                        <div style="margin-bottom: 20px;">
                            <h4 style="
                                color: var(--telus-purple);
                                font-size: 1.1em;
                                margin: 0 0 12px 0;
                                padding-bottom: 8px;
                                border-bottom: 2px solid #e9ecef;
                            ">
                                <i class="fas fa-users" style="margin-right: 8px;"></i>
                                ${pod} Team
                            </h4>
                            <div style="display: grid; gap: 8px;">
                                ${usersByPod[pod].map(user => `
                                    <div style="
                                        background: white;
                                        border: 2px solid #e9ecef;
                                        border-radius: 8px;
                                        padding: 12px;
                                        cursor: pointer;
                                        transition: all 0.2s ease;
                                    " onclick="toggleUserSelection('${user.email}', '${formType}')"
                                       onmouseover="this.style.borderColor='var(--telus-purple)'; this.style.background='#f3e5f5';"
                                       onmouseout="updateUserHoverState(this, '${user.email}');"
                                       data-user-email="${user.email}">
                                        <div style="display: flex; align-items: center;">
                                            <div style="
                                                width: 18px;
                                                height: 18px;
                                                border: 2px solid #dee2e6;
                                                border-radius: 4px;
                                                margin-right: 12px;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                            " class="user-checkbox" data-email="${user.email}">
                                            </div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; color: #212529;">${user.name}</div>
                                                <div style="color: #6c757d; font-size: 0.85em;">${user.designation || 'Team Member'}</div>
                                            </div>
                                            <div style="color: #6c757d; font-size: 0.8em;">
                                                ${user.email}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Footer -->
                <div style="
                    background: #f8f9fa;
                    padding: 20px 25px;
                    border-radius: 0 0 16px 16px;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="color: #6c757d; font-size: 0.9em;">
                        <span id="selectedCount">1 user selected (All Users)</span>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="applyUserSelection('${formType}')" style="
                            background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 0.95em;
                            transition: all 0.2s ease;
                        ">
                            <i class="fas fa-check" style="margin-right: 8px;"></i>
                            Apply Selection
                        </button>
                        <button onclick="closeUserSelectionModal()" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            font-size: 0.95em;
                            transition: all 0.2s ease;
                        ">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize selection state
    window.selectedUsers = ['all'];
    window.currentFormType = formType;
}

function selectAllUsers(formType) {
    window.selectedUsers = ['all'];
    updateSelectionDisplay();
    updateSelectedCount();
}

function toggleUserSelection(userEmail, formType) {
    if (!window.selectedUsers) window.selectedUsers = ['all'];
    
    // If "all" is currently selected, clear it when selecting specific users
    if (window.selectedUsers.includes('all') && userEmail !== 'all') {
        window.selectedUsers = [];
    }
    
    // Toggle user selection
    const index = window.selectedUsers.indexOf(userEmail);
    if (index > -1) {
        window.selectedUsers.splice(index, 1);
    } else {
        window.selectedUsers.push(userEmail);
    }
    
    // If no users selected, default back to "all"
    if (window.selectedUsers.length === 0) {
        window.selectedUsers = ['all'];
    }
    
    updateSelectionDisplay();
    updateSelectedCount();
}

function updateSelectionDisplay() {
    // Update all users checkbox
    const allUsersCheckbox = document.getElementById('allUsersCheckbox');
    if (allUsersCheckbox) {
        if (window.selectedUsers.includes('all')) {
            allUsersCheckbox.style.background = 'var(--telus-purple)';
            allUsersCheckbox.style.borderColor = 'var(--telus-purple)';
            allUsersCheckbox.innerHTML = '<i class="fas fa-check" style="color: white; font-size: 12px;"></i>';
        } else {
            allUsersCheckbox.style.background = 'white';
            allUsersCheckbox.style.borderColor = '#dee2e6';
            allUsersCheckbox.innerHTML = '';
        }
    }
    
    // Update individual user checkboxes
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    userCheckboxes.forEach(checkbox => {
        const email = checkbox.getAttribute('data-email');
        if (window.selectedUsers.includes(email)) {
            checkbox.style.background = 'var(--telus-purple)';
            checkbox.style.borderColor = 'var(--telus-purple)';
            checkbox.innerHTML = '<i class="fas fa-check" style="color: white; font-size: 10px;"></i>';
        } else {
            checkbox.style.background = 'white';
            checkbox.style.borderColor = '#dee2e6';
            checkbox.innerHTML = '';
        }
    });
}

function updateUserHoverState(element, userEmail) {
    if (!window.selectedUsers.includes(userEmail)) {
        element.style.borderColor = '#e9ecef';
        element.style.background = 'white';
    }
}

function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        if (window.selectedUsers.includes('all')) {
            countElement.textContent = '1 user selected (All Users)';
        } else {
            const count = window.selectedUsers.length;
            countElement.textContent = `${count} user${count !== 1 ? 's' : ''} selected`;
        }
    }
}

function applyUserSelection(formType) {
    // Map form types to their correct element IDs
    const elementMapping = {
        'task': 'task',
        'document': 'doc'
    };
    
    const prefix = elementMapping[formType] || formType;
    const selectedUsersDisplay = document.getElementById(`${prefix}SelectedUsers`);
    const hiddenInput = document.getElementById(`${prefix}AssignTo`);
    
    console.log(`Applying user selection for ${formType}, prefix: ${prefix}`);
    console.log('Selected users:', window.selectedUsers);
    console.log('Display element:', selectedUsersDisplay);
    console.log('Hidden input:', hiddenInput);
    
    if (selectedUsersDisplay && hiddenInput) {
        if (window.selectedUsers.includes('all')) {
            selectedUsersDisplay.innerHTML = '<span class="default-selection">All Users (Default)</span>';
            hiddenInput.value = 'all';
        } else {
            // Get user names for display
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const demoUser = { name: 'Demo User', email: 'user@demo.com' };
            const allUsers = [demoUser, ...users];
            
            const selectedUserNames = window.selectedUsers.map(email => {
                const user = allUsers.find(u => u.email === email);
                return user ? user.name : email;
            });
            
            selectedUsersDisplay.innerHTML = selectedUserNames.map(name => 
                `<span class="selected-user-tag">${name}</span>`
            ).join('');
            
            hiddenInput.value = window.selectedUsers.join(',');
        }
        
        console.log('Updated display:', selectedUsersDisplay.innerHTML);
        console.log('Updated hidden input value:', hiddenInput.value);
    } else {
        console.error('Could not find display or input elements:', {
            displayId: `${prefix}SelectedUsers`,
            inputId: `${prefix}AssignTo`,
            display: selectedUsersDisplay,
            input: hiddenInput
        });
    }
    
    closeUserSelectionModal();
}

function closeUserSelectionModal() {
    const modal = document.getElementById('userSelectionModal');
    if (modal) {
        modal.remove();
    }
    window.selectedUsers = null;
    window.currentFormType = null;
}
