-- Fix for infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view projects they're members of" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects they own" ON projects;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can add members" ON project_members;
DROP POLICY IF EXISTS "Users can view tasks from their projects" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view messages from their projects" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their projects" ON messages;
DROP POLICY IF EXISTS "Users can view their synergy scores" ON synergy_scores;
DROP POLICY IF EXISTS "Users can update synergy scores" ON synergy_scores;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

-- Create simplified, non-recursive policies

-- Projects: Users can view projects they own or are members of
CREATE POLICY "Users can view their projects" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR
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

-- Project members: Users can view members of projects they're in
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Project members: Project owners can add members
CREATE POLICY "Project owners can add members" ON project_members
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Tasks: Users can view tasks from projects they're in
CREATE POLICY "Users can view tasks from their projects" ON tasks
  FOR SELECT USING (
    assignee_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Tasks: Users can create tasks in projects they're in
CREATE POLICY "Users can create tasks in their projects" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
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
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can view messages from projects they're in
CREATE POLICY "Users can view messages from their projects" ON messages
  FOR SELECT USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can create messages in projects they're in
CREATE POLICY "Users can create messages in their projects" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
      ) OR
      project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid()
      )
    )
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
