import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Mail, CheckCircle } from 'lucide-react'
import { createProjectInvitation } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface EmailInviteDialogProps {
  projectId: string
  onInvitationSent: () => void
}

export function EmailInviteDialog({ projectId, onInvitationSent }: EmailInviteDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'owner'>('member')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !user) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      await createProjectInvitation(projectId, email.trim(), role, user.id)
      
      setSuccess(true)
      setEmail('')
      setRole('member')
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        onInvitationSent()
      }, 2000)
      
    } catch (error) {
      console.error('Error sending invitation:', error)
      setError(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite by Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite User to Project</DialogTitle>
            <DialogDescription>
              Send an invitation to a user by email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Invitation sent successfully! The user will receive a notification.
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user's email address..."
                  className="pl-10"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={(value: 'member' | 'owner') => setRole(value)}
                disabled={loading || success}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>User will receive a notification about the invitation</li>
                <li>They can accept or decline the invitation</li>
                <li>Once accepted, they'll be added to the project</li>
                <li>You can then assign tasks to them</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !email.trim() || success}
            >
              {loading ? 'Sending...' : success ? 'Sent!' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
