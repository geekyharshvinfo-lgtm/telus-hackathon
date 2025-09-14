/**
 * @fileoverview Supabase Service Layer for TELUS Digital Platform
 * @description Handles all database operations with Supabase integration and localStorage fallback
 * @author TELUS Digital Team
 * @version 1.0.0
 */

// Supabase Service Class
class SupabaseService {
    constructor() {
        this.supabase = null;
        this.isOnline = navigator.onLine;
        this.initializeService();
        this.setupConnectionMonitoring();
    }

    // Initialize the service
    async initializeService() {
        try {
            this.supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
            if (this.supabase) {
                console.log('✅ SupabaseService initialized with database connection');
                await this.checkConnection();
            } else {
                console.warn('⚠️ SupabaseService initialized with localStorage fallback');
            }
        } catch (error) {
            console.error('❌ Error initializing SupabaseService:', error);
        }
    }

    // Check Supabase connection
    async checkConnection() {
        try {
            if (!this.supabase) return false;
            const { data, error } = await this.supabase.from('profiles').select('count').limit(1);
            return !error;
        } catch (error) {
            console.warn('Supabase connection check failed, using localStorage fallback');
            return false;
        }
    }

    // Setup connection monitoring
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connection restored - switching to Supabase');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Connection lost - using localStorage fallback');
        });
    }

    // ===========================================
    // AUTHENTICATION METHODS
    // ===========================================

    async signUp(email, password, userData) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: userData.name,
                            role: userData.role || 'user',
                            designation: userData.designation || 'Team Member',
                            pod: userData.pod || 'Platform',
                            phone: userData.phone || '',
                            location: userData.location || 'Vancouver, BC',
                            experience: userData.experience || '3-5 years',
                            skills: userData.skills || ['Product Strategy', 'Agile', 'Analytics'],
                            current_project: userData.currentProject || 'Digital Platform Enhancement',
                            availability: userData.availability || 'Available',
                            description: userData.description || 'Experienced professional focused on delivering innovative solutions.'
                        }
                    }
                });

                if (error) throw error;

                // Profile will be automatically created by database trigger
                // No manual profile creation needed
                console.log('✅ User created successfully, profile will be auto-generated');

                return { success: true, user: data.user };
            } else {
                // Fallback to localStorage
                return this.registerUserLocalStorage(userData.name, email, password);
            }
        } catch (error) {
            console.error('Error in signUp:', error);
            // Fallback to localStorage on error
            return this.registerUserLocalStorage(userData.name, email, password);
        }
    }

    async signIn(email, password) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                // Get user profile
                const profile = await this.getProfile(data.user.id);
                const user = {
                    id: data.user.id,
                    email: data.user.email,
                    name: profile?.name || data.user.user_metadata?.name || 'User',
                    role: profile?.role || 'user'
                };

                // Store in localStorage for compatibility
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                return { success: true, user: user };
            } else {
                // Fallback to localStorage authentication
                return this.authenticateUserLocalStorage(email, password);
            }
        } catch (error) {
            console.error('Error in signIn:', error);
            // Fallback to localStorage on error
            return this.authenticateUserLocalStorage(email, password);
        }
    }

    async signOut() {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            }
            localStorage.removeItem('currentUser');
            return { success: true };
        } catch (error) {
            console.error('Error in signOut:', error);
            localStorage.removeItem('currentUser');
            return { success: true };
        }
    }

    async getCurrentUser() {
        try {
            if (this.supabase && this.isOnline) {
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user) {
                    const profile = await this.getProfile(user.id);
                    return {
                        id: user.id,
                        email: user.email,
                        name: profile?.name || user.user_metadata?.name || 'User',
                        role: profile?.role || 'user'
                    };
                }
            }
            
            // Fallback to localStorage
            const currentUser = localStorage.getItem('currentUser');
            return currentUser ? JSON.parse(currentUser) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            const currentUser = localStorage.getItem('currentUser');
            return currentUser ? JSON.parse(currentUser) : null;
        }
    }

    // ===========================================
    // PROFILE METHODS
    // ===========================================

    async createProfile(userId, profileData) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.PROFILES)
                    .insert([{
                        id: userId,
                        ...profileData,
                        skills: Array.isArray(profileData.skills) ? profileData.skills : [profileData.skills]
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error creating profile:', error);
            return null;
        }
    }

    async getProfile(userId) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.PROFILES)
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) throw error;
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    }

    async updateProfile(userId, updates) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.PROFILES)
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error updating profile:', error);
            return null;
        }
    }

    async getAllProfiles() {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.PROFILES)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data || [];
            } else {
                // Fallback to localStorage
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                return users;
            }
        } catch (error) {
            console.error('Error getting all profiles:', error);
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            return users;
        }
    }

    // ===========================================
    // TASK METHODS
    // ===========================================

    async createTask(taskData, createdBy) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.TASKS)
                    .insert([{
                        title: taskData.title,
                        description: taskData.description,
                        resources: taskData.resources,
                        due_date: taskData.dueDate,
                        priority: taskData.priority || 'medium',
                        assigned_to: Array.isArray(taskData.assignTo) ? taskData.assignTo : [taskData.assignTo || 'all'],
                        created_by: createdBy
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: data };
            } else {
                // Fallback to localStorage
                return this.createTaskLocalStorage(taskData);
            }
        } catch (error) {
            console.error('Error creating task:', error);
            return this.createTaskLocalStorage(taskData);
        }
    }

    async getTasks(userEmail = null) {
        try {
            if (this.supabase && this.isOnline) {
                let query = this.supabase
                    .from(window.TABLES.TASKS)
                    .select('*')
                    .order('created_at', { ascending: false });

                // Filter by user assignment if specified
                if (userEmail) {
                    query = query.or(`assigned_to.cs.{${userEmail}},assigned_to.cs.{all}`);
                }

                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } else {
                // Fallback to localStorage
                return this.getTasksLocalStorage();
            }
        } catch (error) {
            console.error('Error getting tasks:', error);
            return this.getTasksLocalStorage();
        }
    }

    async updateTask(taskId, updates, userId) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.TASKS)
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', taskId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: data };
            } else {
                // Fallback to localStorage
                return this.updateTaskLocalStorage(taskId, updates);
            }
        } catch (error) {
            console.error('Error updating task:', error);
            return this.updateTaskLocalStorage(taskId, updates);
        }
    }

    async deleteTask(taskId) {
        try {
            if (this.supabase && this.isOnline) {
                const { error } = await this.supabase
                    .from(window.TABLES.TASKS)
                    .delete()
                    .eq('id', taskId);

                if (error) throw error;
                return { success: true };
            } else {
                // Fallback to localStorage
                return this.deleteTaskLocalStorage(taskId);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            return this.deleteTaskLocalStorage(taskId);
        }
    }

    // ===========================================
    // DOCUMENT METHODS
    // ===========================================

    async createDocument(docData, createdBy) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.DOCUMENTS)
                    .insert([{
                        title: docData.title,
                        description: docData.description,
                        type: docData.type || 'pdf',
                        assigned_to: Array.isArray(docData.assignTo) ? docData.assignTo : [docData.assignTo || 'all'],
                        due_date: docData.dueDate,
                        priority: docData.priority || 'medium',
                        created_by: createdBy
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: data };
            } else {
                // Fallback to localStorage
                return this.createDocumentLocalStorage(docData);
            }
        } catch (error) {
            console.error('Error creating document:', error);
            return this.createDocumentLocalStorage(docData);
        }
    }

    async getDocuments(userEmail = null) {
        try {
            if (this.supabase && this.isOnline) {
                let query = this.supabase
                    .from(window.TABLES.DOCUMENTS)
                    .select('*')
                    .order('created_at', { ascending: false });

                // Filter by user assignment if specified
                if (userEmail) {
                    query = query.or(`assigned_to.cs.{${userEmail}},assigned_to.cs.{all}`);
                }

                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            } else {
                // Fallback to localStorage
                return this.getDocumentsLocalStorage();
            }
        } catch (error) {
            console.error('Error getting documents:', error);
            return this.getDocumentsLocalStorage();
        }
    }

    async updateDocument(docId, updates, userId) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.DOCUMENTS)
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', docId)
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: data };
            } else {
                // Fallback to localStorage
                return this.updateDocumentLocalStorage(docId, updates);
            }
        } catch (error) {
            console.error('Error updating document:', error);
            return this.updateDocumentLocalStorage(docId, updates);
        }
    }

    // ===========================================
    // EXPERTISE CONTENT METHODS
    // ===========================================

    async createExpertiseContent(contentData, createdBy) {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.EXPERTISE_CONTENT)
                    .insert([{
                        title: contentData.title,
                        description: contentData.description,
                        category: contentData.category,
                        image_url: contentData.imageUrl || `https://via.placeholder.com/400x200/4B286D/ffffff?text=${encodeURIComponent(contentData.title)}`,
                        created_by: createdBy
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { success: true, data: data };
            } else {
                // Fallback to localStorage
                return this.createContentLocalStorage(contentData);
            }
        } catch (error) {
            console.error('Error creating expertise content:', error);
            return this.createContentLocalStorage(contentData);
        }
    }

    async getExpertiseContent() {
        try {
            if (this.supabase && this.isOnline) {
                const { data, error } = await this.supabase
                    .from(window.TABLES.EXPERTISE_CONTENT)
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data || [];
            } else {
                // Fallback to localStorage
                return this.getContentLocalStorage();
            }
        } catch (error) {
            console.error('Error getting expertise content:', error);
            return this.getContentLocalStorage();
        }
    }

    // ===========================================
    // REAL-TIME SUBSCRIPTIONS
    // ===========================================

    subscribeToTasks(callback) {
        if (this.supabase && this.isOnline) {
            return this.supabase
                .channel('tasks')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
                .subscribe();
        }
        return null;
    }

    subscribeToDocuments(callback) {
        if (this.supabase && this.isOnline) {
            return this.supabase
                .channel('documents')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, callback)
                .subscribe();
        }
        return null;
    }

    // ===========================================
    // LOCALSTORAGE FALLBACK METHODS
    // ===========================================

    registerUserLocalStorage(name, email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Check if user already exists
            if (users.find(user => user.email === email)) {
                return { success: false, message: "User already exists" };
            }
            
            const newUser = {
                email: email,
                password: password,
                name: name,
                role: "user",
                dateCreated: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Error registering user in localStorage:', error);
            return { success: false, message: "Registration failed" };
        }
    }

    authenticateUserLocalStorage(email, password) {
        try {
            // Check hardcoded demo users first
            const demoUsers = [
                { email: "user@demo.com", password: "password123", name: "Demo User", role: "user" },
                { email: "admin@demo.com", password: "admin123", name: "Admin User", role: "admin" }
            ];
            
            let user = demoUsers.find(user => user.email === email && user.password === password);
            
            // If not found in demo users, check registered users
            if (!user) {
                const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                user = registeredUsers.find(user => user.email === email && user.password === password);
            }
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, user: user };
            } else {
                return { success: false, message: "Invalid credentials" };
            }
        } catch (error) {
            console.error('Error authenticating user in localStorage:', error);
            return { success: false, message: "Authentication failed" };
        }
    }

    createTaskLocalStorage(taskData) {
        try {
            const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
            const taskId = 'task_' + Date.now();
            
            tasks[taskId] = {
                id: taskId,
                title: taskData.title,
                description: taskData.description,
                resources: taskData.resources,
                dueDate: taskData.dueDate,
                priority: taskData.priority || 'medium',
                status: 'pending',
                assignTo: taskData.assignTo || 'all',
                dateCreated: new Date().toISOString()
            };
            
            localStorage.setItem('telus_task_status', JSON.stringify(tasks));
            return { success: true, data: tasks[taskId] };
        } catch (error) {
            console.error('Error creating task in localStorage:', error);
            return { success: false };
        }
    }

    getTasksLocalStorage() {
        try {
            const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
            return Object.values(tasks);
        } catch (error) {
            console.error('Error getting tasks from localStorage:', error);
            return [];
        }
    }

    updateTaskLocalStorage(taskId, updates) {
        try {
            const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
            if (tasks[taskId]) {
                tasks[taskId] = { ...tasks[taskId], ...updates, lastModified: new Date().toISOString() };
                localStorage.setItem('telus_task_status', JSON.stringify(tasks));
                return { success: true, data: tasks[taskId] };
            }
            return { success: false };
        } catch (error) {
            console.error('Error updating task in localStorage:', error);
            return { success: false };
        }
    }

    deleteTaskLocalStorage(taskId) {
        try {
            const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
            delete tasks[taskId];
            localStorage.setItem('telus_task_status', JSON.stringify(tasks));
            return { success: true };
        } catch (error) {
            console.error('Error deleting task from localStorage:', error);
            return { success: false };
        }
    }

    createDocumentLocalStorage(docData) {
        try {
            const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
            const docId = 'doc_' + Date.now();
            
            documents[docId] = {
                id: docId,
                title: docData.title,
                description: docData.description,
                type: docData.type || 'pdf',
                status: 'pending',
                assignTo: docData.assignTo || 'all',
                dueDate: docData.dueDate,
                priority: docData.priority || 'medium',
                dateCreated: new Date().toISOString()
            };
            
            localStorage.setItem('telus_document_status', JSON.stringify(documents));
            return { success: true, data: documents[docId] };
        } catch (error) {
            console.error('Error creating document in localStorage:', error);
            return { success: false };
        }
    }

    getDocumentsLocalStorage() {
        try {
            const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
            return Object.values(documents);
        } catch (error) {
            console.error('Error getting documents from localStorage:', error);
            return [];
        }
    }

    updateDocumentLocalStorage(docId, updates) {
        try {
            const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
            if (documents[docId]) {
                documents[docId] = { ...documents[docId], ...updates, lastModified: new Date().toISOString() };
                localStorage.setItem('telus_document_status', JSON.stringify(documents));
                return { success: true, data: documents[docId] };
            }
            return { success: false };
        } catch (error) {
            console.error('Error updating document in localStorage:', error);
            return { success: false };
        }
    }

    createContentLocalStorage(contentData) {
        try {
            if (window.DataManager && window.DataManager.addContent) {
                const newContent = window.DataManager.addContent(contentData);
                return { success: true, data: newContent };
            }
            return { success: false };
        } catch (error) {
            console.error('Error creating content in localStorage:', error);
            return { success: false };
        }
    }

    getContentLocalStorage() {
        try {
            if (window.DataManager && window.DataManager.getAllContent) {
                return window.DataManager.getAllContent();
            }
            return [];
        } catch (error) {
            console.error('Error getting content from localStorage:', error);
            return [];
        }
    }
}

// Initialize global SupabaseService instance
window.SupabaseService = new SupabaseService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseService;
}

console.log('🚀 SupabaseService loaded and ready!');
