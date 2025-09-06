import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Plus } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  status: 'To-Do' | 'In Progress' | 'Done'
  assignee?: {
    name: string
    avatar?: string | null
  }
  dueDate?: string
  project: {
    name: string
    color: string
  }
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review design mockups',
    description: 'Review the new homepage design and provide feedback',
    status: 'In Progress',
    assignee: {
      name: 'Alice Johnson',
      avatar: null
    },
    dueDate: '2024-01-15',
    project: {
      name: 'Website Redesign',
      color: 'bg-blue-500'
    }
  },
  {
    id: '2',
    title: 'Update API documentation',
    description: 'Document the new authentication endpoints',
    status: 'To-Do',
    assignee: {
      name: 'Bob Smith',
      avatar: null
    },
    dueDate: '2024-01-18',
    project: {
      name: 'Mobile App Development',
      color: 'bg-green-500'
    }
  },
  {
    id: '3',
    title: 'Prepare presentation slides',
    description: 'Create slides for the quarterly review meeting',
    status: 'Done',
    assignee: {
      name: 'Carol Davis',
      avatar: null
    },
    dueDate: '2024-01-10',
    project: {
      name: 'Marketing Campaign',
      color: 'bg-purple-500'
    }
  },
  {
    id: '4',
    title: 'Fix responsive layout issues',
    description: 'Address mobile responsiveness problems on the dashboard',
    status: 'To-Do',
    assignee: {
      name: 'David Wilson',
      avatar: null
    },
    dueDate: '2024-01-20',
    project: {
      name: 'Website Redesign',
      color: 'bg-blue-500'
    }
  }
]

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const handleTaskToggle = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'Done' ? 'To-Do' : 'Done' }
        : task
    ))
  }

  const getDueDateText = (dueDate: string) => {
    const date = new Date(dueDate)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM dd')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-500'
      case 'In Progress': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'Done'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Tasks</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={task.status === 'Done'}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(task.status)} text-white`}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${task.project.color}`}></div>
                        <span className="text-sm text-muted-foreground">
                          {task.project.name}
                        </span>
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={isOverdue(task.dueDate, task.status) ? 'text-red-500' : 'text-muted-foreground'}>
                            {getDueDateText(task.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {task.assignee && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {task.assignee.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
