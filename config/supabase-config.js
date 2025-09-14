/**
 * @fileoverview Supabase Configuration for TELUS Digital Platform
 * @description Configuration and client setup for Supabase integration
 * @author TELUS Digital Team
 * @version 1.0.0
 */

// Supabase configuration
const SUPABASE_CONFIG = {
    url: 'https://bxwrzkehbbzlhsnwsyld.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4d3J6a2VoYmJ6bGhzbndzeWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTA4ODcsImV4cCI6MjA3MzI4Njg4N30.UndsnZUX7oMBdPxNANaF3QoC0fNVP7aVWPuv6WwCJeg',
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
};

// Initialize Supabase client
let supabaseClient = null;

// Function to initialize Supabase client
function initializeSupabase() {
    try {
        // Check if we're in a browser environment and Supabase is available
        if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey,
                SUPABASE_CONFIG.options
            );
            console.log('✅ Supabase client initialized successfully');
            return supabaseClient;
        } else {
            console.warn('⚠️ Supabase library not loaded. Using localStorage fallback.');
            return null;
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        return null;
    }
}

// Get Supabase client instance
function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = initializeSupabase();
    }
    return supabaseClient;
}

// Database table names
const TABLES = {
    PROFILES: 'profiles',
    TASKS: 'tasks',
    DOCUMENTS: 'documents',
    EXPERTISE_CONTENT: 'expertise_content',
    ASSIGNMENTS: 'assignments'
};

// Database schema SQL for reference (to be run in Supabase dashboard)
const DATABASE_SCHEMA = `
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  designation TEXT,
  pod TEXT,
  phone TEXT,
  location TEXT,
  experience TEXT,
  skills TEXT[],
  current_project TEXT,
  availability TEXT DEFAULT 'Available',
  avatar_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resources TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  assigned_to TEXT[] DEFAULT ARRAY['all'],
  created_by UUID REFERENCES auth.users(id),
  completion_date TIMESTAMP WITH TIME ZONE,
  user_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'pdf',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under-review')),
  file_url TEXT,
  assigned_to TEXT[] DEFAULT ARRAY['all'],
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES auth.users(id),
  user_response TEXT,
  admin_note TEXT,
  review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expertise content table
CREATE TABLE IF NOT EXISTS expertise_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('task', 'document')),
  item_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Tasks policies
CREATE POLICY "Users can view assigned tasks" ON tasks FOR SELECT USING (
  'all' = ANY(assigned_to) OR 
  (SELECT email FROM profiles WHERE id = auth.uid()) = ANY(assigned_to)
);
CREATE POLICY "Users can update assigned tasks" ON tasks FOR UPDATE USING (
  'all' = ANY(assigned_to) OR 
  (SELECT email FROM profiles WHERE id = auth.uid()) = ANY(assigned_to)
);
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Documents policies  
CREATE POLICY "Users can view assigned documents" ON documents FOR SELECT USING (
  'all' = ANY(assigned_to) OR 
  (SELECT email FROM profiles WHERE id = auth.uid()) = ANY(assigned_to)
);
CREATE POLICY "Users can update assigned documents" ON documents FOR UPDATE USING (
  'all' = ANY(assigned_to) OR 
  (SELECT email FROM profiles WHERE id = auth.uid()) = ANY(assigned_to)
);
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Expertise content policies
CREATE POLICY "Everyone can view active content" ON expertise_content FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all content" ON expertise_content FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Assignments policies
CREATE POLICY "Admins can manage assignments" ON assignments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
`;

// Export configuration
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.TABLES = TABLES;
window.getSupabaseClient = getSupabaseClient;
window.initializeSupabase = initializeSupabase;

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
});

console.log('📋 Supabase configuration loaded. Database schema available in SUPABASE_CONFIG.');
console.log('🔧 To set up the database, run the SQL schema in your Supabase dashboard.');
