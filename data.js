// Enhanced Mock data with localStorage persistence and real-time sync
// This simulates what would come from a backend database with real-time updates

// Initialize default content data (prevent redeclaration)
if (typeof defaultContentData === 'undefined') {
    var defaultContentData = [
        {
            id: 1,
            title: "Welcome to Our Platform",
            description: "Discover amazing features and content managed by our team. This is a sample post to demonstrate the functionality.",
            imageUrl: "https://via.placeholder.com/400x200/4B286D/ffffff?text=Welcome",
            dateCreated: "2024-01-15",
            status: "active"
        },
        {
            id: 2,
            title: "Latest Updates",
            description: "Stay up to date with our latest features and improvements. We're constantly working to make your experience better.",
            imageUrl: "https://via.placeholder.com/400x200/66CC00/ffffff?text=Updates",
            dateCreated: "2024-01-20",
            status: "active"
        },
        {
            id: 3,
            title: "Community Highlights",
            description: "See what our amazing community has been up to. Join the conversation and share your own experiences.",
            imageUrl: "https://via.placeholder.com/400x200/4285F4/ffffff?text=Community",
            dateCreated: "2024-01-25",
            status: "active"
        }
    ];
}

// User data for authentication simulation (prevent redeclaration)
if (typeof users === 'undefined') {
    var users = [
        {
            email: "user@demo.com",
            password: "password123",
            name: "Demo User",
            role: "user"
        },
        {
            email: "admin@demo.com",
            password: "admin123",
            name: "Admin User",
            role: "admin"
        }
    ];
}

// Storage keys (prevent redeclaration)
if (typeof STORAGE_KEYS === 'undefined') {
    var STORAGE_KEYS = {
        CONTENT: 'telusDigitalContent',
        CONTENT_VERSION: 'telusDigitalContentVersion'
    };
}

// Initialize content data from localStorage or use defaults
function initializeContentData() {
    const storedContent = localStorage.getItem(STORAGE_KEYS.CONTENT);
    if (!storedContent) {
        // First time - save default data
        saveContentData(defaultContentData);
        return defaultContentData;
    }
    return JSON.parse(storedContent);
}

// Save content data to localStorage and trigger sync event
function saveContentData(data) {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(data));
    // Update version to trigger sync across tabs/windows
    const version = Date.now();
    localStorage.setItem(STORAGE_KEYS.CONTENT_VERSION, version.toString());
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('contentDataChanged', {
        detail: { data, version }
    }));
}

// Get current content data
function getContentData() {
    return initializeContentData();
}

// Enhanced DataManager with real-time sync capabilities
const DataManager = {
    // Get all content (including inactive for admin)
    getAllContent: function(includeInactive) {
        if (includeInactive === undefined) includeInactive = false;
        const data = getContentData();
        if (includeInactive) {
            return data;
        }
        return data.filter(item => item.status === 'active');
    },

    // Get content by ID
    getContentById: function(id) {
        const data = getContentData();
        return data.find(item => item.id === parseInt(id));
    },

    // Add new content
    addContent: function(contentData) {
        const data = getContentData();
        const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
        
        const newContent = {
            id: newId,
            title: contentData.title,
            description: contentData.description,
            imageUrl: contentData.imageUrl || `https://via.placeholder.com/400x200/4B286D/ffffff?text=${encodeURIComponent(contentData.title)}`,
            dateCreated: new Date().toISOString().split('T')[0],
            status: "active"
        };
        
        data.push(newContent);
        saveContentData(data);
        
        // Log activity
        this.logActivity('add', `Added new content: ${newContent.title}`);
        
        return newContent;
    },

    // Update content
    updateContent: function(id, updates) {
        const data = getContentData();
        const index = data.findIndex(item => item.id === parseInt(id));
        
        if (index !== -1) {
            // Update only provided fields
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    data[index][key] = updates[key];
                }
            });
            
            saveContentData(data);
            
            // Log activity
            this.logActivity('edit', `Updated content: ${data[index].title}`);
            
            return data[index];
        }
        return null;
    },

    // Delete content (soft delete by changing status)
    deleteContent: function(id) {
        const data = getContentData();
        const index = data.findIndex(item => item.id === parseInt(id));
        
        if (index !== -1) {
            const contentTitle = data[index].title;
            data[index].status = "inactive";
            saveContentData(data);
            
            // Log activity
            this.logActivity('delete', `Deleted content: ${contentTitle}`);
            
            return true;
        }
        return false;
    },

    // Permanently delete content (for admin)
    permanentDeleteContent: function(id) {
        const data = getContentData();
        const index = data.findIndex(item => item.id === parseInt(id));
        
        if (index !== -1) {
            const contentTitle = data[index].title;
            data.splice(index, 1);
            saveContentData(data);
            
            // Log activity
            this.logActivity('delete', `Permanently deleted content: ${contentTitle}`);
            
            return true;
        }
        return false;
    },

    // User authentication
    authenticateUser: function(email, password) {
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            // Log login activity
            this.logActivity('login', `${user.name} (${user.role}) logged in`);
        }
        return user;
    },

    // Register new user
    registerUser: function(name, email, password) {
        // Check if user already exists
        if (users.find(user => user.email === email)) {
            return { success: false, message: "User already exists" };
        }
        
        const newUser = {
            email: email,
            password: password,
            name: name,
            role: "user"
        };
        users.push(newUser);
        
        // Log activity
        this.logActivity('register', `New user registered: ${name}`);
        
        return { success: true, user: newUser };
    },

    // Activity logging
    logActivity: function(type, description) {
        const activities = JSON.parse(localStorage.getItem('telusDigitalActivities') || '[]');
        const currentUser = this.getCurrentUser();
        const newActivity = {
            id: Date.now(),
            type: type,
            description: description,
            timestamp: new Date().toISOString(),
            user: currentUser ? currentUser.name : 'System'
        };
        
        activities.unshift(newActivity);
        // Keep only last 50 activities
        const limitedActivities = activities.slice(0, 50);
        localStorage.setItem('telusDigitalActivities', JSON.stringify(limitedActivities));
    },

    // Get current user
    getCurrentUser: function() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    },

    // Get activities
    getActivities: function(limit) {
        if (limit === undefined) limit = 10;
        const activities = JSON.parse(localStorage.getItem('telusDigitalActivities') || '[]');
        return activities.slice(0, limit);
    },

    // Setup real-time sync listeners
    setupRealTimeSync: function(callback) {
        // Listen for localStorage changes (cross-tab sync)
        window.addEventListener('storage', function(e) {
            if (e.key === STORAGE_KEYS.CONTENT_VERSION) {
                if (callback) callback();
            }
        });

        // Listen for custom events (same-tab sync)
        window.addEventListener('contentDataChanged', function(e) {
            if (callback) callback(e.detail);
        });
    },

    // Force refresh data (useful for manual refresh)
    refreshData: function() {
        window.dispatchEvent(new CustomEvent('contentDataChanged', {
            detail: { data: getContentData(), version: Date.now() }
        }));
    },

    // Get content statistics
    getContentStats: function() {
        const data = getContentData();
        return {
            total: data.length,
            active: data.filter(item => item.status === 'active').length,
            inactive: data.filter(item => item.status === 'inactive').length
        };
    },

    // Reset data to defaults (for testing)
    resetToDefaults: function() {
        saveContentData([...defaultContentData]);
        localStorage.removeItem('telusDigitalActivities');
        this.logActivity('system', 'Data reset to defaults');
    }
};

// Initialize data on script load
let contentData = initializeContentData();

// Auto-save data periodically (backup mechanism)
setInterval(() => {
    const currentData = getContentData();
    if (currentData.length > 0) {
        localStorage.setItem('telusDigitalContentBackup', JSON.stringify({
            data: currentData,
            timestamp: new Date().toISOString()
        }));
    }
}, 30000); // Every 30 seconds

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { contentData, users, DataManager };
}

// Global access
window.DataManager = DataManager;
