'use client';

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthCarousel from '@/components/auth/AuthCarousel'
import { Button } from '@/components/ui/button'

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      
      // For development phase - Check for hardcoded credentials
      if (email === 'dashboard' && password === 'dashboard') {
        // Redirect to dashboard on successful login
        router.push('/dashboard');
      } else if(email === 'admin' && password === 'admin') {
        // Redirect to dashboard on successful login
        router.push('/admin');{
      }
    } else if(email === 'partner' && password === 'partner') {
      // Redirect to dashboard on successful login
      router.push('/partners');{
    }
  } 
      else {
        setError('Invalid credentials. Use admin/admin for development.');
      }
    }
    
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Side Section - Login Form */}
      <div className="flex flex-col justify-center items-center px-8 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        {/* Logo positioned at top left */}
        <div className="absolute top-6 left-8 md:left-12 lg:left-16">
          <Link href="/" className="inline-block text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            VidalSigns
          </Link>
        </div>
        
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Log in to your account</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                  </label>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit"
                className="w-full"
                variant="default">
                Log in
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline hover:text-primary/90 cursor-pointer">
                Sign up
              </Link>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/" className="hover:underline hover:text-foreground cursor-pointer">
                ← Back to home
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side Section - Carousel */}
      <AuthCarousel />
    </div>
  )
} 