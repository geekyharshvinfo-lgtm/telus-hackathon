// User Dashboard Script for TELUS Digital

let currentFilter = 'all';
let userStats = {
    viewCount: 0,
    favoriteCount: 0,
    lastVisit: new Date().toLocaleDateString()
};

// Initialize the user dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if DataManager is already available
    if (typeof DataManager !== 'undefined') {
        initializeUserDashboard();
    } else {
        // Load data script first
        const script = document.createElement('script');
        script.src = 'data.js';
        document.head.appendChild(script);
        
        script.onload = function() {
            initializeUserDashboard();
        };
    }
});

function initializeUserDashboard() {
    checkUserAuth();
    loadUserInfo();
    loadContent();
    loadUserStats();
    setupEventListeners();
    setupRealTimeSync();
}

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

function loadUserInfo() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        // Update profile dropdown elements
        const profileName = document.getElementById('profileName');
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        
        if (profileName) {
            profileName.textContent = user.name;
        }
        if (dropdownName) {
            dropdownName.textContent = user.name;
        }
        if (dropdownEmail) {
            dropdownEmail.textContent = user.email;
        }
        
        // Update role if admin
        const profileRole = document.querySelector('.profile-role');
        if (profileRole && user.role === 'admin') {
            profileRole.textContent = 'Administrator';
        }
    }
}

function setupEventListeners() {
    // Auto-refresh content every 30 seconds with smooth loading
    setInterval(() => loadContent(true), 30000);
    
    // Load user stats from localStorage if available
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
        userStats = { ...userStats, ...JSON.parse(savedStats) };
    }
}

function loadContent(isAutoRefresh = false) {
    const contentGrid = document.getElementById('contentGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    
    if (!contentGrid) return;
    
    // For auto-refresh, use smooth transition instead of showing loading spinner
    if (isAutoRefresh) {
        loadContentSmoothly();
        return;
    }
    
    // Show loading for manual refresh
    showLoading();
    
    setTimeout(() => {
        try {
            let content = DataManager.getAllContent();
            
            // Apply filters
            content = applyContentFilter(content, currentFilter);
            
            hideLoading();
            
            if (content.length === 0) {
                showEmptyState();
                return;
            }
            
            hideEmptyState();
            renderContentGrid(content);
            
        } catch (error) {
            console.error('Error loading content:', error);
            hideLoading();
            showEmptyState();
        }
    }, 500); // Simulate loading delay
}

function loadContentSmoothly() {
    const contentGrid = document.getElementById('contentGrid');
    
    try {
        let content = DataManager.getAllContent();
        
        // Apply filters
        content = applyContentFilter(content, currentFilter);
        
        if (content.length === 0) {
            // Only show empty state if currently showing content
            if (contentGrid.children.length > 0) {
                showEmptyState();
            }
            return;
        }
        
        // Create new content in completely hidden background
        const tempContainer = document.createElement('div');
        tempContainer.className = 'content-grid';
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '-9999px';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.opacity = '0';
        tempContainer.style.pointerEvents = 'none';
        
        content.forEach(item => {
            const contentCard = createContentCard(item);
            tempContainer.appendChild(contentCard);
        });
        
        // Add temp container to DOM (completely hidden)
        document.body.appendChild(tempContainer);
        
        // Check if content has actually changed
        if (hasContentChanged(contentGrid, tempContainer)) {
            // Silently replace content without any visual effects
            const currentDisplay = contentGrid.style.display;
            const currentTransition = contentGrid.style.transition;
            
            // Temporarily disable transitions
            contentGrid.style.transition = 'none';
            
            // Replace content instantly
            contentGrid.innerHTML = tempContainer.innerHTML;
            
            // Restore original styles
            contentGrid.style.display = currentDisplay;
            
            // Re-enable transitions after a brief delay
            setTimeout(() => {
                contentGrid.style.transition = currentTransition;
            }, 10);
            
            // Ensure empty state is hidden
            hideEmptyState();
        }
        
        // Clean up temp container
        tempContainer.remove();
        
    } catch (error) {
        console.error('Error loading content smoothly:', error);
        // Fallback to regular loading only for manual refresh
        // Don't show errors during auto-refresh
    }
}

function hasContentChanged(currentGrid, newGrid) {
    const currentCards = currentGrid.querySelectorAll('.content-card');
    const newCards = newGrid.querySelectorAll('.content-card');
    
    if (currentCards.length !== newCards.length) {
        return true;
    }
    
    // Compare content by checking titles (simple comparison)
    for (let i = 0; i < currentCards.length; i++) {
        const currentTitle = currentCards[i].querySelector('h3')?.textContent;
        const newTitle = newCards[i].querySelector('h3')?.textContent;
        
        if (currentTitle !== newTitle) {
            return true;
        }
    }
    
    return false;
}

function applyContentFilter(content, filter) {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    
    switch (filter) {
        case 'recent':
            return content.filter(item => new Date(item.dateCreated) >= threeDaysAgo);
        case 'popular':
            // Simulate popularity based on ID (lower ID = more popular)
            return content.sort((a, b) => a.id - b.id);
        case 'all':
        default:
            return content.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    }
}

function renderContentGrid(content) {
    const contentGrid = document.getElementById('contentGrid');
    contentGrid.innerHTML = '';
    
    content.forEach(item => {
        const contentCard = createContentCard(item);
        contentGrid.appendChild(contentCard);
    });
}

function createContentCard(item) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'content-card';
    cardDiv.onclick = () => openContentModal(item);
    
    cardDiv.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.title}" 
             onerror="this.src='https://via.placeholder.com/300x200/6c757d/ffffff?text=Image+Not+Found'">
        <div class="content-card-body">
            <h3>${item.title}</h3>
            <p>${item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description}</p>
            <div class="content-card-meta">
                Posted on ${formatDate(item.dateCreated)}
            </div>
        </div>
    `;
    
    return cardDiv;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function filterContent(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Reload content with new filter
    loadContent();
}

function showLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const contentGrid = document.getElementById('contentGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (contentGrid) contentGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
}

function hideLoading() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const contentGrid = document.getElementById('contentGrid');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (contentGrid) contentGrid.style.display = 'grid';
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const contentGrid = document.getElementById('contentGrid');
    
    if (emptyState) emptyState.style.display = 'block';
    if (contentGrid) contentGrid.style.display = 'none';
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'none';
}

function openContentModal(item) {
    const modal = document.getElementById('contentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalDate = document.getElementById('modalDate');
    
    if (!modal) return;
    
    // Update modal content
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalDescription) modalDescription.textContent = item.description;
    if (modalDate) modalDate.textContent = `Posted on ${formatDate(item.dateCreated)}`;
    
    if (modalImage && item.imageUrl) {
        modalImage.src = item.imageUrl;
        modalImage.alt = item.title;
        modalImage.style.display = 'block';
        modalImage.onerror = function() {
            this.style.display = 'none';
        };
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Update view count
    userStats.viewCount++;
    updateUserStats();
    
    // Store current item for favorites
    modal.dataset.currentItemId = item.id;
}

function closeModal() {
    const modal = document.getElementById('contentModal');
    if (modal) {
        modal.style.display = 'none';
        delete modal.dataset.currentItemId;
    }
}

function addToFavorites() {
    const modal = document.getElementById('contentModal');
    const itemId = modal?.dataset.currentItemId;
    
    if (!itemId) return;
    
    // Get or create favorites list
    let favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    
    if (!favorites.includes(parseInt(itemId))) {
        favorites.push(parseInt(itemId));
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
        
        userStats.favoriteCount++;
        updateUserStats();
        
        showMessage('Added to favorites!', 'success');
    } else {
        showMessage('Already in favorites', 'info');
    }
}

function loadUserStats() {
    // Load saved stats
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
        userStats = { ...userStats, ...JSON.parse(savedStats) };
    }
    
    // Load favorites count
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    userStats.favoriteCount = favorites.length;
    
    // Update UI
    updateStatsDisplay();
}

function updateUserStats() {
    // Save to localStorage
    localStorage.setItem('userStats', JSON.stringify(userStats));
    
    // Update display
    updateStatsDisplay();
}

function updateStatsDisplay() {
    const viewCount = document.getElementById('viewCount');
    const lastVisit = document.getElementById('lastVisit');
    const favoriteCount = document.getElementById('favoriteCount');
    
    if (viewCount) viewCount.textContent = userStats.viewCount;
    if (lastVisit) lastVisit.textContent = userStats.lastVisit;
    if (favoriteCount) favoriteCount.textContent = userStats.favoriteCount;
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
    // Update last visit time
    userStats.lastVisit = new Date().toLocaleDateString();
    localStorage.setItem('userStats', JSON.stringify(userStats));
    
    // Clear session
    localStorage.removeItem('currentUser');
    
    // Redirect to landing page
    window.location.href = 'index.html';
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('contentModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('contentModal');
    if (modal && modal.style.display === 'flex') {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
});

// Setup real-time synchronization
function setupRealTimeSync() {
    if (typeof DataManager !== 'undefined' && DataManager.setupRealTimeSync) {
        DataManager.setupRealTimeSync(function(detail) {
            console.log('Content data changed, refreshing user dashboard...');
            loadContent();
            showMessage('Content updated!', 'info');
        });
    }
}

// Profile dropdown functionality
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (dropdown && dropdownMenu) {
        dropdown.classList.toggle('active');
        
        // Close dropdown when clicking outside
        if (dropdown.classList.contains('active')) {
            setTimeout(() => {
                document.addEventListener('click', closeDropdownOnOutsideClick);
            }, 0);
        } else {
            document.removeEventListener('click', closeDropdownOnOutsideClick);
        }
    }
}

function closeDropdownOnOutsideClick(event) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeDropdownOnOutsideClick);
    }
}

function goToProfile() {
    // Close dropdown first
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    // For now, show a message that profile page is coming soon
    showMessage('Profile page coming soon!', 'info');
    
    // In a real application, you would navigate to the profile page:
    // window.location.href = 'profile.html';
}

// Update last visit on page load
document.addEventListener('DOMContentLoaded', function() {
    userStats.lastVisit = new Date().toLocaleDateString();
    setTimeout(() => {
        localStorage.setItem('userStats', JSON.stringify(userStats));
    }, 1000);
});
