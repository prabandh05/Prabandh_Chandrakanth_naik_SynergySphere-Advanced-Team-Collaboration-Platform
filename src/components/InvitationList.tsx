import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getUserInvitations, acceptProjectInvitation, declineProjectInvitation } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface Invitation {
  id: string
  project_id: string
  email: string
  role: string
  status: string
  created_at: string
  projects: {
    title: string
    description?: string
  }
}

export function InvitationList() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) {
      loadInvitations()
    }
  }, [user])

  const loadInvitations = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      const data = await getUserInvitations(user.email)
      setInvitations(data)
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (invitationId: string) => {
    try {
      setProcessing(invitationId)
      await acceptProjectInvitation(invitationId)
      await loadInvitations() // Reload invitations
    } catch (error) {
      console.error('Error accepting invitation:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleDecline = async (invitationId: string) => {
    try {
      setProcessing(invitationId)
      await declineProjectInvitation(invitationId)
      await loadInvitations() // Reload invitations
    } catch (error) {
      console.error('Error declining invitation:', error)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Project Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Project Invitations
          </CardTitle>
          <CardDescription>
            You have no pending project invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invitations</h3>
            <p className="text-muted-foreground">
              You'll see project invitations here when someone invites you to collaborate.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Project Invitations
        </CardTitle>
        <CardDescription>
          You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold">{invitation.projects.title}</h4>
                  <Badge variant="secondary">
                    {invitation.role}
                  </Badge>
                </div>
                {invitation.projects.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {invitation.projects.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Invited {new Date(invitation.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={processing === invitation.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {processing === invitation.id ? 'Accepting...' : 'Accept'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation.id)}
                  disabled={processing === invitation.id}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {processing === invitation.id ? 'Declining...' : 'Decline'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
