import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Clock, CheckCircle, AlertCircle, Users, FileText } from 'lucide-react'
import { Link } from "react-router-dom"
import { getAdminDashboardStats } from '@/apiClient'
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  pendingRequests: number;
  completedClearances: number;
  averageProcessingTime: string;
  rejectionRate: string;
  totalUsers: number;
  totalRequests: number;
  requestsByType: {
    [key: string]: number;
  };
  recentRequests: Array<{
    id: string;
    requester: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminDashboardStats()
        setStats(data)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch admin dashboard stats:", error)
        setError("Failed to load dashboard statistics. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [toast])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!stats) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Completed Clearances"
          value={stats.completedClearances}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Avg. Processing Time"
          value={stats.averageProcessingTime}
          icon={BarChart}
          color="purple"
        />
        <StatCard
          title="Rejection Rate"
          value={stats.rejectionRate}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="yellow"
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Requests by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.requestsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="font-medium">{type}</span>
                  <span className="text-sm text-gray-600">{count} requests</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentRequests.map((request) => (
                <div key={request.id} className="flex justify-between items-center">
                  <span className="font-medium">{request.requester}</span>
                  <span className="text-sm text-gray-600">{request.type}</span>
                  <span className="text-sm text-gray-600">{request.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4">
        <Button asChild>
          <Link to="/admin/requests">Manage Requests</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/users">Manage Users</Link>
        </Button>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number | string, icon: React.ElementType, color: string }) {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5 }}>
      <Card className={`bg-${color}-50 border-${color}-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default AdminDashboard