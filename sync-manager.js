// Centralized Data Synchronization Manager for TELUS Digital
// Handles real-time data sync between admin and user dashboards

class SyncManager {
    constructor() {
        this.listeners = new Map();
        this.isInitialized = false;
        this.syncEnabled = true;
        
        // Storage keys for different data types
        this.STORAGE_KEYS = {
            TASKS: 'telus_task_status',
            DOCUMENTS: 'telus_document_status',
            EXPERTISE: 'telusDigitalContent',
            USERS: 'registeredUsers',
            ACTIVITIES: 'telusDigitalActivities',
            ADMIN_ACTIVITIES: 'adminActivities',
            SYNC_VERSION: 'telus_sync_version'
        };
        
        this.init();
    }
    
    // Initialize the sync manager
    init() {
        if (this.isInitialized) return;
        
        this.setupStorageListener();
        this.setupCustomEventListeners();
        this.updateSyncVersion();
        this.isInitialized = true;
        
        console.log('SyncManager initialized successfully');
    }
    
    // Setup localStorage change listener for cross-tab sync
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (!this.syncEnabled) return;
            
            // Check if the changed key is one we're monitoring
            const monitoredKeys = Object.values(this.STORAGE_KEYS);
            if (monitoredKeys.includes(e.key)) {
                this.handleDataChange(e.key, e.newValue, e.oldValue);
            }
        });
    }
    
    // Setup custom event listeners for same-tab sync
    setupCustomEventListeners() {
        window.addEventListener('telusDataSync', (e) => {
            if (!this.syncEnabled) return;
            this.handleSyncEvent(e.detail);
        });
    }
    
    // Handle data changes
    handleDataChange(key, newValue, oldValue) {
        const dataType = this.getDataTypeFromKey(key);
        if (dataType) {
            this.notifyListeners(dataType, newValue ? JSON.parse(newValue) : null);
            this.updateSyncVersion();
        }
    }
    
    // Handle custom sync events
    handleSyncEvent(detail) {
        const { type, data, source } = detail;
        this.notifyListeners(type, data, source);
    }
    
    // Get data type from storage key
    getDataTypeFromKey(key) {
        const keyMap = {
            [this.STORAGE_KEYS.TASKS]: 'tasks',
            [this.STORAGE_KEYS.DOCUMENTS]: 'documents',
            [this.STORAGE_KEYS.EXPERTISE]: 'expertise',
            [this.STORAGE_KEYS.USERS]: 'users',
            [this.STORAGE_KEYS.ACTIVITIES]: 'activities',
            [this.STORAGE_KEYS.ADMIN_ACTIVITIES]: 'adminActivities'
        };
        return keyMap[key];
    }
    
    // Register a listener for data changes
    addListener(dataType, callback) {
        if (!this.listeners.has(dataType)) {
            this.listeners.set(dataType, new Set());
        }
        this.listeners.get(dataType).add(callback);
        
        return () => {
            // Return unsubscribe function
            const typeListeners = this.listeners.get(dataType);
            if (typeListeners) {
                typeListeners.delete(callback);
            }
        };
    }
    
    // Notify all listeners of a data change
    notifyListeners(dataType, data, source = 'storage') {
        const typeListeners = this.listeners.get(dataType);
        if (typeListeners) {
            typeListeners.forEach(callback => {
                try {
                    callback(data, source);
                } catch (error) {
                    console.error(`Error in sync listener for ${dataType}:`, error);
                }
            });
        }
    }
    
    // Update sync version timestamp
    updateSyncVersion() {
        const version = Date.now();
        localStorage.setItem(this.STORAGE_KEYS.SYNC_VERSION, version.toString());
    }
    
    // Trigger a manual sync event
    triggerSync(dataType, data, source = 'manual') {
        window.dispatchEvent(new CustomEvent('telusDataSync', {
            detail: { type: dataType, data, source }
        }));
    }
    
    // Task management methods
    updateTask(taskId, taskData, source = 'admin') {
        const tasks = this.getTasks();
        if (tasks[taskId]) {
            const existingTask = tasks[taskId];
            
            if (source === 'admin') {
                // Admin updates: preserve user completion data
                tasks[taskId] = { 
                    // Keep ALL existing data first
                    ...existingTask,
                    // Then apply admin updates
                    ...taskData,
                    // Always update lastModified
                    lastModified: new Date().toISOString(),
                    // EXPLICITLY preserve user completion fields
                    completionDate: existingTask.completionDate,
                    userResponse: existingTask.userResponse,
                    // Preserve creation date
                    dateCreated: existingTask.dateCreated || new Date().toISOString()
                };
            } else {
                // User updates: normal merge
                tasks[taskId] = { 
                    ...existingTask, 
                    ...taskData,
                    lastModified: new Date().toISOString()
                };
            }
            
            this.setTasks(tasks, source);
            console.log(`Task ${taskId} updated by ${source}, preserving user data:`, tasks[taskId]);
            return tasks[taskId];
        }
        return null;
    }
    
    addTask(taskData, source = 'admin') {
        const tasks = this.getTasks();
        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        tasks[taskId] = {
            ...taskData,
            id: taskId,
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: taskData.status || 'pending'
        };
        this.setTasks(tasks, source);
        return { id: taskId, ...tasks[taskId] };
    }
    
    deleteTask(taskId, source = 'admin') {
        const tasks = this.getTasks();
        if (tasks[taskId]) {
            delete tasks[taskId];
            this.setTasks(tasks, source);
            return true;
        }
        return false;
    }
    
    getTasks() {
        const tasksData = localStorage.getItem(this.STORAGE_KEYS.TASKS);
        return tasksData ? JSON.parse(tasksData) : {};
    }
    
    setTasks(tasks, source = 'system') {
        localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        this.triggerSync('tasks', tasks, source);
    }
    
    // Document management methods
    updateDocument(docId, docData, source = 'admin') {
        const documents = this.getDocuments();
        if (documents[docId]) {
            documents[docId] = { 
                ...documents[docId], 
                ...docData,
                lastModified: new Date().toISOString()
            };
            this.setDocuments(documents, source);
            return documents[docId];
        }
        return null;
    }
    
    addDocument(docData, source = 'admin') {
        const documents = this.getDocuments();
        const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        documents[docId] = {
            ...docData,
            id: docId,
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: docData.status || 'pending'
        };
        this.setDocuments(documents, source);
        return { id: docId, ...documents[docId] };
    }
    
    deleteDocument(docId, source = 'admin') {
        const documents = this.getDocuments();
        if (documents[docId]) {
            delete documents[docId];
            this.setDocuments(documents, source);
            return true;
        }
        return false;
    }
    
    getDocuments() {
        const docsData = localStorage.getItem(this.STORAGE_KEYS.DOCUMENTS);
        return docsData ? JSON.parse(docsData) : {};
    }
    
    setDocuments(documents, source = 'system') {
        localStorage.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        this.triggerSync('documents', documents, source);
    }
    
    // User management methods
    updateUser(userId, userData, source = 'admin') {
        const users = this.getUsers();
        if (users[userId]) {
            users[userId] = { ...users[userId], ...userData };
            this.setUsers(users, source);
            return users[userId];
        }
        return null;
    }
    
    addUser(userData, source = 'admin') {
        const users = this.getUsers();
        const userId = 'user_' + Date.now();
        users[userId] = {
            ...userData,
            id: userId,
            dateCreated: new Date().toISOString()
        };
        this.setUsers(users, source);
        return { id: userId, ...users[userId] };
    }
    
    deleteUser(userId, source = 'admin') {
        const users = this.getUsers();
        delete users[userId];
        this.setUsers(users, source);
        return true;
    }
    
    getUsers() {
        const usersData = localStorage.getItem(this.STORAGE_KEYS.USERS);
        return usersData ? JSON.parse(usersData) : [];
    }
    
    setUsers(users, source = 'system') {
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        this.triggerSync('users', users, source);
    }
    
    // Activity logging with sync
    logActivity(type, description, source = 'system') {
        const activities = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ACTIVITIES) || '[]');
        const currentUser = this.getCurrentUser();
        
        const newActivity = {
            id: Date.now(),
            type: type,
            description: description,
            timestamp: new Date().toISOString(),
            user: currentUser ? currentUser.name : 'System',
            source: source
        };
        
        activities.unshift(newActivity);
        const limitedActivities = activities.slice(0, 50);
        
        localStorage.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(limitedActivities));
        this.triggerSync('activities', limitedActivities, source);
        
        return newActivity;
    }
    
    // Admin activity logging
    logAdminActivity(type, description, source = 'admin') {
        const activities = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ADMIN_ACTIVITIES) || '[]');
        const currentUser = this.getCurrentUser();
        
        const newActivity = {
            id: Date.now(),
            type: type,
            description: description,
            timestamp: new Date().toISOString(),
            user: currentUser ? currentUser.name : 'Admin',
            source: source
        };
        
        activities.unshift(newActivity);
        const limitedActivities = activities.slice(0, 50);
        
        localStorage.setItem(this.STORAGE_KEYS.ADMIN_ACTIVITIES, JSON.stringify(limitedActivities));
        this.triggerSync('adminActivities', limitedActivities, source);
        
        return newActivity;
    }
    
    // Get current user
    getCurrentUser() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    }
    
    // Get sync statistics
    getSyncStats() {
        return {
            version: localStorage.getItem(this.STORAGE_KEYS.SYNC_VERSION),
            listeners: Array.from(this.listeners.keys()),
            isEnabled: this.syncEnabled,
            isInitialized: this.isInitialized
        };
    }
    
    // Enable/disable sync
    setSyncEnabled(enabled) {
        this.syncEnabled = enabled;
        console.log(`SyncManager ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Force refresh all data
    refreshAllData() {
        const tasks = this.getTasks();
        const documents = this.getDocuments();
        const users = this.getUsers();
        
        this.triggerSync('tasks', tasks, 'refresh');
        this.triggerSync('documents', documents, 'refresh');
        this.triggerSync('users', users, 'refresh');
        
        if (window.DataManager) {
            const expertise = window.DataManager.getAllContent(true);
            this.triggerSync('expertise', expertise, 'refresh');
        }
    }
    
    // Cleanup method
    destroy() {
        this.listeners.clear();
        this.isInitialized = false;
        this.syncEnabled = false;
    }
}

// Create global instance
const syncManager = new SyncManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncManager;
}

// Global access
window.SyncManager = syncManager;

console.log('SyncManager loaded and ready');
