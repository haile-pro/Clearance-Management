import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock } from 'lucide-react'
import { Link } from "react-router-dom"
import { getUserDashboardStats } from '@/apiClient'
import { motion } from "framer-motion"

function UserDashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedClearances: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch user dashboard stats:", error)
      }
    }
    fetchStats()
  }, [])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Clearance Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.pendingRequests}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Completed Clearances</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.completedClearances}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="flex space-x-4">
        <Button asChild>
          <Link to="/request">New Clearance Request</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/requests">View My Requests</Link>
        </Button>
      </div>
    </div>
  )
}

export default UserDashboard