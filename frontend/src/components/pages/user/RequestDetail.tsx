import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getClearanceRequestDetails, addComment } from '@/apiClient'
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import MagicalLoader from '@/components/pages/MagicalLoader'

interface RequestDetail {
  _id: string;
  fullName: string;
  email: string;
  clearanceType: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  documents: Array<{ filename: string; path: string }>;
  comments: { author: string; date: string; text: string }[];
}

export default function RequestDetail() {
  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!id) {
        setError("Invalid request ID")
        setIsLoading(false)
        return
      }
      try {
        const data = await getClearanceRequestDetails(id)
        setRequestDetail(data)
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to fetch request details:", err)
        setError("Failed to load request details. Please try again later.")
        setIsLoading(false)
      }
    }
    fetchRequestDetail()
  }, [id])

  const handleAddComment = async () => {
    if (!id) return;
    try {
      await addComment(id, newComment);
      const updatedRequest = await getClearanceRequestDetails(id);
      setRequestDetail(updatedRequest);
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <MagicalLoader />
  if (error) return <div>{error}</div>
  if (!requestDetail) return <div>Request not found</div>

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
          Clearance Request Details
        </motion.h1>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="font-semibold">Name</dt>
                    <dd>{requestDetail.fullName}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Email</dt>
                    <dd>{requestDetail.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Clearance Type</dt>
                    <dd>{requestDetail.clearanceType}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Status</dt>
                    <dd>
                      <Badge variant={requestDetail.status === "Approved" ? "secondary" :
                        requestDetail.status === "Rejected" ? "destructive" : "default"}>
                        {requestDetail.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Submitted Date</dt>
                    <dd>{new Date(requestDetail.createdAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader>
                <CardTitle>Reason for Clearance</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{requestDetail.reason}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{requestDetail.description}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4">
                  {requestDetail.documents && requestDetail.documents.length > 0 ? (
                    requestDetail.documents.map((doc, index) => (
                      <li key={index}>
                        <a 
                            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            {doc.filename}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li>No documents uploaded</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requestDetail.comments && requestDetail.comments.length > 0 ? (
                  requestDetail.comments.map((comment, index) => (
                    <div key={index} className="border-b pb-2">
                      <p className="font-semibold">{comment.author} - {new Date(comment.date).toLocaleString()}</p>
                      <p>{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}
                <Textarea
                  placeholder="Add a new comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment}>Add Comment</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div
          variants={itemVariants}
          className="mt-6"
        >
          <Button onClick={() => navigate('/requests')}>Back to Requests</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}