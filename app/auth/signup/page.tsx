"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"
import { useRouter } from "next/navigation"
import { Check, X, Eye, EyeOff } from "lucide-react"

interface ValidationState {
  name: { isValid: boolean; message: string }
  email: { isValid: boolean; message: string; checking?: boolean }
  password: {
    isValid: boolean
    requirements: {
      minLength: boolean
      hasUppercase: boolean
      hasLowercase: boolean
      hasNumber: boolean
      hasSpecialChar: boolean
    }
  }
  confirmPassword: { isValid: boolean; message: string }
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [validation, setValidation] = useState<ValidationState>({
    name: { isValid: false, message: "" },
    email: { isValid: false, message: "" },
    password: {
      isValid: false,
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      }
    },
    confirmPassword: { isValid: false, message: "" }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const { signUp } = useSupabaseAuth()
  const router = useRouter()

  // Validation functions
  const validateName = (name: string) => {
    if (name.length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters" }
    }
    if (name.length > 50) {
      return { isValid: false, message: "Name must be less than 50 characters" }
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return { isValid: false, message: "Name can only contain letters, spaces, hyphens, and apostrophes" }
    }
    return { isValid: true, message: "" }
  }

  const validateEmail = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return { isValid: false, message: "Email is required", checking: false }
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address", checking: false }
    }

    // Check if email already exists
    try {
      const response = await fetch(`/api/auth/create-user?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.exists) {
        return { isValid: false, message: "An account with this email already exists", checking: false }
      }
      
      return { isValid: true, message: "", checking: false }
    } catch (error) {
      // If check fails, still allow the email format to be valid
      return { isValid: true, message: "", checking: false }
    }
  }

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }
    
    const isValid = Object.values(requirements).every(req => req)
    
    return {
      isValid,
      requirements
    }
  }

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return { isValid: false, message: "Please confirm your password" }
    }
    if (confirmPassword !== password) {
      return { isValid: false, message: "Passwords do not match" }
    }
    return { isValid: true, message: "" }
  }

  // Check if form is valid for submission
  const isFormValid = () => {
    return validation.name.isValid && 
           validation.email.isValid && 
           validation.password.isValid && 
           validation.confirmPassword.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!isFormValid()) {
      setSubmitError("Please fix all validation errors before submitting")
      return
    }

    setIsLoading(true)
    try {
      const data = await signUp(formData.email, formData.password, formData.name)
      
      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        alert("Account created successfully! Please check your email and click the confirmation link to verify your account.")
      } else {
        alert("Account created successfully! You can now sign in.")
      }
      
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Signup failed:", error)
      setSubmitError(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Real-time validation
    switch (name) {
      case 'name':
        setValidation(prev => ({
          ...prev,
          name: validateName(value)
        }))
        break
      case 'email':
        setValidation(prev => ({
          ...prev,
          email: { isValid: false, message: "Checking...", checking: true }
        }))
        validateEmail(value).then(result => {
          setValidation(prev => ({
            ...prev,
            email: result
          }))
        })
        break
      case 'password':
        const passwordValidation = validatePassword(value)
        setValidation(prev => ({
          ...prev,
          password: passwordValidation,
          confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
        }))
        break
      case 'confirmPassword':
        setValidation(prev => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value, formData.password)
        }))
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">AT</span>
          </div>
          <CardTitle className="text-2xl font-bold">Join AniTrack</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">Create your account to start tracking</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Full Name Field */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`${validation.name.isValid ? 'border-green-500' : formData.name ? 'border-red-500' : ''}`}
                required
              />
              {formData.name && !validation.name.isValid && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {validation.name.message}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={`${validation.email.isValid ? 'border-green-500' : formData.email ? 'border-red-500' : ''}`}
                required
              />
              {formData.email && (
                <div className={`text-sm mt-1 flex items-center ${
                  validation.email.checking 
                    ? 'text-blue-500' 
                    : validation.email.isValid 
                      ? 'text-green-600' 
                      : 'text-red-500'
                }`}>
                  {validation.email.checking ? (
                    <>
                      <div className="w-4 h-4 mr-1 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Checking email availability...
                    </>
                  ) : validation.email.isValid ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Email is available
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      {validation.email.message}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`${validation.password.isValid ? 'border-green-500' : formData.password ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-medium text-gray-700">Password requirements:</div>
                  <div className="space-y-1">
                    <div className={`flex items-center text-sm ${validation.password.requirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.requirements.minLength ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center text-sm ${validation.password.requirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.requirements.hasUppercase ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center text-sm ${validation.password.requirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.requirements.hasLowercase ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center text-sm ${validation.password.requirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.requirements.hasNumber ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                      One number
                    </div>
                    <div className={`flex items-center text-sm ${validation.password.requirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.requirements.hasSpecialChar ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`${validation.confirmPassword.isValid ? 'border-green-500' : formData.confirmPassword ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && !validation.confirmPassword.isValid && (
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {validation.confirmPassword.message}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className={`w-full ${isFormValid() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
