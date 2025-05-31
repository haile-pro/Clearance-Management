import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { getClearanceRequests } from '@/apiClient'
import { motion, AnimatePresence } from "framer-motion"
import MagicalLoader from '@/components/pages/MagicalLoader'

interface Request {
  _id: string;
  fullName: string;
  clearanceType: string;
  status: string;
  createdAt: string;
}

export default function RequestList() {
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getClearanceRequests()
        setRequests(data)
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to fetch clearance requests:", err)
        setError("Failed to load requests. Please try again later.")
        setIsLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  if (isLoading) return <MagicalLoader />
  if (error) return <div>{error}</div>

  return (
    <AnimatePresence>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto p-6"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-bold mb-6"
        >
          Clearance Requests
        </motion.h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <motion.tr
                key={request._id}
                variants={itemVariants}
              >
                <TableCell>{request.fullName}</TableCell>
                <TableCell>{request.clearanceType}</TableCell>
                <TableCell>
                  <Badge variant={request.status === "Approved" ? "secondary" : request.status === "Rejected" ? "destructive" : "default"}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/requests/${request._id}`}>View Details</Link>
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </AnimatePresence>
  )
}