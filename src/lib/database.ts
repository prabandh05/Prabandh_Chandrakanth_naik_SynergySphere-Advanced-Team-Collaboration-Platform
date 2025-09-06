import { supabase } from './supabase'
import { Project, Task, Message, SynergyScore, Notification, ProjectMember } from './supabase'

// Projects
export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      project_id,
      role,
      projects!inner(
        id,
        title,
        description,
        deadline,
        status,
        owner_id,
        created_at,
        updated_at,
        tasks(id, status, assignee_id)
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  
  // Transform the data to match the expected format and sort by created_at
  const transformedData = data?.map(item => ({
    ...item.projects,
    project_members: [{ user_id: userId, role: item.role }]
  })) || []
  
  // Sort by created_at in descending order
  return transformedData.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single()

  if (error) throw error

  // Add the creator as a project member
  await supabase
    .from('project_members')
    .insert([{
      project_id: data.id,
      user_id: project.owner_id,
      role: 'owner'
    }])

  return data
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Tasks
export async function getTasks(projectId?: string, userId?: string) {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      projects(title)
    `)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (userId) {
    query = query.eq('assignee_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Messages
export async function getMessages(projectId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      user:auth.users(id, email, raw_user_meta_data)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single()

  if (error) throw error
  return data
}

// Synergy Scores
export async function getSynergyScores(userId: string) {
  const { data, error } = await supabase
    .from('synergy_scores')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('score', { ascending: false })

  if (error) throw error
  
  return data || []
}

export async function calculateSynergyScore(user1Id: string, user2Id: string) {
  // Get projects where both users are members
  const { data: projects, error: projectsError } = await supabase
    .from('project_members')
    .select(`
      project_id,
      projects!inner(id, status, deadline, created_at, updated_at)
    `)
    .in('user_id', [user1Id, user2Id])

  if (projectsError) throw projectsError

  // Group by project and check if both users are in the same project
  const projectMap = new Map()
  projects?.forEach(pm => {
    if (!projectMap.has(pm.project_id)) {
      projectMap.set(pm.project_id, [])
    }
    projectMap.get(pm.project_id).push(pm)
  })

  const sharedProjects = Array.from(projectMap.values())
    .filter(projectMembers => projectMembers.length === 2)
    .map(projectMembers => projectMembers[0].projects)

  if (sharedProjects.length === 0) return 0

  // Calculate synergy based on project completion times and collaboration
  let totalScore = 0
  let completedProjects = 0

  for (const project of sharedProjects) {
    if (project.status === 'completed') {
      completedProjects++
      const deadline = new Date(project.deadline)
      const completedAt = new Date(project.updated_at)
      const created = new Date(project.created_at)
      
      // Calculate time efficiency (earlier completion = higher score)
      const totalTime = deadline.getTime() - created.getTime()
      const actualTime = completedAt.getTime() - created.getTime()
      const efficiency = Math.max(0, (totalTime - actualTime) / totalTime)
      
      // Base score for completion + efficiency bonus
      totalScore += 100 + (efficiency * 200)
    }
  }

  // Bonus for multiple collaborations
  const collaborationBonus = Math.min(sharedProjects.length * 50, 200)
  totalScore += collaborationBonus

  return Math.round(totalScore)
}

export async function updateSynergyScore(user1Id: string, user2Id: string, score: number) {
  // Ensure user1Id < user2Id for consistency
  const [id1, id2] = [user1Id, user2Id].sort()
  
  const { data, error } = await supabase
    .from('synergy_scores')
    .upsert([{
      user1_id: id1,
      user2_id: id2,
      score,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Project Members
export async function getProjectMembers(projectId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)

  if (error) throw error
  return data || []
}

export async function addProjectMember(projectId: string, userId: string, role: 'owner' | 'member' = 'member') {
  const { data, error } = await supabase
    .from('project_members')
    .insert([{
      project_id: projectId,
      user_id: userId,
      role
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeProjectMember(projectId: string, userId: string) {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) throw error
}

// Notifications
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      projects(title)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Deadline Notifications
export async function checkDeadlineNotifications(userId: string) {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  // Check project deadlines
  const { data: projects } = await supabase
    .from('project_members')
    .select(`
      project_id,
      projects!inner(id, title, deadline, status)
    `)
    .eq('user_id', userId)
    .not('projects.deadline', 'is', null)
    .lte('projects.deadline', tomorrow.toISOString())
    .gte('projects.deadline', now.toISOString())
    .eq('projects.status', 'active')

  // Check task deadlines
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      due_date,
      status,
      projects!inner(title)
    `)
    .eq('assignee_id', userId)
    .not('due_date', 'is', null)
    .lte('due_date', tomorrow.toISOString())
    .gte('due_date', now.toISOString())
    .neq('status', 'Done')

  // Create notifications for project deadlines
  for (const project of projects || []) {
    const deadline = new Date(project.projects.deadline)
    const isToday = deadline.toDateString() === now.toDateString()
    const isTomorrow = deadline.toDateString() === tomorrow.toDateString()
    
    const message = isToday 
      ? `Project "${project.projects.title}" deadline is today!`
      : `Project "${project.projects.title}" deadline is tomorrow!`

    await createNotification({
      user_id: userId,
      project_id: project.project_id,
      type: 'deadline_soon',
      message,
      read: false
    })
  }

  // Create notifications for task deadlines
  for (const task of tasks || []) {
    const deadline = new Date(task.due_date)
    const isToday = deadline.toDateString() === now.toDateString()
    const isTomorrow = deadline.toDateString() === tomorrow.toDateString()
    
    const message = isToday 
      ? `Task "${task.title}" in "${task.projects.title}" is due today!`
      : `Task "${task.title}" in "${task.projects.title}" is due tomorrow!`

    await createNotification({
      user_id: userId,
      project_id: task.projects.id,
      type: 'deadline_soon',
      message,
      read: false
    })
  }

  return { projects: projects?.length || 0, tasks: tasks?.length || 0 }
}

// User Invitations - Create a pending invitation system
export async function createProjectInvitation(projectId: string, email: string, role: 'owner' | 'member' = 'member', invitedBy: string) {
  const { data, error } = await supabase
    .from('project_invitations')
    .insert([{
      project_id: projectId,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      invited_by: invitedBy,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Invitation already sent to this email')
    }
    throw error
  }
  
  return data
}

// Get pending invitations for a project
export async function getProjectInvitations(projectId: string) {
  const { data, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get user's pending invitations
export async function getUserInvitations(userEmail: string) {
  const { data, error } = await supabase
    .from('project_invitations')
    .select(`
      *,
      projects(title, description)
    `)
    .eq('email', userEmail.toLowerCase())
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Accept project invitation
export async function acceptProjectInvitation(invitationId: string) {
  try {
    // Try the database function first
    const { data, error } = await supabase.rpc('accept_project_invitation', {
      invitation_id: invitationId
    })

    if (error) throw error
    return data
  } catch (error) {
    // Fallback: manual acceptance
    console.log('Using fallback invitation acceptance')
    
    // Get the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      throw new Error('Invitation not found or already processed')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not found')
    }

    // Add user to project
    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{
        project_id: invitation.project_id,
        user_id: user.id,
        role: invitation.role
      }])

    if (memberError) {
      console.log('User might already be a member:', memberError)
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('project_invitations')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (updateError) throw updateError

    return { success: true, message: 'Invitation accepted successfully' }
  }
}

// Decline project invitation
export async function declineProjectInvitation(invitationId: string) {
  const { data, error } = await supabase
    .from('project_invitations')
    .update({ 
      status: 'declined',
      updated_at: new Date().toISOString()
    })
    .eq('id', invitationId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get users from project members across all projects (for display purposes)
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('project_members')
    .select('user_id')

  if (error) throw error
  
  // Get unique user IDs
  const uniqueUserIds = new Set(data?.map(item => item.user_id) || [])
  
  // For now, return user IDs - we'll need to get user details differently
  return Array.from(uniqueUserIds).map(id => ({ id }))
}

export async function getProjectUsers(projectId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select('user_id, role')
    .eq('project_id', projectId)

  if (error) throw error
  return data || []
}

// Dashboard Stats
export async function getDashboardStats(userId: string) {
  // Get user's projects
  const { data: projects } = await supabase
    .from('project_members')
    .select('project_id, projects!inner(*)')
    .eq('user_id', userId)

  const projectIds = projects?.map(p => p.project_id) || []

  // Get tasks assigned to user
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assignee_id', userId)

  // Get synergy scores
  const { data: synergyScores } = await supabase
    .from('synergy_scores')
    .select('score')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

  // Get unique team members across all projects
  const { data: teamMembers } = await supabase
    .from('project_members')
    .select('user_id')
    .in('project_id', projectIds)
    .neq('user_id', userId)

  const uniqueTeamMembers = new Set(teamMembers?.map(m => m.user_id) || []).size

  const totalProjects = projectIds.length
  const activeTasks = tasks?.filter(t => t.status !== 'Done').length || 0
  const totalSynergy = synergyScores?.reduce((sum, s) => sum + s.score, 0) || 0
  const avgSynergy = synergyScores?.length ? Math.round(totalSynergy / synergyScores.length) : 0

  return {
    totalProjects,
    activeTasks,
    synergyScore: avgSynergy,
    teamMembers: uniqueTeamMembers
  }
}

// Real-time subscriptions
export function subscribeToProjectUpdates(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`project-${projectId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
      callback
    )
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
      callback
    )
    .subscribe()
}

export function subscribeToMessages(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`messages-${projectId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
      callback
    )
    .subscribe()
}
