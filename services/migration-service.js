/**
 * @fileoverview Migration Service for TELUS Digital Platform
 * @description Handles data migration from localStorage to Supabase
 * @author TELUS Digital Team
 * @version 1.0.0
 */

class MigrationService {
    constructor() {
        this.supabaseService = window.SupabaseService;
        this.migrationStatus = {
            users: false,
            tasks: false,
            documents: false,
            content: false
        };
        this.loadMigrationStatus();
    }

    // Load migration status from localStorage
    loadMigrationStatus() {
        const status = localStorage.getItem('telus_migration_status');
        if (status) {
            this.migrationStatus = { ...this.migrationStatus, ...JSON.parse(status) };
        }
    }

    // Save migration status to localStorage
    saveMigrationStatus() {
        localStorage.setItem('telus_migration_status', JSON.stringify(this.migrationStatus));
    }

    // Check if migration is needed
    isMigrationNeeded() {
        return !Object.values(this.migrationStatus).every(status => status === true);
    }

    // Get migration progress
    getMigrationProgress() {
        const completed = Object.values(this.migrationStatus).filter(status => status === true).length;
        const total = Object.keys(this.migrationStatus).length;
        return { completed, total, percentage: Math.round((completed / total) * 100) };
    }

    // ===========================================
    // MIGRATION METHODS
    // ===========================================

    async migrateUsers() {
        try {
            console.log('🔄 Starting user migration...');
            
            // Get users from localStorage
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            
            let migratedCount = 0;
            
            // Migrate registered users
            for (const user of registeredUsers) {
                try {
                    const result = await this.supabaseService.signUp(user.email, user.password || 'defaultPassword123', {
                        name: user.name,
                        role: user.role || 'user',
                        designation: user.designation || 'Team Member',
                        pod: user.pod || 'Platform',
                        phone: user.phone || '',
                        location: user.location || 'Vancouver, BC',
                        experience: user.experience || '3-5 years',
                        skills: user.skills || ['Product Strategy', 'Agile', 'Analytics'],
                        currentProject: user.currentProject || 'Digital Platform Enhancement',
                        availability: user.availability || 'Available',
                        description: user.description || 'Experienced professional focused on delivering innovative solutions.'
                    });
                    
                    if (result.success) {
                        migratedCount++;
                        console.log(`✅ Migrated user: ${user.name}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to migrate user ${user.name}:`, error.message);
                }
            }
            
            this.migrationStatus.users = true;
            this.saveMigrationStatus();
            
            console.log(`✅ User migration completed. Migrated ${migratedCount}/${registeredUsers.length} users.`);
            return { success: true, migrated: migratedCount, total: registeredUsers.length };
            
        } catch (error) {
            console.error('❌ Error migrating users:', error);
            return { success: false, error: error.message };
        }
    }

    async migrateTasks() {
        try {
            console.log('🔄 Starting task migration...');
            
            // Get tasks from localStorage
            const tasks = JSON.parse(localStorage.getItem('telus_task_status') || '{}');
            const taskArray = Object.values(tasks);
            
            let migratedCount = 0;
            
            // Get current user for created_by field
            const currentUser = await this.supabaseService.getCurrentUser();
            const createdBy = currentUser?.id || null;
            
            for (const task of taskArray) {
                try {
                    const result = await this.supabaseService.createTask({
                        title: task.title,
                        description: task.description,
                        resources: task.resources,
                        dueDate: task.dueDate,
                        priority: task.priority || 'medium',
                        assignTo: task.assignTo || 'all'
                    }, createdBy);
                    
                    if (result.success) {
                        migratedCount++;
                        console.log(`✅ Migrated task: ${task.title}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to migrate task ${task.title}:`, error.message);
                }
            }
            
            this.migrationStatus.tasks = true;
            this.saveMigrationStatus();
            
            console.log(`✅ Task migration completed. Migrated ${migratedCount}/${taskArray.length} tasks.`);
            return { success: true, migrated: migratedCount, total: taskArray.length };
            
        } catch (error) {
            console.error('❌ Error migrating tasks:', error);
            return { success: false, error: error.message };
        }
    }

    async migrateDocuments() {
        try {
            console.log('🔄 Starting document migration...');
            
            // Get documents from localStorage
            const documents = JSON.parse(localStorage.getItem('telus_document_status') || '{}');
            const documentArray = Object.values(documents);
            
            let migratedCount = 0;
            
            // Get current user for created_by field
            const currentUser = await this.supabaseService.getCurrentUser();
            const createdBy = currentUser?.id || null;
            
            for (const doc of documentArray) {
                try {
                    const result = await this.supabaseService.createDocument({
                        title: doc.title,
                        description: doc.description,
                        type: doc.type || 'pdf',
                        assignTo: doc.assignTo || 'all',
                        dueDate: doc.dueDate,
                        priority: doc.priority || 'medium'
                    }, createdBy);
                    
                    if (result.success) {
                        migratedCount++;
                        console.log(`✅ Migrated document: ${doc.title}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to migrate document ${doc.title}:`, error.message);
                }
            }
            
            this.migrationStatus.documents = true;
            this.saveMigrationStatus();
            
            console.log(`✅ Document migration completed. Migrated ${migratedCount}/${documentArray.length} documents.`);
            return { success: true, migrated: migratedCount, total: documentArray.length };
            
        } catch (error) {
            console.error('❌ Error migrating documents:', error);
            return { success: false, error: error.message };
        }
    }

    async migrateExpertiseContent() {
        try {
            console.log('🔄 Starting expertise content migration...');
            
            // Get content from DataManager
            const content = window.DataManager ? window.DataManager.getAllContent(true) : [];
            
            let migratedCount = 0;
            
            // Get current user for created_by field
            const currentUser = await this.supabaseService.getCurrentUser();
            const createdBy = currentUser?.id || null;
            
            for (const item of content) {
                try {
                    const result = await this.supabaseService.createExpertiseContent({
                        title: item.title,
                        description: item.description,
                        category: item.category || 'general',
                        imageUrl: item.imageUrl
                    }, createdBy);
                    
                    if (result.success) {
                        migratedCount++;
                        console.log(`✅ Migrated content: ${item.title}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to migrate content ${item.title}:`, error.message);
                }
            }
            
            this.migrationStatus.content = true;
            this.saveMigrationStatus();
            
            console.log(`✅ Content migration completed. Migrated ${migratedCount}/${content.length} items.`);
            return { success: true, migrated: migratedCount, total: content.length };
            
        } catch (error) {
            console.error('❌ Error migrating expertise content:', error);
            return { success: false, error: error.message };
        }
    }

    // ===========================================
    // FULL MIGRATION PROCESS
    // ===========================================

    async runFullMigration(progressCallback = null) {
        console.log('🚀 Starting full migration to Supabase...');
        
        const results = {
            users: null,
            tasks: null,
            documents: null,
            content: null,
            overall: { success: false, totalMigrated: 0, totalItems: 0 }
        };

        try {
            // Step 1: Migrate Users
            if (progressCallback) progressCallback('Migrating users...', 25);
            results.users = await this.migrateUsers();
            
            // Step 2: Migrate Tasks
            if (progressCallback) progressCallback('Migrating tasks...', 50);
            results.tasks = await this.migrateTasks();
            
            // Step 3: Migrate Documents
            if (progressCallback) progressCallback('Migrating documents...', 75);
            results.documents = await this.migrateDocuments();
            
            // Step 4: Migrate Expertise Content
            if (progressCallback) progressCallback('Migrating expertise content...', 100);
            results.content = await this.migrateExpertiseContent();
            
            // Calculate overall results
            const totalMigrated = (results.users?.migrated || 0) + 
                                (results.tasks?.migrated || 0) + 
                                (results.documents?.migrated || 0) + 
                                (results.content?.migrated || 0);
            
            const totalItems = (results.users?.total || 0) + 
                             (results.tasks?.total || 0) + 
                             (results.documents?.total || 0) + 
                             (results.content?.total || 0);
            
            results.overall = {
                success: true,
                totalMigrated: totalMigrated,
                totalItems: totalItems,
                percentage: totalItems > 0 ? Math.round((totalMigrated / totalItems) * 100) : 100
            };
            
            console.log(`🎉 Migration completed! Migrated ${totalMigrated}/${totalItems} items (${results.overall.percentage}%)`);
            
            if (progressCallback) progressCallback('Migration completed!', 100);
            
            return results;
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            results.overall = { success: false, error: error.message };
            return results;
        }
    }

    // ===========================================
    // MIGRATION UI HELPERS
    // ===========================================

    showMigrationModal() {
        const modalHTML = `
            <div id="migrationModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(3px);
            ">
                <div style="
                    background: white;
                    border-radius: 16px;
                    max-width: 500px;
                    width: 95%;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: modalSlideIn 0.3s ease-out;
                ">
                    <style>
                        @keyframes modalSlideIn {
                            from { transform: translateY(-20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                        .migration-progress {
                            width: 100%;
                            height: 8px;
                            background: #e9ecef;
                            border-radius: 4px;
                            overflow: hidden;
                            margin: 15px 0;
                        }
                        .migration-progress-bar {
                            height: 100%;
                            background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                            width: 0%;
                            transition: width 0.3s ease;
                        }
                    </style>
                    
                    <!-- Header -->
                    <div style="
                        background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                        color: white;
                        padding: 25px 30px;
                        text-align: center;
                    ">
                        <h3 style="margin: 0; font-size: 1.4em;">
                            <i class="fas fa-database" style="margin-right: 10px;"></i>
                            Supabase Migration
                        </h3>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.95em;">
                            Migrating your data to the cloud database
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px;">
                        <div id="migrationStatus" style="text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 1.1em; color: #495057; margin-bottom: 10px;">
                                Preparing migration...
                            </div>
                            <div class="migration-progress">
                                <div class="migration-progress-bar" id="migrationProgressBar"></div>
                            </div>
                            <div style="font-size: 0.9em; color: #6c757d;" id="migrationPercentage">0%</div>
                        </div>
                        
                        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px;">
                            <button id="startMigrationBtn" style="
                                background: linear-gradient(135deg, var(--telus-purple), #8e44ad);
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                font-size: 0.95em;
                            ">
                                <i class="fas fa-play" style="margin-right: 8px;"></i>
                                Start Migration
                            </button>
                            <button id="skipMigrationBtn" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 12px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 0.95em;
                            ">
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.getElementById('startMigrationBtn').addEventListener('click', () => {
            this.startMigrationProcess();
        });
        
        document.getElementById('skipMigrationBtn').addEventListener('click', () => {
            this.closeMigrationModal();
        });
    }

    async startMigrationProcess() {
        const statusDiv = document.getElementById('migrationStatus');
        const progressBar = document.getElementById('migrationProgressBar');
        const percentageDiv = document.getElementById('migrationPercentage');
        const startBtn = document.getElementById('startMigrationBtn');
        const skipBtn = document.getElementById('skipMigrationBtn');
        
        // Disable buttons
        startBtn.disabled = true;
        skipBtn.disabled = true;
        startBtn.style.opacity = '0.6';
        skipBtn.style.opacity = '0.6';
        
        const updateProgress = (message, percentage) => {
            statusDiv.querySelector('div').textContent = message;
            progressBar.style.width = percentage + '%';
            percentageDiv.textContent = percentage + '%';
        };
        
        try {
            const results = await this.runFullMigration(updateProgress);
            
            if (results.overall.success) {
                statusDiv.innerHTML = `
                    <div style="color: #28a745; font-size: 1.1em; margin-bottom: 10px;">
                        <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                        Migration completed successfully!
                    </div>
                    <div style="font-size: 0.9em; color: #6c757d;">
                        Migrated ${results.overall.totalMigrated} of ${results.overall.totalItems} items
                    </div>
                `;
                
                setTimeout(() => {
                    this.closeMigrationModal();
                }, 2000);
            } else {
                statusDiv.innerHTML = `
                    <div style="color: #dc3545; font-size: 1.1em;">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                        Migration failed
                    </div>
                    <div style="font-size: 0.9em; color: #6c757d; margin-top: 10px;">
                        ${results.overall.error || 'Unknown error occurred'}
                    </div>
                `;
                
                // Re-enable buttons
                startBtn.disabled = false;
                skipBtn.disabled = false;
                startBtn.style.opacity = '1';
                skipBtn.style.opacity = '1';
            }
        } catch (error) {
            statusDiv.innerHTML = `
                <div style="color: #dc3545; font-size: 1.1em;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                    Migration failed
                </div>
                <div style="font-size: 0.9em; color: #6c757d; margin-top: 10px;">
                    ${error.message}
                </div>
            `;
            
            // Re-enable buttons
            startBtn.disabled = false;
            skipBtn.disabled = false;
            startBtn.style.opacity = '1';
            skipBtn.style.opacity = '1';
        }
    }

    closeMigrationModal() {
        const modal = document.getElementById('migrationModal');
        if (modal) {
            modal.remove();
        }
    }

    // ===========================================
    // AUTO-MIGRATION CHECK
    // ===========================================

    async checkAndPromptMigration() {
        // Only show migration prompt if Supabase is available and migration is needed
        if (this.supabaseService && this.supabaseService.supabase && this.isMigrationNeeded()) {
            // Wait a bit for the page to load
            setTimeout(() => {
                this.showMigrationModal();
            }, 1000);
        }
    }
}

// Initialize global MigrationService instance
window.MigrationService = new MigrationService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MigrationService;
}

console.log('🔄 MigrationService loaded and ready!');
