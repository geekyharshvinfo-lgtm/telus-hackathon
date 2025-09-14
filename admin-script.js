// Admin script for admin interface (admin.html)

let editingId = null;

// Load the data script and initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load mock data script
    const script = document.createElement('script');
    script.src = 'data.js';
    document.head.appendChild(script);
    
    // Wait for data to load then initialize
    script.onload = function() {
        initializeAdminInterface();
    };
});

function initializeAdminInterface() {
    checkAdminAuth();
    loadContentTable();
    setupFormHandlers();
}

function checkAdminAuth() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        alert('Please login to access the admin panel');
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }
    
    // Update navbar with admin info
    const navbar = document.querySelector('.navbar-nav');
    navbar.innerHTML = `
        <span class="navbar-text me-3">Admin: ${user.name}</span>
        <a class="nav-link" href="index.html">User View</a>
        <a class="nav-link" href="#" onclick="logout()">Logout</a>
    `;
}

function setupFormHandlers() {
    const form = document.getElementById('add-content-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const imageUrl = document.getElementById('image-url').value.trim();
    
    if (!title || !description) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        if (editingId) {
            // Update existing content
            const updated = DataManager.updateContent(editingId, title, description, imageUrl);
            if (updated) {
                showMessage('Content updated successfully!', 'success');
                resetForm();
            } else {
                showMessage('Error updating content', 'error');
            }
        } else {
            // Add new content
            const newContent = DataManager.addContent(title, description, imageUrl);
            showMessage('Content added successfully!', 'success');
            resetForm();
        }
        
        loadContentTable();
    } catch (error) {
        showMessage('Error processing request: ' + error.message, 'error');
    }
}

function loadContentTable() {
    const tableBody = document.getElementById('content-table');
    if (!tableBody) return;
    
    const content = DataManager.getAllContent();
    
    if (content.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <em>No content available</em>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    content.forEach(item => {
        const row = createTableRow(item);
        tableBody.appendChild(row);
    });
}

function createTableRow(item) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.title}</td>
        <td>${item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}</td>
        <td>
            <button class="btn btn-sm btn-primary me-2" onclick="editContent(${item.id})">
                Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteContent(${item.id})">
                Delete
            </button>
        </td>
    `;
    return row;
}

function editContent(id) {
    const content = DataManager.getContentById(id);
    if (!content) {
        showMessage('Content not found', 'error');
        return;
    }
    
    // Populate form with existing data
    document.getElementById('title').value = content.title;
    document.getElementById('description').value = content.description;
    document.getElementById('image-url').value = content.imageUrl || '';
    
    // Update form state
    editingId = id;
    const submitBtn = document.querySelector('#add-content-form button[type="submit"]');
    submitBtn.textContent = 'Update Content';
    
    // Add cancel button
    if (!document.getElementById('cancel-edit')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary ms-2';
        cancelBtn.id = 'cancel-edit';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = resetForm;
        submitBtn.parentNode.appendChild(cancelBtn);
    }
    
    showMessage('Editing content. Make changes and click Update.', 'info');
}

function deleteContent(id) {
    if (!confirm('Are you sure you want to delete this content?')) {
        return;
    }
    
    try {
        const success = DataManager.deleteContent(id);
        if (success) {
            showMessage('Content deleted successfully!', 'success');
            loadContentTable();
        } else {
            showMessage('Error deleting content', 'error');
        }
    } catch (error) {
        showMessage('Error deleting content: ' + error.message, 'error');
    }
}

function resetForm() {
    const form = document.getElementById('add-content-form');
    if (form) {
        form.reset();
    }
    
    editingId = null;
    const submitBtn = document.querySelector('#add-content-form button[type="submit"]');
    submitBtn.textContent = 'Add Content';
    
    // Remove cancel button if it exists
    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.admin-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} admin-message`;
    messageDiv.textContent = message;
    
    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Auto-refresh table every 30 seconds
setInterval(function() {
    if (typeof DataManager !== 'undefined') {
        loadContentTable();
    }
}, 30000);
