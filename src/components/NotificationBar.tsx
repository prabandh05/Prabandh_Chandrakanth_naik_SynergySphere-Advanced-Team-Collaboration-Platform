import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Bell, AlertTriangle, Calendar } from 'lucide-react'
import { getNotifications, markNotificationAsRead, checkDeadlineNotifications } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: string
  type: 'task_assigned' | 'deadline_soon' | 'project_update' | 'synergy_update'
  message: string
  read: boolean
  created_at: string
  projects?: {
    title: string
  }
}

export function NotificationBar() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (user) {
      loadNotifications()
      checkDeadlines()
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getNotifications(user.id)
      setNotifications(data.filter(n => !n.read))
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDeadlines = async () => {
    if (!user) return

    try {
      await checkDeadlineNotifications(user.id)
      // Reload notifications after checking deadlines
      setTimeout(() => loadNotifications(), 1000)
    } catch (error) {
      console.error('Error checking deadlines:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline_soon':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'task_assigned':
        return <Bell className="h-4 w-4 text-blue-500" />
      case 'project_update':
        return <Calendar className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deadline_soon':
        return 'border-orange-200 bg-orange-50'
      case 'task_assigned':
        return 'border-blue-200 bg-blue-50'
      case 'project_update':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading || !isVisible || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className={`border-l-4 ${getNotificationColor(notifications[0]?.type)}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notifications[0]?.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {notifications[0]?.type === 'deadline_soon' ? 'Deadline Alert' : 'Notification'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notifications[0].id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm font-medium mt-1">
                {notifications[0]?.message}
              </p>
              {notifications.length > 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +{notifications.length - 1} more notification{notifications.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
