import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { getSynergyScores } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface SynergyPair {
  id: string
  user1: {
    name: string
    avatar?: string | null
  }
  user2: {
    name: string
    avatar?: string | null
  }
  score: number
  change: number
  projects: number
}

export function SynergyLeaderboard() {
  const { user } = useAuth()
  const [synergyData, setSynergyData] = useState<SynergyPair[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadSynergyData()
    }
  }, [user])

  const loadSynergyData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getSynergyScores(user.id)
      
      const formattedData = data.map((item: any) => ({
        id: `${item.user1_id}-${item.user2_id}`,
        user1: {
          name: `User ${item.user1_id.slice(0, 8)}`,
          avatar: null
        },
        user2: {
          name: `User ${item.user2_id.slice(0, 8)}`,
          avatar: null
        },
        score: item.score || 0,
        change: 0, // This would need to be calculated based on historical data
        projects: 1 // This would need to be calculated based on shared projects
      }))

      setSynergyData(formattedData)
    } catch (error) {
      console.error('Error loading synergy data:', error)
    } finally {
      setLoading(false)
    }
  }
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 600) return 'text-blue-600'
    if (score >= 400) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Top Collaborators
          </CardTitle>
          <CardDescription>
            Teams with the highest synergy scores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Top Collaborators
        </CardTitle>
        <CardDescription>
          Teams with the highest synergy scores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {synergyData.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No collaborations yet</h3>
            <p className="text-muted-foreground text-sm">
              Start working on projects with others to build synergy scores
            </p>
          </div>
        ) : (
          synergyData.map((pair, index) => (
            <div key={pair.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={pair.user1.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {pair.user1.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={pair.user2.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {pair.user2.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {pair.user1.name.split(' ')[0]} & {pair.user2.name.split(' ')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pair.projects} projects together
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(pair.score)}`}>
                  {pair.score}
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`h-3 w-3 ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {pair.change >= 0 ? '+' : ''}{pair.change}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Synergy scores are calculated based on project completion times and team collaboration
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
