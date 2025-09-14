-- TELUS Digital Platform Database Setup
-- Run this SQL script in your Supabase SQL Editor to set up the database

-- Note: auth.users table is managed by Supabase and cannot be modified
-- We'll work with the existing auth system

-- Drop existing tables if they exist (optional - remove if you want to keep existing data)
-- DROP TABLE IF EXISTS assignments CASCADE;
-- DROP TABLE IF EXISTS expertise_content CASCADE;
-- DROP TABLE IF EXISTS documents CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

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

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE expertise_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view assigned documents" ON documents;
DROP POLICY IF EXISTS "Users can update assigned documents" ON documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
DROP POLICY IF EXISTS "Everyone can view active content" ON expertise_content;
DROP POLICY IF EXISTS "Admins can manage all content" ON expertise_content;
DROP POLICY IF EXISTS "Admins can manage assignments" ON assignments;

-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Simplified admin policy to avoid recursion
CREATE POLICY "Service role can manage profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Tasks policies
CREATE POLICY "Users can view assigned tasks" ON tasks FOR SELECT USING (
  'all' = ANY(assigned_to) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = ANY(tasks.assigned_to))
);
CREATE POLICY "Users can update assigned tasks" ON tasks FOR UPDATE USING (
  'all' = ANY(assigned_to) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = ANY(tasks.assigned_to))
);
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Documents policies  
CREATE POLICY "Users can view assigned documents" ON documents FOR SELECT USING (
  'all' = ANY(assigned_to) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = ANY(documents.assigned_to))
);
CREATE POLICY "Users can update assigned documents" ON documents FOR UPDATE USING (
  'all' = ANY(assigned_to) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND email = ANY(documents.assigned_to))
);
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Expertise content policies
CREATE POLICY "Everyone can view active content" ON expertise_content FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all content" ON expertise_content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assignments policies
CREATE POLICY "Admins can manage assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_documents_assigned_to ON documents USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_expertise_content_status ON expertise_content(status);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    role, 
    designation, 
    pod, 
    phone, 
    location, 
    experience, 
    skills, 
    current_project, 
    availability, 
    description
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'designation', 'Team Member'),
    COALESCE(new.raw_user_meta_data->>'pod', 'Platform'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'location', 'Vancouver, BC'),
    COALESCE(new.raw_user_meta_data->>'experience', '3-5 years'),
    CASE 
      WHEN new.raw_user_meta_data->>'skills' IS NOT NULL 
      THEN string_to_array(new.raw_user_meta_data->>'skills', ',')
      ELSE ARRAY['Product Strategy', 'Agile', 'Analytics']
    END,
    COALESCE(new.raw_user_meta_data->>'current_project', 'Digital Platform Enhancement'),
    COALESCE(new.raw_user_meta_data->>'availability', 'Available'),
    COALESCE(new.raw_user_meta_data->>'description', 'Experienced professional focused on delivering innovative solutions.')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert a default admin user (optional)
-- You can uncomment and modify this if you want to create an admin user
-- Note: You'll need to sign up with this email first, then run this
/*
INSERT INTO profiles (id, email, name, role, designation) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@telus.com' LIMIT 1),
  'admin@telus.com',
  'Admin User',
  'admin',
  'System Administrator'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';
*/

-- Verify tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'tasks', 'documents', 'expertise_content', 'assignments')
ORDER BY table_name;
