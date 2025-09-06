-- Simple invitation system setup
-- Run this in your Supabase SQL Editor

-- Create project_invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, email)
);

-- Enable RLS
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view invitations for their projects" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can create invitations" ON project_invitations;
DROP POLICY IF EXISTS "Users can update their own invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can delete invitations" ON project_invitations;

-- Create simple RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON project_invitations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create function to accept invitations
CREATE OR REPLACE FUNCTION accept_project_invitation(invitation_id UUID)
RETURNS JSON AS $$
DECLARE
  invitation_record project_invitations%ROWTYPE;
  user_record auth.users%ROWTYPE;
  result JSON;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record 
  FROM project_invitations 
  WHERE id = invitation_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invitation not found or already processed');
  END IF;
  
  -- Get the current user
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE email = invitation_record.email;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Add user to project
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (invitation_record.project_id, user_record.id, invitation_record.role)
  ON CONFLICT (project_id, user_id) DO NOTHING;
  
  -- Update invitation status
  UPDATE project_invitations 
  SET status = 'accepted', updated_at = NOW()
  WHERE id = invitation_id;
  
  -- Create notification
  INSERT INTO notifications (user_id, project_id, type, message, read)
  VALUES (
    user_record.id,
    invitation_record.project_id,
    'project_update',
    'You have been added to a new project!',
    false
  );
  
  RETURN json_build_object('success', true, 'message', 'Invitation accepted successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
