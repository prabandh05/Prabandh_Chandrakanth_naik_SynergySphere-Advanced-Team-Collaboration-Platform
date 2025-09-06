import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  Clock,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  status: 'To-Do' | 'In Progress' | 'Done'
  assignee?: {
    id: string
    name: string
    avatar?: string | null
  }
  dueDate?: string
  priority: 'Low' | 'Medium' | 'High'
  createdAt: string
}

interface KanbanBoardProps {
  projectId: string
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design homepage layout',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'To-Do',
    assignee: {
      id: '1',
      name: 'Alice Johnson',
      avatar: null
    },
    dueDate: '2024-01-20',
    priority: 'High',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Set up login and registration functionality',
    status: 'In Progress',
    assignee: {
      id: '2',
      name: 'Bob Smith',
      avatar: null
    },
    dueDate: '2024-01-25',
    priority: 'High',
    createdAt: '2024-01-08'
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints and usage examples',
    status: 'Done',
    assignee: {
      id: '3',
      name: 'Carol Davis',
      avatar: null
    },
    dueDate: '2024-01-15',
    priority: 'Medium',
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    title: 'Set up database schema',
    description: 'Design and implement the database structure',
    status: 'Done',
    assignee: {
      id: '4',
      name: 'David Wilson',
      avatar: null
    },
    dueDate: '2024-01-12',
    priority: 'High',
    createdAt: '2024-01-03'
  },
  {
    id: '5',
    title: 'Create responsive design',
    description: 'Ensure the design works on all device sizes',
    status: 'In Progress',
    assignee: {
      id: '1',
      name: 'Alice Johnson',
      avatar: null
    },
    dueDate: '2024-01-30',
    priority: 'Medium',
    createdAt: '2024-01-12'
  },
  {
    id: '6',
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for all components',
    status: 'To-Do',
    assignee: {
      id: '2',
      name: 'Bob Smith',
      avatar: null
    },
    dueDate: '2024-02-05',
    priority: 'Low',
    createdAt: '2024-01-15'
  }
]

const columns = [
  { id: 'To-Do', title: 'To Do', color: 'bg-gray-500' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'Done', title: 'Done', color: 'bg-green-500' }
]

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: 'To-Do' | 'In Progress' | 'Done') => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'To-Do',
      assignee: newTask.assignee ? {
        id: newTask.assignee,
        name: 'New User',
        avatar: null
      } : undefined,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      createdAt: new Date().toISOString()
    }
    setTasks([...tasks, task])
    setNewTask({ title: '', description: '', assignee: '', dueDate: '', priority: 'Medium' })
    setIsCreateDialogOpen(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'Done'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Tasks</h3>
          <p className="text-sm text-muted-foreground">Manage and track project tasks</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to the project board
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Alice Johnson</SelectItem>
                      <SelectItem value="2">Bob Smith</SelectItem>
                      <SelectItem value="3">Carol Davis</SelectItem>
                      <SelectItem value="4">David Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: 'Low' | 'Medium' | 'High') => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? format(new Date(newTask.dueDate), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined}
                      onSelect={(date) => setNewTask({ ...newTask, dueDate: date ? date.toISOString().split('T')[0] : '' })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id)
          return (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h4 className="font-semibold">{column.title}</h4>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>
              </div>
              
              <div
                className="min-h-[400px] space-y-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id as 'To-Do' | 'In Progress' | 'Done')}
              >
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium text-sm">{task.title}</h5>
                          <div className="flex items-center space-x-1">
                            <Badge 
                              variant="secondary" 
                              className={`${getPriorityColor(task.priority)} text-white text-xs`}
                            >
                              {task.priority}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {task.assignee && (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignee.avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {task.assignee.name}
                              </span>
                            </div>
                          )}
                          
                          {task.dueDate && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Clock className="h-3 w-3" />
                              <span className={isOverdue(task.dueDate, task.status) ? 'text-red-500' : 'text-muted-foreground'}>
                                {format(new Date(task.dueDate), 'MMM dd')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
