// Mock data for the website
// This simulates what would come from a backend database

let contentData = [
    {
        id: 1,
        title: "Welcome to Our Platform",
        description: "Discover amazing features and content managed by our team. This is a sample post to demonstrate the functionality.",
        imageUrl: "https://via.placeholder.com/400x200/007bff/ffffff?text=Welcome",
        dateCreated: "2024-01-15",
        isActive: true
    },
    {
        id: 2,
        title: "Latest Updates",
        description: "Stay up to date with our latest features and improvements. We're constantly working to make your experience better.",
        imageUrl: "https://via.placeholder.com/400x200/28a745/ffffff?text=Updates",
        dateCreated: "2024-01-20",
        isActive: true
    },
    {
        id: 3,
        title: "Community Highlights",
        description: "See what our amazing community has been up to. Join the conversation and share your own experiences.",
        imageUrl: "https://via.placeholder.com/400x200/ffc107/000000?text=Community",
        dateCreated: "2024-01-25",
        isActive: true
    }
];

// User data for authentication simulation
const users = [
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

// Helper functions for data management
const DataManager = {
    // Get all active content
    getAllContent: function() {
        return contentData.filter(item => item.isActive);
    },

    // Get content by ID
    getContentById: function(id) {
        return contentData.find(item => item.id === parseInt(id));
    },

    // Add new content
    addContent: function(title, description, imageUrl) {
        const newId = Math.max(...contentData.map(item => item.id)) + 1;
        const newContent = {
            id: newId,
            title: title,
            description: description,
            imageUrl: imageUrl || `https://via.placeholder.com/400x200/6c757d/ffffff?text=${encodeURIComponent(title)}`,
            dateCreated: new Date().toISOString().split('T')[0],
            isActive: true
        };
        contentData.push(newContent);
        return newContent;
    },

    // Update content
    updateContent: function(id, title, description, imageUrl) {
        const index = contentData.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            contentData[index].title = title;
            contentData[index].description = description;
            if (imageUrl) {
                contentData[index].imageUrl = imageUrl;
            }
            return contentData[index];
        }
        return null;
    },

    // Delete content (soft delete)
    deleteContent: function(id) {
        const index = contentData.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            contentData[index].isActive = false;
            return true;
        }
        return false;
    },

    // User authentication
    authenticateUser: function(email, password) {
        return users.find(user => user.email === email && user.password === password);
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
        return { success: true, user: newUser };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { contentData, users, DataManager };
}
