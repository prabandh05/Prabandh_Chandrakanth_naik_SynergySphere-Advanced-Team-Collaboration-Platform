import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  deadline?: string
  status: 'active' | 'completed' | 'archived'
  owner_id: string
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  project_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'To-Do' | 'In Progress' | 'Done'
  assignee_id?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
}

export interface SynergyScore {
  user1_id: string
  user2_id: string
  score: number
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  project_id?: string
  type: 'task_assigned' | 'deadline_soon' | 'project_update' | 'synergy_update'
  message: string
  read: boolean
  created_at: string
}
