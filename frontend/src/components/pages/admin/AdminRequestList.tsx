import React, { useEffect, useState } from 'react'
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
import { CheckCircle, XCircle, MessageSquare, FileText, Paperclip } from 'lucide-react'

interface Request {
  _id: string;
  userId: string;
  fullName: string;
  clearanceType: string;
  status: string;
  createdAt: string;
  description: string;
  documents: Array<{ filename: string; path: string }>;
  comments: Array<{ text: string; createdAt: string; isAdmin: boolean }>;
}

export default function AdminRequestList() {
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comment, setComment] = useState('')
  const { toast } = useToast()

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

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await updateClearanceRequest(requestId, { status: newStatus })
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === requestId ? { ...request, status: newStatus } : request
        )
      )
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus })
      }
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
      const newComment = { text: comment, createdAt: new Date().toISOString(), isAdmin: true }
      setSelectedRequest(prevRequest => {
        if (!prevRequest) return null
        return {
          ...prevRequest,
          comments: [...prevRequest.comments, newComment]
        }
      })
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === selectedRequest._id ? {
            ...request,
            comments: [...request.comments, newComment]
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
    <AnimatePresence mode="wait">
      <motion.div
        key="admin-request-list"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={containerVariants}
        className="container mx-auto p-6"
      >
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold mb-6"
        >
          Clearance Requests Management
        </motion.h1>
        <Card>
          <CardHeader>
            <CardTitle>All Clearance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
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
                    <TableCell className="font-medium">{request.fullName}</TableCell>
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
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, "Approved")}
                          disabled={request.status == "Approved"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, "Rejected")}
                          disabled={request.status == "Rejected"}
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
                <h3 className="font-semibold">User</h3>
                <p>{selectedRequest.fullName}</p>
              </div>
              <div>
                <h3 className="font-semibold">Clearance Type</h3>
                <p>{selectedRequest.clearanceType}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{selectedRequest.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Documents</h3>
                {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedRequest.documents.map((doc, index) => (
                      <li key={index}>
                        <a
                          href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${doc.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {doc.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No documents submitted</p>
                )}
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