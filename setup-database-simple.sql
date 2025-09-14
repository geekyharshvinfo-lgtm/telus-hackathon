-- TELUS Digital Platform - Simplified Database Setup
-- This script avoids policy conflicts and focuses on essential components
-- Run this in your Supabase SQL Editor

-- Create profiles table if it doesn't exist
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

-- Create tasks table if it doesn't exist
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

-- Create documents table if it doesn't exist
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

-- Create expertise content table if it doesn't exist
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

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('task', 'document')),
  item_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace the trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile with all user metadata
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
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    designation = EXCLUDED.designation,
    pod = EXCLUDED.pod,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    experience = EXCLUDED.experience,
    skills = EXCLUDED.skills,
    current_project = EXCLUDED.current_project,
    availability = EXCLUDED.availability,
    description = EXCLUDED.description,
    updated_at = NOW();
    
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_documents_assigned_to ON documents USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_expertise_content_status ON expertise_content(status);

-- Enable RLS on tables (without creating conflicting policies)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE expertise_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Verify setup
SELECT 
  'Tables created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'tasks', 'documents', 'expertise_content', 'assignments');

-- Test trigger function
SELECT 
  'Trigger function created successfully' as status,
  proname as function_name
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Success message
SELECT 'Database setup completed successfully! You can now test user signup.' as message;
