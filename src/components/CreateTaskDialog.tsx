import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createTask, getProjects, getProjectUsers } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface CreateTaskDialogProps {
  onTaskCreated: () => void
}

export function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [projectUsers, setProjectUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    due_date: undefined as Date | undefined,
    status: 'To-Do' as 'To-Do' | 'In Progress' | 'Done'
  })

  useEffect(() => {
    if (user && open) {
      loadProjects()
    }
  }, [user, open])

  const loadProjects = async () => {
    if (!user) return

    try {
      const userProjects = await getProjects(user.id)
      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadProjectUsers = async (projectId: string) => {
    if (!projectId) return

    try {
      const users = await getProjectUsers(projectId)
      setProjectUsers(users)
    } catch (error) {
      console.error('Error loading project users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim() || !formData.project_id) return

    try {
      setLoading(true)
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        project_id: formData.project_id,
        status: formData.status,
        assignee_id: formData.assignee_id || user.id,
        due_date: formData.due_date?.toISOString()
      })
      
      setFormData({ 
        title: '', 
        description: '', 
        project_id: '',
        assignee_id: '',
        due_date: undefined,
        status: 'To-Do'
      })
      setOpen(false)
      onTaskCreated()
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to one of your projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select 
                value={formData.project_id} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, project_id: value, assignee_id: '' }))
                  loadProjectUsers(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Select 
                value={formData.assignee_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignee_id: value }))}
                disabled={!formData.project_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Myself</SelectItem>
                  {projectUsers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      User {member.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'To-Do' | 'In Progress' | 'Done') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To-Do">To-Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim() || !formData.project_id}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
