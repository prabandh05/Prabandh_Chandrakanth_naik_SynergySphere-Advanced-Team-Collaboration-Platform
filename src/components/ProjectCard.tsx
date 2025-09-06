import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'

interface ProjectCardProps {
  id: string
  title: string
  description: string
  progress: number
  members: Array<{
    name: string
    avatar?: string | null
  }>
  deadline: string
  onClick: () => void
}

export function ProjectCard({ 
  id, 
  title, 
  description, 
  progress, 
  members, 
  deadline, 
  onClick 
}: ProjectCardProps) {
  const isOverdue = new Date(deadline) < new Date() && progress < 100
  const isCompleted = progress === 100

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
          <Badge 
            variant={isCompleted ? 'default' : isOverdue ? 'destructive' : 'secondary'}
          >
            {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(deadline), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{members.length}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium">+{members.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
