// Script to create demo users in Supabase
// Run this script to populate your database with demo users for testing

async function createDemoUsers() {
    console.log('Creating demo users in Supabase...');
    
    try {
        // Check if Supabase service is available
        if (!window.supabaseService) {
            console.error('Supabase service not available. Make sure you have loaded the Supabase configuration.');
            return;
        }
        
        const demoUsers = [
            {
                email: 'user@demo.com',
                password: 'password123',
                full_name: 'Demo User',
                role: 'user',
                designation: 'Product Design Intern'
            },
            {
                email: 'admin@demo.com',
                password: 'admin123',
                full_name: 'Admin User',
                role: 'admin',
                designation: 'System Administrator'
            },
            {
                email: 'john.doe@telus.com',
                password: 'password123',
                full_name: 'John Doe',
                role: 'user',
                designation: 'Senior Developer'
            },
            {
                email: 'sarah.johnson@telus.com',
                password: 'password123',
                full_name: 'Sarah Johnson',
                role: 'user',
                designation: 'UX Designer'
            }
        ];
        
        console.log('Creating users...');
        
        for (const userData of demoUsers) {
            try {
                console.log(`Creating user: ${userData.email}`);
                
                // Create user account with Supabase Auth
                const { data, error } = await window.supabaseService.supabase.auth.admin.createUser({
                    email: userData.email,
                    password: userData.password,
                    email_confirm: true, // Auto-confirm email for demo users
                    user_metadata: {
                        full_name: userData.full_name,
                        role: userData.role
                    }
                });
                
                if (error) {
                    console.error(`Error creating user ${userData.email}:`, error);
                    continue;
                }
                
                if (data.user) {
                    console.log(`✅ User account created: ${userData.email}`);
                    
                    // Create user profile in the profiles table
                    const profileData = {
                        id: data.user.id,
                        email: userData.email,
                        full_name: userData.full_name,
                        role: userData.role,
                        designation: userData.designation,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    const profileResult = await window.supabaseService.createUserProfile(profileData);
                    
                    if (profileResult) {
                        console.log(`✅ User profile created: ${userData.email}`);
                    } else {
                        console.warn(`⚠️ Profile creation failed for: ${userData.email}`);
                    }
                } else {
                    console.error(`❌ No user data returned for: ${userData.email}`);
                }
                
            } catch (userError) {
                console.error(`Error processing user ${userData.email}:`, userError);
            }
        }
        
        console.log('\n🎉 Demo user creation completed!');
        console.log('\nDemo Credentials:');
        console.log('👤 Regular User: user@demo.com / password123');
        console.log('🔐 Admin User: admin@demo.com / admin123');
        console.log('👨‍💻 John Doe: john.doe@telus.com / password123');
        console.log('👩‍🎨 Sarah Johnson: sarah.johnson@telus.com / password123');
        
    } catch (error) {
        console.error('Error creating demo users:', error);
    }
}

// Function to run the script
async function runDemoUserCreation() {
    console.log('🚀 Starting demo user creation process...');
    console.log('Make sure you have:');
    console.log('1. Created the database tables in Supabase');
    console.log('2. Configured your Supabase credentials');
    console.log('3. Loaded this script in a page with Supabase service');
    console.log('');
    
    await createDemoUsers();
}

// Export for use in browser console or other scripts
if (typeof window !== 'undefined') {
    window.createDemoUsers = createDemoUsers;
    window.runDemoUserCreation = runDemoUserCreation;
}

// Instructions for running this script:
console.log(`
📋 INSTRUCTIONS TO CREATE DEMO USERS:

1. Open your browser and navigate to any page with Supabase loaded (e.g., login.html)
2. Open the browser developer console (F12)
3. Copy and paste this entire script into the console
4. Run: runDemoUserCreation()
5. Wait for the script to complete

Alternatively, you can create users manually in the Supabase dashboard:
- Go to Authentication > Users in your Supabase dashboard
- Click "Add user" and create the demo users with the credentials above
- Then manually add their profiles to the profiles table

Note: This script requires admin privileges in Supabase. If it fails, 
create the users manually through the Supabase dashboard.
`);
