# Database Setup Guide

## The Issue
Your application is currently not connected to a database. The authentication works because it's using Supabase Auth, but all the project creation, task management, and data storage features require a proper Supabase database setup.

## Quick Fix

### 1. Create Environment File
Create a `.env` file in the root directory (`collaboration-beacon/.env`) with the following content:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Go to Settings > API
5. Copy your Project URL and anon/public key
6. Replace the placeholder values in your `.env` file

### 3. Set Up Database Tables
Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'To-Do' CHECK (status IN ('To-Do', 'In Progress', 'Done')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create synergy_scores table
CREATE TABLE IF NOT EXISTS synergy_scores (
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user1_id, user2_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'deadline_soon', 'project_update', 'synergy_update')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE synergy_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Projects: Users can only see projects they're members of
CREATE POLICY "Users can view projects they're members of" ON projects
  FOR SELECT USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Projects: Users can create projects
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Projects: Users can update projects they own
CREATE POLICY "Users can update projects they own" ON projects
  FOR UPDATE USING (auth.uid() = owner_id);

-- Project members: Users can view members of their projects
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Project members: Project owners can add members
CREATE POLICY "Project owners can add members" ON project_members
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Tasks: Users can view tasks from their projects
CREATE POLICY "Users can view tasks from their projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Tasks: Users can create tasks in their projects
CREATE POLICY "Users can create tasks in their projects" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Tasks: Users can update tasks they're assigned to or in their projects
CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (
    assignee_id = auth.uid() OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can view messages from their projects
CREATE POLICY "Users can view messages from their projects" ON messages
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can create messages in their projects
CREATE POLICY "Users can create messages in their projects" ON messages
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- Synergy scores: Users can view their synergy scores
CREATE POLICY "Users can view their synergy scores" ON synergy_scores
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Synergy scores: Users can update their synergy scores
CREATE POLICY "Users can update synergy scores" ON synergy_scores
  FOR ALL USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Notifications: Users can view their notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Notifications: System can create notifications
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Notifications: Users can update their notifications
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

### 4. Restart the Development Server
After creating the `.env` file and setting up the database:
```bash
npm run dev
```

## What This Fixes
- ✅ Project creation will work
- ✅ Task management will work  
- ✅ Real-time collaboration features will work
- ✅ Synergy scoring will work
- ✅ All database operations will function properly

## Current Status
- ❌ Database connection: Missing environment variables
- ❌ Project creation: Fails due to no database connection
- ❌ Task management: Cannot load/save tasks
- ❌ All data persistence: Not working

After following this guide, all features should work properly!
