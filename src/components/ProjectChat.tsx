import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Users,
  Hash
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  user: {
    id: string
    name: string
    avatar?: string | null
  }
  timestamp: string
  type: 'message' | 'system'
}

interface ProjectChatProps {
  projectId: string
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey team! I just finished the design mockups for the homepage. Let me know what you think!',
    user: {
      id: '1',
      name: 'Alice Johnson',
      avatar: null
    },
    timestamp: '2024-01-15T10:30:00Z',
    type: 'message'
  },
  {
    id: '2',
    content: 'Looks great Alice! The layout is much cleaner than what we had before.',
    user: {
      id: '2',
      name: 'Bob Smith',
      avatar: null
    },
    timestamp: '2024-01-15T10:35:00Z',
    type: 'message'
  },
  {
    id: '3',
    content: 'I have a few suggestions for the mobile version. Should we schedule a quick call to discuss?',
    user: {
      id: '3',
      name: 'Carol Davis',
      avatar: null
    },
    timestamp: '2024-01-15T10:42:00Z',
    type: 'message'
  },
  {
    id: '4',
    content: 'Carol joined the project',
    user: {
      id: 'system',
      name: 'System',
      avatar: null
    },
    timestamp: '2024-01-15T09:15:00Z',
    type: 'system'
  },
  {
    id: '5',
    content: 'Sure! How about tomorrow at 2 PM?',
    user: {
      id: '1',
      name: 'Alice Johnson',
      avatar: null
    },
    timestamp: '2024-01-15T10:45:00Z',
    type: 'message'
  },
  {
    id: '6',
    content: 'Perfect! I\'ll send out a calendar invite.',
    user: {
      id: '3',
      name: 'Carol Davis',
      avatar: null
    },
    timestamp: '2024-01-15T10:47:00Z',
    type: 'message'
  }
]

const mockMembers = [
  { id: '1', name: 'Alice Johnson', status: 'online', avatar: null },
  { id: '2', name: 'Bob Smith', status: 'online', avatar: null },
  { id: '3', name: 'Carol Davis', status: 'away', avatar: null },
  { id: '4', name: 'David Wilson', status: 'offline', avatar: null }
]

export function ProjectChat({ projectId }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [members] = useState(mockMembers)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      user: {
        id: 'current-user',
        name: 'You',
        avatar: null
      },
      timestamp: new Date().toISOString(),
      type: 'message'
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    } else {
      return format(date, 'MMM dd, h:mm a')
    }
  }

  return (
    <div className="h-[600px] flex">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">general</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {members.filter(m => m.status === 'online').length} online
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Project discussion and team communication
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {message.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.type === 'system' && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        message.type === 'system' 
                          ? 'text-muted-foreground italic' 
                          : 'text-foreground'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Paperclip className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Smile className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Sidebar */}
      <div className="w-64 border-l bg-card p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Team Members
            </h3>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Paperclip className="h-4 w-4 mr-2" />
                Share File
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Start Video Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
