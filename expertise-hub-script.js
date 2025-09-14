// Redesigned Expertise Hub JavaScript
// Updated to match user requirements

// Enhanced data structure for the new design
const expertiseHubData = {
    // Current user profile
    currentUser: {
        name: "John Doe",
        designation: "Product Design Intern",
        pod: "Platform",
        email: "john.doe@telus.com",
        profilePicture: "JD"
    },

    // PODs data with lorem ipsum descriptions and no technologies
    pods: [
        {
            id: 1,
            name: "Platform",
            fullName: "Platform Team",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            memberCount: 12,
            color: "#4b286d",
            icon: "fas fa-server"
        },
        {
            id: 2,
            name: "Growth",
            fullName: "Growth Team",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            memberCount: 8,
            color: "#4b286d",
            icon: "fas fa-chart-line"
        },
        {
            id: 3,
            name: "CC",
            fullName: "Control Centre",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            memberCount: 10,
            color: "#4b286d",
            icon: "fas fa-headset"
        },
        {
            id: 4,
            name: "TS",
            fullName: "Talent Studio",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            memberCount: 6,
            color: "#4b286d",
            icon: "fas fa-cogs"
        },
        {
            id: 5,
            name: "GTS",
            fullName: "Ground Truth Studio",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
            memberCount: 9,
            color: "#4b286d",
            icon: "fas fa-globe"
        },
        {
            id: 6,
            name: "FTS",
            fullName: "Fine Tune Studio",
            description: "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.",
            memberCount: 7,
            color: "#4b286d",
            icon: "fas fa-rocket"
        }
    ],

    // Comprehensive teammates data with team profile card structure
    teammates: [
        {
            id: 1,
            name: "Alex Thompson",
            designation: "Senior Product Manager",
            role: "Product Management",
            pod: "Platform",
            email: "alex.thompson@telus.com",
            phone: "+1 (555) 111-2222",
            location: "Vancouver, BC",
            experience: "6+ years",
            skills: ["Product Strategy", "Agile", "Analytics", "User Research"],
            currentProject: "Platform Modernization",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
            description: "Alex has been leading product initiatives at TELUS for over 6 years. He specializes in user experience design and agile methodologies, helping teams deliver exceptional digital products."
        },
        {
            id: 2,
            name: "Jessica Wang",
            designation: "Lead Product Designer",
            role: "Product Designer",
            pod: "Growth",
            email: "jessica.wang@telus.com",
            phone: "+1 (555) 222-3333",
            location: "Toronto, ON",
            experience: "5+ years",
            skills: ["UI/UX Design", "Figma", "User Research", "Design Systems"],
            currentProject: "Growth Analytics Dashboard",
            availability: "Busy",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face",
            description: "Jessica is a seasoned design professional with expertise in user research and design systems. She mentors junior designers and helps them grow their skills in creating user-centered solutions."
        },
        {
            id: 3,
            name: "David Kumar",
            designation: "Solution Engineer",
            role: "Solution Engineer",
            pod: "CC",
            email: "david.kumar@telus.com",
            phone: "+1 (555) 333-4444",
            location: "Calgary, AB",
            experience: "4+ years",
            skills: ["System Integration", "API Design", "Cloud Architecture", "DevOps"],
            currentProject: "Customer Care Platform",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
            description: "David specializes in solution architecture and system integration. He has extensive experience in building scalable platforms and mentoring development teams."
        },
        {
            id: 4,
            name: "Maria Santos",
            designation: "Senior Software Developer",
            role: "Software Developer",
            pod: "Platform",
            email: "maria.santos@telus.com",
            phone: "+1 (555) 444-5555",
            location: "Montreal, QC",
            experience: "7+ years",
            skills: ["React", "Node.js", "Python", "AWS", "Docker"],
            currentProject: "Microservices Migration",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
            description: "Maria is a full-stack developer with deep expertise in modern web technologies. She leads technical initiatives and contributes to architectural decisions across multiple projects."
        },
        {
            id: 5,
            name: "Robert Chen",
            designation: "ML Engineer",
            role: "Machine Learning",
            pod: "Growth",
            email: "robert.chen@telus.com",
            phone: "+1 (555) 555-6666",
            location: "Vancouver, BC",
            experience: "4+ years",
            skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Statistics"],
            currentProject: "Predictive Analytics Engine",
            availability: "Busy",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
            description: "Robert focuses on machine learning and data science initiatives. He develops predictive models and analytics solutions that drive business insights and decision-making."
        },
        {
            id: 6,
            name: "Lisa Park",
            designation: "AI Research Scientist",
            role: "Artificial Intelligence",
            pod: "FTS",
            email: "lisa.park@telus.com",
            phone: "+1 (555) 666-7777",
            location: "Toronto, ON",
            experience: "6+ years",
            skills: ["Deep Learning", "NLP", "Computer Vision", "Research", "Python"],
            currentProject: "Conversational AI Platform",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&crop=face",
            description: "Lisa leads AI research and development initiatives. She specializes in natural language processing and computer vision, working on cutting-edge AI solutions."
        },
        {
            id: 7,
            name: "James Wilson",
            designation: "HR Business Partner",
            role: "HR",
            pod: "Platform",
            email: "james.wilson@telus.com",
            phone: "+1 (555) 777-8888",
            location: "Calgary, AB",
            experience: "8+ years",
            skills: ["Talent Management", "Employee Relations", "Performance Management", "Coaching"],
            currentProject: "Employee Development Program",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face",
            description: "James partners with business leaders to develop talent strategies and employee engagement initiatives. He focuses on creating inclusive workplace cultures."
        },
        {
            id: 8,
            name: "Amanda Foster",
            designation: "Marketing Specialist",
            role: "Marketing",
            pod: "Growth",
            email: "amanda.foster@telus.com",
            phone: "+1 (555) 888-9999",
            location: "Vancouver, BC",
            experience: "3+ years",
            skills: ["Digital Marketing", "Content Strategy", "Analytics", "SEO"],
            currentProject: "Brand Awareness Campaign",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
            description: "Amanda develops and executes digital marketing strategies. She specializes in content creation and performance analytics to drive brand engagement."
        },
        {
            id: 9,
            name: "Kevin Lee",
            designation: "Senior QA Analyst",
            role: "Quality Analyst",
            pod: "TS",
            email: "kevin.lee@telus.com",
            phone: "+1 (555) 999-0000",
            location: "Toronto, ON",
            experience: "5+ years",
            skills: ["Test Automation", "Selenium", "API Testing", "Performance Testing"],
            currentProject: "Quality Assurance Framework",
            availability: "Busy",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face",
            description: "Kevin ensures software quality through comprehensive testing strategies. He develops automated testing frameworks and mentors QA team members."
        },
        {
            id: 10,
            name: "Rachel Green",
            designation: "Technical Consultant",
            role: "Consultant",
            pod: "GTS",
            email: "rachel.green@telus.com",
            phone: "+1 (555) 000-1111",
            location: "Montreal, QC",
            experience: "9+ years",
            skills: ["Business Analysis", "Process Optimization", "Change Management", "Strategy"],
            currentProject: "Digital Transformation Consulting",
            availability: "Available",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face",
            description: "Sarah has been leading product initiatives at TELUS for over 6 years. She specializes in user experience design and agile methodologies, helping teams deliver exceptional digital products."
        }
    ]
};

// Current section state
let currentSection = 'landing';
let filteredTeammates = [...expertiseHubData.teammates];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeExpertiseHub();
    loadAdminCreatedUsers();
    setupExpertiseHubSyncListeners();
});

// Main initialization function
function initializeExpertiseHub() {
    renderLandingSection();
    renderPodsSection();
    renderTeammatesSection();
    setupEventListeners();
}

// Navigation function
function navigateToSection(sectionName) {
    // Hide all panels
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected panel
    document.getElementById(`${sectionName}-panel`).classList.add('active');
    
    currentSection = sectionName;
    
    // Load section-specific content
    switch(sectionName) {
        case 'pods':
            renderPodsSection();
            break;
        case 'teammates':
            renderTeammatesSection();
            break;
        case 'landing':
            renderLandingSection();
            break;
    }
}

// Landing section rendering
function renderLandingSection() {
    // Landing section is mostly static, stats are already in HTML
    // Could add dynamic stats here if needed
}

// PODs section rendering
function renderPodsSection() {
    const podsGrid = document.getElementById('podsGrid');
    if (!podsGrid) return;
    
    const podsHtml = expertiseHubData.pods.map(pod => `
        <div class="pod-card">
            <div class="pod-card-header">
                <div class="pod-icon">
                    <i class="${pod.icon}"></i>
                </div>
                <div class="pod-info">
                    <div class="pod-name">${pod.name}</div>
                    <div class="pod-full-name">${pod.fullName}</div>
                </div>
                <div class="pod-member-count">
                    <span class="member-count">${pod.memberCount}</span>
                    <span class="member-label">members</span>
                </div>
            </div>
            <div class="pod-description">
                <p>${pod.description}</p>
            </div>
            <div class="pod-actions">
                <button class="pod-explore-btn" onclick="window.open('https://www.telusdigital.com/about/newsroom', '_blank')">
                    <i class="fas fa-external-link-alt"></i> Read More
                </button>
            </div>
        </div>
    `).join('');
    
    podsGrid.innerHTML = podsHtml;
}

// Teammates section rendering
function renderTeammatesSection() {
    filterTeammates(); // This will render the initial teammates
}

// Filter teammates function
function filterTeammates() {
    const searchTerm = document.getElementById('teammateSearch')?.value.toLowerCase() || '';
    const podFilter = document.getElementById('podFilter')?.value || '';
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    
    filteredTeammates = expertiseHubData.teammates.filter(teammate => {
        const matchesSearch = teammate.name.toLowerCase().includes(searchTerm) ||
                            teammate.designation.toLowerCase().includes(searchTerm) ||
                            teammate.skills.some(skill => skill.toLowerCase().includes(searchTerm));
        
        const matchesPod = !podFilter || teammate.pod === podFilter;
        const matchesRole = !roleFilter || teammate.role === roleFilter;
        
        return matchesSearch && matchesPod && matchesRole;
    });
    
    renderTeammatesGrid();
}

// Render teammates grid with team profile card structure
function renderTeammatesGrid() {
    const teammatesGrid = document.getElementById('teammatesGrid');
    if (!teammatesGrid) return;
    
    if (filteredTeammates.length === 0) {
        teammatesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No teammates found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        `;
        return;
    }
    
    const teammatesHtml = filteredTeammates.map(teammate => `
        <div class="team-profile-card">
            <div class="team-profile-header">
                <div class="team-profile-avatar">
                    <img src="${teammate.avatar}" alt="${teammate.name}" />
                </div>
                <div class="team-profile-info">
                    <div class="team-profile-name">${teammate.name}</div>
                    <div class="team-profile-designation">${teammate.designation}</div>
                    <div class="team-profile-pod">${teammate.pod} POD</div>
                </div>
            </div>
            <div class="team-profile-description">
                <p>${teammate.description}</p>
            </div>
            <div class="team-profile-actions">
                <button class="contact-btn email-btn" onclick="contactViaEmail('${teammate.email}')">
                    <i class="fas fa-envelope"></i> Email
                </button>
                <button class="contact-btn slack-btn" onclick="contactViaSlack('@${teammate.name.toLowerCase().replace(' ', '.')}')">
                    <i class="fab fa-slack"></i> Slack
                </button>
            </div>
        </div>
    `).join('');
    
    teammatesGrid.innerHTML = teammatesHtml;
}

// Contact functions
function contactViaEmail(email) {
    window.location.href = `mailto:${email}?subject=Collaboration Inquiry&body=Hi, I would like to connect and discuss potential collaboration.`;
}

function contactViaSlack(username) {
    // In a real implementation, this would integrate with Slack API
    alert(`Opening Slack to contact ${username}`);
}

// Setup event listeners
function setupEventListeners() {
    // Search input event listener
    const searchInput = document.getElementById('teammateSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterTeammates);
    }
    
    // Filter select event listeners
    const podFilter = document.getElementById('podFilter');
    const roleFilter = document.getElementById('roleFilter');
    
    if (podFilter) {
        podFilter.addEventListener('change', filterTeammates);
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', filterTeammates);
    }
}

// Load admin-created users and integrate with expertise hub
function loadAdminCreatedUsers() {
    try {
        // Load users from admin-created storage
        const adminUsers = JSON.parse(localStorage.getItem('expertise_hub_users') || '[]');
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        console.log('Loading admin-created users:', adminUsers.length, 'expertise hub users');
        console.log('Loading registered users:', registeredUsers.length, 'registered users');
        
        // Combine admin-created users with registered users that have expertise hub data
        const allAdminUsers = [...adminUsers];
        
        // Add registered users that have complete expertise hub data
        registeredUsers.forEach(user => {
            if (user.pod && user.designation && user.skills) {
                // Check if user is not already in expertise hub users
                const existsInExpertiseHub = adminUsers.some(existingUser => 
                    existingUser.email === user.email || existingUser.id === user.id
                );
                
                if (!existsInExpertiseHub) {
                    allAdminUsers.push(user);
                }
            }
        });
        
        if (allAdminUsers.length > 0) {
            console.log('Integrating', allAdminUsers.length, 'admin-created users into expertise hub');
            
            // Add admin-created users to the teammates array
            allAdminUsers.forEach(user => {
                // Check if user already exists in teammates (avoid duplicates)
                const existingIndex = expertiseHubData.teammates.findIndex(teammate => 
                    teammate.email === user.email || teammate.id === user.id
                );
                
                if (existingIndex === -1) {
                    // Add new user
                    expertiseHubData.teammates.push({
                        id: user.id || Date.now() + Math.random(),
                        name: user.name,
                        designation: user.designation,
                        role: user.role || 'Team Member',
                        pod: user.pod,
                        email: user.email,
                        phone: user.phone || '+1 (555) 123-4567',
                        location: user.location || 'Vancouver, BC',
                        experience: user.experience || '3-5 years',
                        skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()) : ['Product Strategy', 'Agile']),
                        currentProject: user.currentProject || 'Digital Platform Enhancement',
                        availability: user.availability || 'Available',
                        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=120&background=4b286d&color=ffffff&bold=true`,
                        description: user.description || 'Experienced professional focused on delivering innovative solutions and driving team collaboration.',
                        source: 'admin' // Mark as admin-created
                    });
                    console.log('Added admin-created user to expertise hub:', user.name);
                } else {
                    // Update existing user with latest data
                    const updatedUser = {
                        ...expertiseHubData.teammates[existingIndex],
                        name: user.name,
                        designation: user.designation,
                        role: user.role || expertiseHubData.teammates[existingIndex].role,
                        pod: user.pod,
                        email: user.email,
                        phone: user.phone || expertiseHubData.teammates[existingIndex].phone,
                        location: user.location || expertiseHubData.teammates[existingIndex].location,
                        experience: user.experience || expertiseHubData.teammates[existingIndex].experience,
                        skills: Array.isArray(user.skills) ? user.skills : (user.skills ? user.skills.split(',').map(s => s.trim()) : expertiseHubData.teammates[existingIndex].skills),
                        currentProject: user.currentProject || expertiseHubData.teammates[existingIndex].currentProject,
                        availability: user.availability || expertiseHubData.teammates[existingIndex].availability,
                        avatar: user.avatar || expertiseHubData.teammates[existingIndex].avatar,
                        description: user.description || expertiseHubData.teammates[existingIndex].description,
                        source: 'admin'
                    };
                    expertiseHubData.teammates[existingIndex] = updatedUser;
                    console.log('Updated existing user in expertise hub:', user.name);
                }
            });
            
            // Update filtered teammates and re-render
            filteredTeammates = [...expertiseHubData.teammates];
            if (currentSection === 'teammates') {
                renderTeammatesGrid();
            }
            
            console.log('Total teammates after admin integration:', expertiseHubData.teammates.length);
        }
    } catch (error) {
        console.error('Error loading admin-created users:', error);
    }
}

// Setup sync listeners for real-time updates from admin
function setupExpertiseHubSyncListeners() {
    console.log('Setting up expertise hub sync listeners...');
    
    // Listen for admin user creation/updates
    window.addEventListener('expertiseHubUserAdded', function(event) {
        console.log('New user added by admin:', event.detail.user);
        loadAdminCreatedUsers(); // Reload all users
        showUserAddedNotification(event.detail.user.name);
    });
    
    window.addEventListener('expertiseHubUserUpdated', function(event) {
        console.log('User updated by admin:', event.detail.user);
        loadAdminCreatedUsers(); // Reload all users
        showUserUpdatedNotification(event.detail.user.name);
    });
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', function(event) {
        if (event.key === 'expertise_hub_users' || event.key === 'registeredUsers') {
            console.log('User data updated in storage, reloading expertise hub...');
            loadAdminCreatedUsers();
        }
    });
    
    console.log('Expertise hub sync listeners set up successfully');
}

// Show notification when new user is added
function showUserAddedNotification(userName) {
    showExpertiseNotification(`New team member added: ${userName}`, 'success');
}

// Show notification when user is updated
function showUserUpdatedNotification(userName) {
    showExpertiseNotification(`Team member updated: ${userName}`, 'info');
}

// Show expertise hub notifications
function showExpertiseNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.expertise-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'expertise-notification';
    
    const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: 500;
        font-size: 0.9em;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="fas ${icon}" style="margin-right: 8px;"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add CSS animation if not already added
    if (!document.querySelector('#expertiseNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'expertiseNotificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
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

// Chatbot integration for expertise hub
function sendMessage(message) {
    if (typeof sendChatbotMessage === 'function') {
        document.getElementById('chatbotInput').value = message;
        sendChatbotMessage();
    }
}
