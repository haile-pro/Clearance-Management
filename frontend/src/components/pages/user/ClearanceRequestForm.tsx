import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitClearanceRequest } from '@/apiClient'
import { useToast } from "@/hooks/use-toast"

export default function ClearanceRequestForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [clearanceType, setClearanceType] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [documents, setDocuments] = useState<File[]>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('email', email)
    formData.append('clearanceType', clearanceType)
    formData.append('reason', reason)
    formData.append('description', description)
    documents.forEach((doc) => {
      formData.append('documents', doc)
    })

    try {
      await submitClearanceRequest(formData)
      toast({
        title: "Success",
        description: "Clearance request submitted successfully.",
      })
      navigate('/requests')
    } catch (error) {
      console.error('Failed to submit clearance request:', error)
      toast({
        title: "Error",
        description: "Failed to submit clearance request. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Clearance Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clearanceType">Clearance Type</Label>
            <Select value={clearanceType} onValueChange={setClearanceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select clearance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confidential">Confidential</SelectItem>
                <SelectItem value="secret">Secret</SelectItem>
                <SelectItem value="top-secret">Top Secret</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Clearance</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documents">Upload Documents</Label>
            <Input
              id="documents"
              type="file"
              multiple
              onChange={(e) => setDocuments(Array.from(e.target.files || []))}
            />
          </div>
          <Button type="submit">Submit Request</Button>
        </form>
      </CardContent>
    </Card>
  )
}