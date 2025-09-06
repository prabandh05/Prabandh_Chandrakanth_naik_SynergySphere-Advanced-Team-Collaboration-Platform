import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function EnvironmentCheck() {
  const [checks, setChecks] = useState({
    supabaseUrl: false,
    supabaseKey: false,
    databaseConnection: false,
    loading: true
  })

  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    const newChecks = {
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here',
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here',
      databaseConnection: false,
      loading: false
    }

    // Test database connection
    if (newChecks.supabaseUrl && newChecks.supabaseKey) {
      try {
        const { data, error } = await supabase.from('projects').select('count').limit(1)
        newChecks.databaseConnection = !error
      } catch (error) {
        console.error('Database connection test failed:', error)
        newChecks.databaseConnection = false
      }
    }

    setChecks(newChecks)
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-500">Connected</Badge>
    ) : (
      <Badge variant="destructive">Not Connected</Badge>
    )
  }

  if (checks.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Environment Check
          </CardTitle>
          <CardDescription>Checking your Supabase configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Environment Check
        </CardTitle>
        <CardDescription>Verify your Supabase configuration is working</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(checks.supabaseUrl)}
            <span className="text-sm">Supabase URL</span>
          </div>
          {getStatusBadge(checks.supabaseUrl)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(checks.supabaseKey)}
            <span className="text-sm">Supabase API Key</span>
          </div>
          {getStatusBadge(checks.supabaseKey)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(checks.databaseConnection)}
            <span className="text-sm">Database Connection</span>
          </div>
          {getStatusBadge(checks.databaseConnection)}
        </div>

        {!checks.supabaseUrl || !checks.supabaseKey ? (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Setup Required:</strong> Please create a <code>.env</code> file with your Supabase credentials.
              <br />
              <br />
              <code>
                VITE_SUPABASE_URL=your_supabase_project_url<br />
                VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
              </code>
            </p>
          </div>
        ) : !checks.databaseConnection ? (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Database Error:</strong> Unable to connect to your Supabase database. 
              Please check your credentials and ensure your database is set up correctly.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>All Good!</strong> Your Supabase configuration is working correctly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
