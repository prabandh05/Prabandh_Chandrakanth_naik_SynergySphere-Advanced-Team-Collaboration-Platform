import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Mail, Search } from 'lucide-react'
import { getAllUsers, addProjectMember } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface InviteUserDialogProps {
  projectId: string
  onUserAdded: () => void
}

export function InviteUserDialog({ projectId, onUserAdded }: InviteUserDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [role, setRole] = useState<'member' | 'owner'>('member')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await getAllUsers()
      // Filter out current user
      const filteredUsers = allUsers.filter(u => u.id !== user?.id)
      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return

    try {
      setLoading(true)
      setError(null)
      await addProjectMember(projectId, selectedUserId, role)
      
      setSelectedUserId('')
      setRole('member')
      setSearchTerm('')
      setOpen(false)
      onUserAdded()
    } catch (error) {
      console.error('Error adding user to project:', error)
      setError(error instanceof Error ? error.message : 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add User to Project</DialogTitle>
            <DialogDescription>
              Add an existing user to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  There are no other users in the system yet. Ask them to sign up first.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>To add users:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Ask them to create an account</li>
                    <li>They need to be added to at least one project</li>
                    <li>Then they'll appear in this list</li>
                  </ol>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user">Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex flex-col">
                            <span>User {user.id.slice(0, 8)}</span>
                            <span className="text-sm text-muted-foreground">{user.id}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: 'member' | 'owner') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {users.length > 0 && (
              <Button type="submit" disabled={loading || !selectedUserId}>
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
