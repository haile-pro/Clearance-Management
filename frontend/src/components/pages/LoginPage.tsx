'use client'

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '@/apiClient'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useTheme } from 'next-themes'
import logo from '@/assets/logo.png'
import bgImage from '@/assets/bgImge.jpeg'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await login(username, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role
      }))
      toast({
        title: "Success",
        description: "You have successfully logged in.",
      })
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "Failed to login. Please check your credentials and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 hidden md:block relative overflow-hidden"
      >
        <img 
          src={bgImage} 
          alt="Graduate illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white mb-40 text-center">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to Dilla University
          </h2>
          <p className="text-xl">
            Clearance Management System
          </p>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900"
      >
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Login</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
            </div>
            <div className="flex justify-center">
              <img 
                src={logo}
                alt="Dilla University Logo" 
                className="h-24 w-24"
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Don't have an account?{' '}
              <Link
                to="/register" 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage