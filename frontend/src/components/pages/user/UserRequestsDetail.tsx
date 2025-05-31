import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getClearanceRequests, updateClearanceRequest, addComment } from '@/apiClient'
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import MagicalLoader from '@/components/pages/MagicalLoader'
import { CheckCircle, XCircle, MessageSquare, ArrowLeft } from 'lucide-react'

interface Request {
  _id: string;
  userId: string;
  fullName: string;
  clearanceType: string;
  status: string;
  createdAt: string;
  description: string;
  comments: Array<{ text: string; createdAt: string; isAdmin: boolean }>;
}

export default function UserRequestsDetail() {
  const { userId } = useParams<{ userId: string }>()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comment, setComment] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getClearanceRequests()
        const userRequests = data.filter((request: Request) => request.userId === userId)
        setRequests(userRequests)
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to fetch clearance requests:", err)
        setError("Failed to load requests. Please try again later.")
        setIsLoading(false)
      }
    }
    fetchRequests()
  }, [userId])

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await updateClearanceRequest(requestId, { status: newStatus })
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId ? { ...request, status: newStatus } : request
        )
      )
      toast({
        title: "Success",
        description: `Request ${newStatus.toLowerCase()} successfully.`,
      })
    } catch (error) {
      console.error("Failed to update request status:", error)
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!selectedRequest || !comment.trim()) return

    try {
      await addComment(selectedRequest._id, comment)
      setSelectedRequest(prevRequest => {
        if (!prevRequest) return null
        return {
          ...prevRequest,
          comments: [
            ...prevRequest.comments,
            { text: comment, createdAt: new Date().toISOString(), isAdmin: true }
          ]
        }
      })
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === selectedRequest._id ? {
            ...request,
            comments: [
              ...request.comments,
              { text: comment, createdAt: new Date().toISOString(), isAdmin: true }
            ]
          } : request
        )
      )
      setComment('')
      toast({
        title: "Success",
        description: "Comment added successfully.",
      })
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

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
        <motion.div variants={itemVariants} className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/requests')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Users
          </Button>
          <h1 className="text-3xl font-bold">{requests[0]?.fullName}'s Clearance Requests</h1>
        </motion.div>
        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
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
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <TableCell>{request.clearanceType}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === "Approved" ? "secondary" : request.status === "Rejected" ? "destructive" : "default"}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setIsDialogOpen(true)
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, "Approved")}
                          disabled={request.status !== "Pending"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, "Rejected")}
                          disabled={request.status !== "Pending"}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold">Clearance Type</h3>
                <p>{selectedRequest.clearanceType}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{selectedRequest.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge variant={selectedRequest.status === "Approved" ? "secondary" : selectedRequest.status === "Rejected" ? "destructive" : "default"}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Comments</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRequest.comments.map((comment, index) => (
                    <div key={index} className={`p-2 rounded ${comment.isAdmin ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <p className="text-sm">{comment.text}</p>
                      <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Add Comment</h3>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your comment here..."
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleAddComment}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}