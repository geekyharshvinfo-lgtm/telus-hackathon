// Expertise Hub JavaScript
// Mock data for team members, projects, and roles

// Team hierarchy data
const teamHierarchy = {
    director: {
        id: 1,
        name: "Sarah Johnson",
        title: "Engineering Director",
        email: "sarah.johnson@telus.com",
        phone: "+1 (555) 123-4567",
        status: "online",
        level: "director",
        teamCount: 5,
        avatar: "SJ"
    },
    managers: [
        {
            id: 2,
            name: "Mike Chen",
            title: "Senior Product Manager",
            email: "mike.chen@telus.com",
            phone: "+1 (555) 234-5678",
            status: "online",
            level: "manager",
            teamCount: 2,
            avatar: "MC"
        },
        {
            id: 3,
            name: "Jessica Wong",
            title: "Data Science Lead",
            email: "jessica.wong@telus.com",
            phone: "+1 (555) 567-8901",
            status: "offline",
            level: "manager",
            teamCount: 1,
            avatar: "JW"
        }
    ],
    individuals: [
        {
            id: 4,
            name: "Alex Rodriguez",
            title: "Senior Software Engineer",
            email: "alex.rodriguez@telus.com",
            phone: "+1 (555) 345-6789",
            status: "away",
            level: "individual",
            avatar: "AR"
        },
        {
            id: 5,
            name: "Emily Davis",
            title: "UX Designer",
            email: "emily.davis@telus.com",
            phone: "+1 (555) 456-7890",
            status: "online",
            level: "individual",
            avatar: "ED"
        }
    ]
};

// Projects data
const projectsData = [
    {
        id: 1,
        name: "Digital Transformation",
        description: "Modernizing legacy systems and processes",
        departments: {
            "Product Management": [
                {
                    id: 1,
                    name: "Sarah Johnson",
                    role: "Senior Product Manager",
                    email: "sarah.johnson@telus.com",
                    phone: "+1 (555) 123-4567",
                    status: "online",
                    avatar: "SJ"
                },
                {
                    id: 2,
                    name: "Mike Chen",
                    role: "Product Manager",
                    email: "mike.chen@telus.com",
                    phone: "+1 (555) 234-5678",
                    status: "online",
                    avatar: "MC"
                }
            ],
            "Engineering": [
                {
                    id: 3,
                    name: "Alex Rodriguez",
                    role: "Senior Software Engineer",
                    email: "alex.rodriguez@telus.com",
                    phone: "+1 (555) 345-6789",
                    status: "away",
                    avatar: "AR"
                },
                {
                    id: 4,
                    name: "David Kim",
                    role: "Software Engineer",
                    email: "david.kim@telus.com",
                    phone: "+1 (555) 456-7890",
                    status: "online",
                    avatar: "DK"
                }
            ],
            "Design": [
                {
                    id: 5,
                    name: "Emily Davis",
                    role: "UX Designer",
                    email: "emily.davis@telus.com",
                    phone: "+1 (555) 567-8901",
                    status: "online",
                    avatar: "ED"
                }
            ],
            "Quality Assurance": [
                {
                    id: 6,
                    name: "Lisa Park",
                    role: "QA Engineer",
                    email: "lisa.park@telus.com",
                    phone: "+1 (555) 678-9012",
                    status: "offline",
                    avatar: "LP"
                }
            ]
        }
    },
    {
        id: 2,
        name: "Mobile App Redesign",
        description: "Complete redesign of the mobile application",
        departments: {
            "Product Management": [
                {
                    id: 2,
                    name: "Mike Chen",
                    role: "Product Manager",
                    email: "mike.chen@telus.com",
                    phone: "+1 (555) 234-5678",
                    status: "online",
                    avatar: "MC"
                }
            ],
            "Engineering": [
                {
                    id: 7,
                    name: "Ryan Thompson",
                    role: "Mobile Developer",
                    email: "ryan.thompson@telus.com",
                    phone: "+1 (555) 789-0123",
                    status: "online",
                    avatar: "RT"
                }
            ],
            "Design": [
                {
                    id: 5,
                    name: "Emily Davis",
                    role: "UX Designer",
                    email: "emily.davis@telus.com",
                    phone: "+1 (555) 567-8901",
                    status: "online",
                    avatar: "ED"
                },
                {
                    id: 8,
                    name: "Sophie Martinez",
                    role: "UI Designer",
                    email: "sophie.martinez@telus.com",
                    phone: "+1 (555) 890-1234",
                    status: "away",
                    avatar: "SM"
                }
            ]
        }
    },
    {
        id: 3,
        name: "Data Analytics Platform",
        description: "Building a comprehensive data analytics solution",
        departments: {
            "Data Science": [
                {
                    id: 3,
                    name: "Jessica Wong",
                    role: "Data Science Lead",
                    email: "jessica.wong@telus.com",
                    phone: "+1 (555) 567-8901",
                    status: "offline",
                    avatar: "JW"
                },
                {
                    id: 9,
                    name: "Mark Johnson",
                    role: "Data Scientist",
                    email: "mark.johnson@telus.com",
                    phone: "+1 (555) 901-2345",
                    status: "online",
                    avatar: "MJ"
                }
            ],
            "Engineering": [
                {
                    id: 3,
                    name: "Alex Rodriguez",
                    role: "Senior Software Engineer",
                    email: "alex.rodriguez@telus.com",
                    phone: "+1 (555) 345-6789",
                    status: "away",
                    avatar: "AR"
                }
            ]
        }
    }
];

// Roles data
const rolesData = [
    {
        id: 1,
        name: "Product Manager (PM)",
        count: 3,
        members: [
            {
                id: 1,
                name: "Sarah Johnson",
                title: "Senior Product Manager",
                email: "sarah.johnson@telus.com",
                phone: "+1 (555) 123-4567",
                location: "Vancouver, BC",
                experience: "5+ years",
                status: "available",
                currentProject: "Digital Transformation",
                skills: ["Product Strategy", "Agile", "Analytics", "User Research"],
                taskCompletion: 92,
                joinedDate: "Jan 2022",
                avatar: "SJ"
            },
            {
                id: 2,
                name: "Mike Chen",
                title: "Product Manager",
                email: "mike.chen@telus.com",
                phone: "+1 (555) 234-5678",
                location: "Toronto, ON",
                experience: "3+ years",
                status: "busy",
                currentProject: "Mobile App Redesign",
                skills: ["Product Development", "Roadmapping", "Stakeholder Management"],
                taskCompletion: 87,
                joinedDate: "Mar 2023",
                avatar: "MC"
            }
        ]
    },
    {
        id: 2,
        name: "Software Engineer (SDE)",
        count: 4,
        members: [
            {
                id: 3,
                name: "Alex Rodriguez",
                title: "Senior Software Engineer",
                email: "alex.rodriguez@telus.com",
                phone: "+1 (555) 345-6789",
                location: "Calgary, AB",
                experience: "7+ years",
                status: "available",
                currentProject: "Digital Transformation",
                skills: ["React", "Node.js", "Python", "AWS", "Docker"],
                taskCompletion: 95,
                joinedDate: "Jun 2020",
                avatar: "AR"
            },
            {
                id: 4,
                name: "David Kim",
                title: "Software Engineer",
                email: "david.kim@telus.com",
                phone: "+1 (555) 456-7890",
                location: "Vancouver, BC",
                experience: "2+ years",
                status: "available",
                currentProject: "Digital Transformation",
                skills: ["JavaScript", "React", "MongoDB", "Express"],
                taskCompletion: 89,
                joinedDate: "Sep 2022",
                avatar: "DK"
            },
            {
                id: 7,
                name: "Ryan Thompson",
                title: "Mobile Developer",
                email: "ryan.thompson@telus.com",
                phone: "+1 (555) 789-0123",
                location: "Montreal, QC",
                experience: "4+ years",
                status: "busy",
                currentProject: "Mobile App Redesign",
                skills: ["React Native", "Swift", "Kotlin", "Firebase"],
                taskCompletion: 91,
                joinedDate: "Feb 2021",
                avatar: "RT"
            }
        ]
    },
    {
        id: 3,
        name: "UX/UI Designer (PD)",
        count: 2,
        members: [
            {
                id: 5,
                name: "Emily Davis",
                title: "UX Designer",
                email: "emily.davis@telus.com",
                phone: "+1 (555) 567-8901",
                location: "Toronto, ON",
                experience: "4+ years",
                status: "available",
                currentProject: "Mobile App Redesign",
                skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
                taskCompletion: 93,
                joinedDate: "Nov 2021",
                avatar: "ED"
            },
            {
                id: 8,
                name: "Sophie Martinez",
                title: "UI Designer",
                email: "sophie.martinez@telus.com",
                phone: "+1 (555) 890-1234",
                location: "Vancouver, BC",
                experience: "3+ years",
                status: "busy",
                currentProject: "Mobile App Redesign",
                skills: ["Adobe Creative Suite", "Sketch", "InVision", "CSS"],
                taskCompletion: 88,
                joinedDate: "Apr 2022",
                avatar: "SM"
            }
        ]
    },
    {
        id: 4,
        name: "Quality Assurance (QA)",
        count: 1,
        members: [
            {
                id: 6,
                name: "Lisa Park",
                title: "QA Engineer",
                email: "lisa.park@telus.com",
                phone: "+1 (555) 678-9012",
                location: "Calgary, AB",
                experience: "5+ years",
                status: "available",
                currentProject: "Digital Transformation",
                skills: ["Test Automation", "Selenium", "Jest", "Manual Testing"],
                taskCompletion: 96,
                joinedDate: "Aug 2020",
                avatar: "LP"
            }
        ]
    },
    {
        id: 5,
        name: "Data Scientist",
        count: 2,
        members: [
            {
                id: 3,
                name: "Jessica Wong",
                title: "Data Science Lead",
                email: "jessica.wong@telus.com",
                phone: "+1 (555) 567-8901",
                location: "Vancouver, BC",
                experience: "6+ years",
                status: "available",
                currentProject: "Data Analytics Platform",
                skills: ["Python", "Machine Learning", "SQL", "Tableau", "R"],
                taskCompletion: 94,
                joinedDate: "Jan 2021",
                avatar: "JW"
            },
            {
                id: 9,
                name: "Mark Johnson",
                title: "Data Scientist",
                email: "mark.johnson@telus.com",
                phone: "+1 (555) 901-2345",
                location: "Toronto, ON",
                experience: "3+ years",
                status: "busy",
                currentProject: "Data Analytics Platform",
                skills: ["Python", "TensorFlow", "Pandas", "Jupyter", "Statistics"],
                taskCompletion: 90,
                joinedDate: "May 2022",
                avatar: "MJ"
            }
        ]
    }
];

// DOM elements
let currentSection = 'team';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    renderTeamHierarchy();
    populateProjectDropdown();
    populateRoleDropdown();
    setupEventListeners();
});

// Navigation functionality
function initializeNavigation() {
    // Set up click handlers for navigation cards
    const navCards = document.querySelectorAll('.expertise-nav-card');
    navCards.forEach(card => {
        card.addEventListener('click', () => {
            const sectionName = card.getAttribute('data-section');
            switchSection(sectionName);
        });
    });
}

function switchSection(sectionName) {
    // Update active navigation card
    document.querySelectorAll('.expertise-nav-card').forEach(card => card.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update active content panel
    document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${sectionName}-panel`).classList.add('active');

    currentSection = sectionName;

    // Load content based on section
    switch(sectionName) {
        case 'team':
            renderTeamHierarchy();
            break;
        case 'projects':
            // Projects content is loaded on dropdown change
            break;
        case 'roles':
            // Roles content is loaded on dropdown change
            break;
    }
}

// Global function for section switching (called from HTML)
window.switchSection = switchSection;

// Team Hierarchy rendering
function renderTeamHierarchy() {
    const hierarchyContainer = document.getElementById('teamHierarchy');
    if (!hierarchyContainer) return;

    hierarchyContainer.innerHTML = `
        <!-- Director Level -->
        <div class="hierarchy-level">
            ${renderEmployeeCard(teamHierarchy.director)}
        </div>

        <!-- Manager Level -->
        <div class="hierarchy-level">
            ${teamHierarchy.managers.map(manager => renderEmployeeCard(manager)).join('')}
        </div>

        <!-- Individual Contributors Level -->
        <div class="hierarchy-level">
            ${teamHierarchy.individuals.map(individual => renderEmployeeCard(individual)).join('')}
        </div>
    `;
}

function renderEmployeeCard(employee) {
    const levelClass = employee.level;
    const levelIcon = getLevelIcon(employee.level);
    
    return `
        <div class="employee-card ${levelClass}" onclick="showEmployeeDetails(${employee.id})">
            <div class="employee-card-header">
                <div class="employee-avatar">
                    ${employee.avatar}
                    <div class="employee-status ${employee.status}"></div>
                </div>
                <div class="employee-info">
                    <div class="employee-name">
                        ${employee.name}
                        ${employee.teamCount ? `<span class="employee-count">${employee.teamCount}</span>` : ''}
                    </div>
                    <div class="employee-title">${employee.title}</div>
                </div>
                <div class="employee-level-icon ${levelClass}">
                    ${levelIcon}
                </div>
            </div>
            <div class="employee-contact">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${employee.email}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${employee.phone}</span>
                </div>
            </div>
            <div class="employee-actions">
                <button class="action-btn-primary" onclick="event.stopPropagation(); contactEmployee('${employee.email}')">
                    Contact
                </button>
                <button class="action-btn-secondary" onclick="event.stopPropagation(); viewProfile(${employee.id})">
                    View Profile
                </button>
            </div>
        </div>
    `;
}

function getLevelIcon(level) {
    switch(level) {
        case 'director':
            return '<i class="fas fa-crown"></i>';
        case 'manager':
            return '<i class="fas fa-star"></i>';
        case 'individual':
            return '<i class="fas fa-circle"></i>';
        default:
            return '<i class="fas fa-circle"></i>';
    }
}

// Projects functionality
function populateProjectDropdown() {
    const dropdown = document.getElementById('projectSelect');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select a project...</option>';
    
    projectsData.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        dropdown.appendChild(option);
    });
}

function onProjectChange() {
    const dropdown = document.getElementById('projectSelect');
    const selectedProjectId = parseInt(dropdown.value);
    
    if (!selectedProjectId) {
        document.getElementById('projectContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-project-diagram"></i></div>
                <h3>Select a Project</h3>
                <p>Choose a project from the dropdown to view team members by department</p>
            </div>
        `;
        return;
    }

    const project = projectsData.find(p => p.id === selectedProjectId);
    if (project) {
        renderProjectDepartments(project);
    }
}

function renderProjectDepartments(project) {
    const container = document.getElementById('projectContent');
    if (!container) return;

    const departmentsHtml = Object.entries(project.departments).map(([deptName, members]) => `
        <div class="department-section">
            <div class="department-header">
                <h3>
                    <i class="fas fa-users"></i>
                    ${deptName}
                </h3>
                <span class="department-count">${members.length}</span>
            </div>
            <div class="department-members">
                ${members.map(member => renderMemberCard(member)).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = departmentsHtml;
}

function renderMemberCard(member) {
    return `
        <div class="member-card" onclick="showMemberDetails(${member.id})">
            <div class="member-header">
                <div class="member-avatar">
                    ${member.avatar}
                    <div class="member-status ${member.status}"></div>
                </div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
            </div>
            <div class="member-contact">
                <div class="member-contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${member.email}</span>
                </div>
                <div class="member-contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${member.phone}</span>
                </div>
            </div>
            <div class="member-actions">
                <button class="contact-btn" onclick="event.stopPropagation(); contactEmployee('${member.email}')">
                    <i class="fas fa-envelope"></i>
                    Email
                </button>
                <button class="slack-btn" onclick="event.stopPropagation(); openSlack('${member.name}')">
                    <i class="fab fa-slack"></i>
                    Slack
                </button>
            </div>
        </div>
    `;
}

// Roles functionality
function populateRoleDropdown() {
    const dropdown = document.getElementById('roleSelect');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select a role...</option>';
    
    rolesData.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        dropdown.appendChild(option);
    });
}

function onRoleChange() {
    const dropdown = document.getElementById('roleSelect');
    const selectedRoleId = parseInt(dropdown.value);
    
    if (!selectedRoleId) {
        document.getElementById('roleContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-users"></i></div>
                <h3>Select a Role</h3>
                <p>Choose a role from the dropdown to view employees and their details</p>
            </div>
        `;
        return;
    }

    const role = rolesData.find(r => r.id === selectedRoleId);
    if (role) {
        renderRoleMembers(role);
    }
}

function renderRoleMembers(role) {
    const container = document.getElementById('roleContent');
    if (!container) return;

    const membersHtml = role.members.map(member => renderRoleMemberCard(member)).join('');
    
    container.innerHTML = `
        <div class="role-members-grid">
            ${membersHtml}
        </div>
    `;
}

function renderRoleMemberCard(member) {
    const statusClass = member.status === 'available' ? 'online' : member.status === 'busy' ? 'away' : 'offline';
    
    return `
        <div class="role-member-card" onclick="showMemberDetails(${member.id})">
            <div class="role-member-header">
                <div class="role-member-avatar">
                    ${member.avatar}
                    <div class="role-member-status ${statusClass}"></div>
                </div>
                <div class="role-member-info">
                    <div class="role-member-name">${member.name}</div>
                    <div class="role-member-title">${member.title}</div>
                    <div class="role-member-experience">${member.experience}</div>
                </div>
            </div>
            <div class="role-member-details">
                <div class="role-member-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${member.email}</span>
                </div>
                <div class="role-member-detail">
                    <i class="fas fa-phone"></i>
                    <span>${member.phone}</span>
                </div>
                <div class="role-member-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${member.location}</span>
                </div>
                <div class="role-member-detail">
                    <i class="fas fa-briefcase"></i>
                    <span>${member.currentProject}</span>
                </div>
            </div>
            <div class="role-member-skills">
                <h4>Skills</h4>
                <div class="skills-list">
                    ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="role-member-actions">
                <button class="contact-btn" onclick="event.stopPropagation(); contactEmployee('${member.email}')">
                    Contact
                </button>
                <button class="view-profile-btn" onclick="event.stopPropagation(); viewProfile(${member.id})">
                    View Profile
                </button>
            </div>
        </div>
    `;
}

// Event listeners
function setupEventListeners() {
    // Project dropdown
    const projectDropdown = document.getElementById('projectSelect');
    if (projectDropdown) {
        projectDropdown.addEventListener('change', onProjectChange);
    }

    // Role dropdown
    const roleDropdown = document.getElementById('roleSelect');
    if (roleDropdown) {
        roleDropdown.addEventListener('change', onRoleChange);
    }

    // Filter button
    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', toggleFilter);
    }
}

// Utility functions
function showEmployeeDetails(employeeId) {
    // Find employee in hierarchy
    let employee = null;
    
    if (teamHierarchy.director.id === employeeId) {
        employee = teamHierarchy.director;
    } else {
        employee = teamHierarchy.managers.find(m => m.id === employeeId) ||
                  teamHierarchy.individuals.find(i => i.id === employeeId);
    }

    if (employee) {
        showEmployeeModal(employee);
    }
}

function showMemberDetails(memberId) {
    // Find member in projects or roles data
    let member = null;
    
    // Search in projects
    for (const project of projectsData) {
        for (const dept of Object.values(project.departments)) {
            member = dept.find(m => m.id === memberId);
            if (member) break;
        }
        if (member) break;
    }
    
    // Search in roles if not found
    if (!member) {
        for (const role of rolesData) {
            member = role.members.find(m => m.id === memberId);
            if (member) break;
        }
    }

    if (member) {
        showMemberModal(member);
    }
}

function showEmployeeModal(employee) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${employee.name}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="contact-person">
                    <div class="contact-avatar">${employee.avatar}</div>
                    <div class="contact-details">
                        <h4>${employee.name}</h4>
                        <p>${employee.title}</p>
                        <div class="contact-methods">
                            <div class="contact-method">
                                <i class="fas fa-envelope"></i>
                                <span>${employee.email}</span>
                            </div>
                            <div class="contact-method">
                                <i class="fas fa-phone"></i>
                                <span>${employee.phone}</span>
                            </div>
                            <div class="contact-method">
                                <i class="fas fa-users"></i>
                                <span>Team Size: ${employee.teamCount || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="contactEmployee('${employee.email}')">
                    <i class="fas fa-envelope"></i> Send Email
                </button>
                <button class="btn-secondary" onclick="openSlack('${employee.name}')">
                    <i class="fab fa-slack"></i> Message on Slack
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal.querySelector('.modal-close'));
        }
    });
}

function showMemberModal(member) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${member.name}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="contact-person">
                    <div class="contact-avatar">${member.avatar}</div>
                    <div class="contact-details">
                        <h4>${member.name}</h4>
                        <p>${member.title || member.role}</p>
                        <div class="contact-methods">
                            <div class="contact-method">
                                <i class="fas fa-envelope"></i>
                                <span>${member.email}</span>
                            </div>
                            <div class="contact-method">
                                <i class="fas fa-phone"></i>
                                <span>${member.phone}</span>
                            </div>
                            ${member.location ? `
                                <div class="contact-method">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${member.location}</span>
                                </div>
                            ` : ''}
                            ${member.currentProject ? `
                                <div class="contact-method">
                                    <i class="fas fa-briefcase"></i>
                                    <span>${member.currentProject}</span>
                                </div>
                            ` : ''}
                        </div>
                        ${member.skills ? `
                            <div class="role-member-skills">
                                <h4>Skills</h4>
                                <div class="skills-list">
                                    ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="contactEmployee('${member.email}')">
                    <i class="fas fa-envelope"></i> Send Email
                </button>
                <button class="btn-secondary" onclick="openSlack('${member.name}')">
                    <i class="fab fa-slack"></i> Message on Slack
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal.querySelector('.modal-close'));
        }
    });
}

function closeModal(closeBtn) {
    const modal = closeBtn.closest('.modal');
    if (modal) {
        modal.remove();
    }
}

function contactEmployee(email) {
    // Open default email client
    window.location.href = `mailto:${email}`;
}

function openSlack(name) {
    // Simulate opening Slack (in real app, this would open Slack with the user)
    alert(`Opening Slack conversation with ${name}`);
}

function viewProfile(employeeId) {
    // Simulate viewing profile (in real app, this would navigate to profile page)
    alert(`Viewing profile for employee ID: ${employeeId}`);
}

function toggleFilter() {
    // Simulate filter functionality
    alert('Filter functionality would be implemented here');
}

// Global functions for dropdown changes (called from HTML)
window.onProjectChange = onProjectChange;
window.onRoleChange = onRoleChange;
