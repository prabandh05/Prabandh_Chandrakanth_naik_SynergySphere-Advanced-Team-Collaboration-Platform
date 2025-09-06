import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Plus, 
  MessageSquare, 
  Calendar,
  CheckSquare,
  Clock,
  UserPlus
} from 'lucide-react'
import { KanbanBoard } from './KanbanBoard'
import { ProjectChat } from './ProjectChat'
import { EmailInviteDialog } from './EmailInviteDialog'
import { ProjectChart } from './ProjectChart'
import { getProjectMembers, getTasks, getProjects } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectDetailProps {
  projectId: string
  onBack: () => void
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [members, setMembers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const loadProjectData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const [membersData, tasksData, projectsData] = await Promise.all([
        getProjectMembers(projectId),
        getTasks(projectId),
        getProjects(user.id)
      ])
      
      setMembers(membersData)
      setTasks(tasksData)
      
      // Find the current project from the user's projects
      const currentProject = projectsData.find(p => p.id === projectId)
      setProject(currentProject)
    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate task counts
  const taskCounts = {
    todo: tasks.filter(t => t.status === 'To-Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length
  }

  const totalTasks = taskCounts.todo + taskCounts.inProgress + taskCounts.done
  const progress = totalTasks > 0 ? Math.round((taskCounts.done / totalTasks) * 100) : 0

  // Use real project data or fallback
  const projectData = project ? {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    progress,
    deadline: project.deadline,
    members: members.map(member => ({
      id: member.user_id,
      name: `User ${member.user_id.slice(0, 8)}`,
      role: member.role,
      avatar: null
    })),
    tasks: taskCounts
  } : {
    id: projectId,
    title: 'Loading...',
    description: 'Loading project details...',
    status: 'active',
    progress: 0,
    deadline: new Date().toISOString(),
    members: [],
    tasks: { todo: 0, inProgress: 0, done: 0 }
  }

  const isOverdue = projectData.deadline && new Date(projectData.deadline) < new Date() && projectData.progress < 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
            <h1 className="text-2xl font-bold">{projectData.title}</h1>
            <p className="text-muted-foreground">{projectData.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isOverdue ? 'destructive' : projectData.status === 'completed' ? 'default' : 'secondary'}
            >
              {isOverdue ? 'Overdue' : projectData.status === 'completed' ? 'Completed' : 'Active'}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="chat">Discussion</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Project Stats */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectData.progress}%</div>
                    <Progress value={projectData.progress} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectData.tasks.todo + projectData.tasks.inProgress + projectData.tasks.done}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {projectData.tasks.done} completed, {projectData.tasks.inProgress} in progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectData.members.length}</div>
                    <p className="text-xs text-muted-foreground">Active collaborators</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectData.deadline ? new Date(projectData.deadline).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'No deadline'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isOverdue ? 'Overdue' : 'Due date'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Members</CardTitle>
                    <EmailInviteDialog projectId={projectId} onInvitationSent={loadProjectData} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {projectData.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <Avatar>
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                        <Badge variant="outline">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <KanbanBoard projectId={projectId} />
            </TabsContent>

            <TabsContent value="charts">
              <ProjectChart tasks={tasks} members={members} />
            </TabsContent>

            <TabsContent value="chat">
              <ProjectChat projectId={projectId} />
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Project Files</CardTitle>
                  <CardDescription>
                    Upload and manage project-related files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No files yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload files to share with your team
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-card border-l p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
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
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Alice completed "Design Review" task</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Bob started "API Integration" task</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Carol joined the project</p>
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
