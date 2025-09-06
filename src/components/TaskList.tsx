import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Plus } from 'lucide-react'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { updateTask } from '@/lib/database'
import { CreateTaskDialog } from './CreateTaskDialog'

interface Task {
  id: string
  title: string
  description?: string
  status: 'To-Do' | 'In Progress' | 'Done'
  due_date?: string
  projects?: {
    title: string
  }
  assignee_id?: string
}

interface TaskListProps {
  tasks: Task[]
  loading?: boolean
  onTaskCreated?: () => void
}

export function TaskList({ tasks, loading = false, onTaskCreated }: TaskListProps) {
  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Done' ? 'To-Do' : 'Done'
      await updateTask(taskId, { status: newStatus })
      // The parent component will refetch the data
    } catch (error) {
      console.error('Error updating task:', error)
    }
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

  const getProjectColor = (projectTitle: string) => {
    // Simple hash function to get consistent colors
    let hash = 0
    for (let i = 0; i < projectTitle.length; i++) {
      hash = projectTitle.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[Math.abs(hash) % colors.length]
  }

  if (loading) {
    return (
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Tasks</h3>
        <CreateTaskDialog onTaskCreated={onTaskCreated || (() => {})} />
      </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Tasks</h3>
        <CreateTaskDialog onTaskCreated={onTaskCreated || (() => {})} />
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
          <p className="text-muted-foreground">You don't have any tasks assigned to you yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const projectTitle = task.projects?.title || 'Unknown Project'
            const projectColor = getProjectColor(projectTitle)

            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={task.status === 'Done'}
                      onCheckedChange={() => handleTaskToggle(task.id, task.status)}
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
                            <div className={`w-3 h-3 rounded-full ${projectColor}`}></div>
                            <span className="text-sm text-muted-foreground">
                              {projectTitle}
                            </span>
                          </div>
                          
                          {task.due_date && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={isOverdue(task.due_date, task.status) ? 'text-red-500' : 'text-muted-foreground'}>
                                {getDueDateText(task.due_date)}
                              </span>
                            </div>
                          )}
                        </div>

                        {task.assignee_id && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee_id.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              Assigned
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
