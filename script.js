// Main script for user interface (index.html)

// Load the data script
document.addEventListener('DOMContentLoaded', function() {
    // Load mock data script
    const script = document.createElement('script');
    script.src = 'data.js';
    document.head.appendChild(script);
    
    // Wait for data to load then initialize
    script.onload = function() {
        initializeUserInterface();
    };
});

function initializeUserInterface() {
    loadContent();
    checkAuthStatus();
}

function loadContent() {
    const contentGrid = document.getElementById('content-grid');
    if (!contentGrid) return;

    // Get all active content from mock data
    const content = DataManager.getAllContent();
    
    if (content.length === 0) {
        contentGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <h4>No content available</h4>
                    <p>Check back later for new content!</p>
                </div>
            </div>
        `;
        return;
    }

    // Clear existing content
    contentGrid.innerHTML = '';

    // Create content cards
    content.forEach(item => {
        const contentCard = createContentCard(item);
        contentGrid.appendChild(contentCard);
    });
}

function createContentCard(item) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 col-sm-6 mb-4';
    
    colDiv.innerHTML = `
        <div class="card content-card fade-in">
            <img src="${item.imageUrl}" class="card-img-top" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x200/6c757d/ffffff?text=Image+Not+Found'">
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.description}</p>
                <small class="text-muted">Posted on ${formatDate(item.dateCreated)}</small>
            </div>
        </div>
    `;
    
    return colDiv;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const navbar = document.querySelector('.navbar-nav');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        // Update navbar to show user info
        navbar.innerHTML = `
            <span class="navbar-text me-3">Welcome, ${user.name}!</span>
            <a class="nav-link" href="#" onclick="logout()">Logout</a>
            ${user.role === 'admin' ? '<a class="nav-link" href="admin.html">Admin Panel</a>' : ''}
        `;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// Auto-refresh content every 30 seconds to simulate real-time updates
setInterval(function() {
    if (typeof DataManager !== 'undefined') {
        loadContent();
    }
}, 30000);

// Add some interactive features
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('content-card') || e.target.closest('.content-card')) {
        const card = e.target.closest('.content-card');
        card.style.transform = 'scale(1.02)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    }
});

// Show loading spinner function
function showLoading() {
    const contentGrid = document.getElementById('content-grid');
    if (contentGrid) {
        contentGrid.innerHTML = `
            <div class="col-12">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading content...</p>
                </div>
            </div>
        `;
    }
}
