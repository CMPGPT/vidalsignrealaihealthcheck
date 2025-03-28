'use client';

import React from 'react'
import Link from 'next/link'
import AuthCarousel from '@/components/auth/AuthCarousel'
import ReactCountryFlag from 'react-country-flag'
import { Separator } from '@/components/ui/separator';

// US states array
const usStates = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' }
];

export default function Signup() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      {/* Left Side Section - Signup Form */}
      <div className="flex flex-col justify-center items-center px-8 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        {/* Logo positioned at top left */}
        <div className="absolute top-6 left-8 md:left-12 lg:left-16">
          <Link href="/" className="inline-block text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            VidalSigns
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">Sign up to start sharing health reports with patients</p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="organizationName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Organization name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="VidalSigns Medical Center"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="state" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    State
                  </label>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ReactCountryFlag countryCode="US" svg style={{ marginRight: '5px', width: '16px', height: '12px' }} />
                    United States
                  </div>
                </div>
                <select
                  id="state"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select state</option>
                  {usStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="m@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button className="bg-primary text-primary-foreground w-full rounded-md h-10 px-4 font-medium shadow-sm hover:bg-primary/90 transition-colors cursor-pointer">
                Create Account
              </button>
            </div>

            <Separator />

            <div className="relative">
              <div className="flex items-center justify-center my-4">
                <span className="bg-background px-2 text-sm text-muted-foreground z-10">or continue with</span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-full h-10 px-4 border border-input rounded-md shadow-sm bg-white hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.4H272v95.3h147.1c-6.4 34.8-25.7 64.3-54.8 84.1v69h88.7c51.9-47.8 80.5-118.3 80.5-198z" />
                    <path fill="#34A853" d="M272 544.3c73.8 0 135.6-24.5 180.7-66.4l-88.7-69c-24.6 16.5-56.1 26.4-92 26.4-70.8 0-130.7-47.8-152.2-111.8H29.5v70.5C74.2 475.1 167.7 544.3 272 544.3z" />
                    <path fill="#FBBC05" d="M119.8 323.5c-10.2-30-10.2-62.3 0-92.3v-70.5H29.5c-38.5 76.4-38.5 167.9 0 244.3l90.3-70.5z" />
                    <path fill="#EA4335" d="M272 107.3c39.9-.6 78.2 13.7 107.5 39.3l80.2-80.2C408.2 23.5 343.2-1.2 272 0 167.7 0 74.2 69.2 29.5 177l90.3 70.5C141.3 155.1 201.2 107.3 272 107.3z" />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center w-full h-10 px-4 border border-input rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 fill-white" viewBox="0 0 24 24">
                    <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 5 3.66 9.13 8.44 9.93v-7.03h-2.54v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.9h-2.3v7.03C18.34 21.2 22 17.07 22 12.07z" />
                  </svg>
                  Continue with Facebook
                </button>
              </div>
            </div>


            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline hover:text-primary/90 cursor-pointer">
                Log in
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link href="/" className="hover:underline hover:text-foreground cursor-pointer">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Section - Carousel */}
      <AuthCarousel />
    </div>
  )
} 