import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface ProjectChartProps {
  tasks: any[]
  members: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ProjectChart({ tasks, members }: ProjectChartProps) {
  // Task status data
  const taskStatusData = [
    { name: 'To-Do', value: tasks.filter(t => t.status === 'To-Do').length, color: '#8884D8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#FFBB28' },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#00C49F' }
  ]

  // Task assignment data
  const taskAssignmentData = members.map(member => ({
    name: `User ${member.user_id.slice(0, 8)}`,
    tasks: tasks.filter(t => t.assignee_id === member.user_id).length
  }))

  // Weekly progress data (mock - you can implement real data)
  const weeklyProgressData = [
    { week: 'Week 1', completed: 2, total: 5 },
    { week: 'Week 2', completed: 4, total: 8 },
    { week: 'Week 3', completed: 6, total: 10 },
    { week: 'Week 4', completed: 8, total: 12 }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Task Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
          <CardDescription>Current breakdown of tasks by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Assignment Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks per Team Member</CardTitle>
          <CardDescription>Task distribution across team members</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskAssignmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Task completion over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#00C49F" name="Completed" />
              <Bar dataKey="total" fill="#8884D8" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
