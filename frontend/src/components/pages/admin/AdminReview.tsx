import React, { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getClearanceRequestDetails, updateClearanceRequest } from '@/apiClient'
import { useToast } from "@/hooks/use-toast"

export default function AdminReview() {
  const [requestDetail, setRequestDetail] = useState<any>(null)
  const [status, setStatus] = useState("")
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        const data = await getClearanceRequestDetails(id!)
        setRequestDetail(data)
        setStatus(data.status)
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to fetch request details:", err)
        setError("Failed to load request details. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchRequestDetail()
  }, [id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await updateClearanceRequest(id!, { status, comment })
      toast({
        title: "Success",
        description: "Request updated successfully.",
      })
    } catch (err) {
      console.error("Failed to update request:", err)
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!requestDetail) return <div>Request not found</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Review: Request #{id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Review Clearance Request</CardTitle>
          <CardDescription>Update the status and add comments for this clearance request.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestInfo">Request Information</Label>
              <p id="requestInfo" className="text-sm text-muted-foreground">
                {requestDetail.name} - {requestDetail.type} clearance (Submitted on {requestDetail.submittedDate})
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="More Info Required">More Info Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Add Comment</Label>
              <Textarea
                id="comment"
                placeholder="Enter your review comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit Review</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}