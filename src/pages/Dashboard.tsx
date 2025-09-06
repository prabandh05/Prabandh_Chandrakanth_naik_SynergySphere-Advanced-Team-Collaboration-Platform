import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  LogOut, 
  Settings, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Bell,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProjectCard } from '@/components/ProjectCard'
import { TaskList } from '@/components/TaskList'
import { SynergyLeaderboard } from '@/components/SynergyLeaderboard'
import { ProjectDetail } from '@/components/ProjectDetail'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
import { EnvironmentCheck } from '@/components/EnvironmentCheck'
import { NotificationBar } from '@/components/NotificationBar'
import { InvitationList } from '@/components/InvitationList'
import { getProjects, getDashboardStats, getTasks } from '@/lib/database'

export default function Dashboard() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    synergyScore: 0,
    teamMembers: 0
  })
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setProjectsLoading(true)
      setTasksLoading(true)

      // Load projects
      const userProjects = await getProjects(user.id)
      setProjects(userProjects)

      // Load user's tasks
      const userTasks = await getTasks(undefined, user.id)
      setTasks(userTasks)

      // Load dashboard stats
      const dashboardStats = await getDashboardStats(user.id)
      setStats(dashboardStats)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setProjectsLoading(false)
      setTasksLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  if (selectedProject) {
    return (
      <ProjectDetail 
        projectId={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notification Bar */}
      <NotificationBar />
      
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SynergySphere
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search projects, tasks..." 
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-card border-r min-h-screen p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.user_metadata?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'projects' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('projects')}
              >
                <Target className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button 
                variant={activeTab === 'tasks' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('tasks')}
              >
                <Users className="mr-2 h-4 w-4" />
                Tasks
              </Button>
              <Button 
                variant={activeTab === 'synergy' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('synergy')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Synergy
              </Button>
            </nav>

            <div className="pt-4 border-t">
              <CreateProjectDialog onProjectCreated={loadDashboardData} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user.user_metadata?.name || 'User'}!</h2>
              <p className="text-muted-foreground">
                {activeTab === 'projects' && "Here's what's happening with your projects today."}
                {activeTab === 'tasks' && "Manage your tasks and stay on track."}
                {activeTab === 'synergy' && "Track your collaboration scores and team performance."}
              </p>
            </div>

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <EnvironmentCheck />
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                    <CreateProjectDialog onProjectCreated={loadDashboardData} />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => {
                      // Calculate progress based on tasks
                      const totalTasks = project.tasks?.length || 0
                      const completedTasks = project.tasks?.filter((task: any) => task.status === 'Done').length || 0
                      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                      // Get project members
                      const members = project.project_members?.map((member: any) => ({
                        name: member.user?.raw_user_meta_data?.name || member.user?.email || 'Unknown User',
                        avatar: member.user?.raw_user_meta_data?.avatar_url || null
                      })) || []

                      return (
                        <ProjectCard
                          key={project.id}
                          id={project.id}
                          title={project.title}
                          description={project.description || ''}
                          progress={progress}
                          members={members}
                          deadline={project.deadline || ''}
                          onClick={() => setSelectedProject(project.id)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <TaskList tasks={tasks} loading={tasksLoading} onTaskCreated={loadDashboardData} />
              </div>
            )}

            {activeTab === 'synergy' && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalProjects}</div>
                      <p className="text-xs text-muted-foreground">Your active projects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeTasks}</div>
                      <p className="text-xs text-muted-foreground">Tasks assigned to you</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Synergy Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.synergyScore}</div>
                      <p className="text-xs text-muted-foreground">Average collaboration score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.teamMembers}</div>
                      <p className="text-xs text-muted-foreground">Collaborators across projects</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  <SynergyLeaderboard />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-card border-l p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Synergy Leaderboard</h3>
              <SynergyLeaderboard />
            </div>

            <div>
              <InvitationList />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Discussion
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Alice completed "Design Review" task</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Bob joined "Mobile App" project</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Marketing Campaign completed on time!</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
