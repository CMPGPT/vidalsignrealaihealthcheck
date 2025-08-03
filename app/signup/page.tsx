'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCarousel from '@/components/auth/AuthCarousel';
import ReactCountryFlag from 'react-country-flag';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import isEmail from 'validator/lib/isEmail';
import Swal from 'sweetalert2'
import { Poppins, Raleway } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

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
  { value: 'DC', label: 'District of Columbia' },
];

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_Name: '',
    last_Name: '',
    organization_name: '',
    state: '',
    email: '',
    password: '',
    website_link: '',
  });
  // @ts-ignore
  const handleChange = async (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (id === 'email') {
      setFormData({ ...formData, email: value });
      const isValid = isEmail(value);
      setIsEmailValid(isValid);

      if (isValid) {
        setIsCheckingEmail(true);
        try {
          const res = await fetch(`/api/check-email?email=${value}`);
          const data = await res.json();
          setIsEmailTaken(data.exists);
        } catch {
          setIsEmailTaken(false);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setIsEmailTaken(false);
      }
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Signup failed');

      if (data.requiresVerification) {
        Swal.fire({
          title: 'Account Created Successfully! 🎉',
          html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 15px; font-size: 16px;">
                Your VidalSigns account has been created successfully!
              </p>
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <h4 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 14px;">📧 Verification Required</h4>
                <p style="color: #0369a1; margin: 0; font-size: 14px; line-height: 1.5;">
                  We've sent a verification link to your email address. Please check your inbox and click the verification link to activate your account.
                </p>
              </div>
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">⚠️ Important</h4>
                <ul style="color: #b45309; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                  <li>You cannot access your account until verified</li>
                  <li>Check your spam folder if you don't see the email</li>
                  <li>The verification link expires in 24 hours</li>
                </ul>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Check My Email',
          showCancelButton: true,
          cancelButtonText: 'Go to Login',
          confirmButtonColor: '#667eea',
          cancelButtonColor: '#6b7280',
        }).then((result) => {
          if (result.isConfirmed) {
            // Open email client or show instructions
            Swal.fire({
              title: 'Email Instructions',
              html: `
                <div style="text-align: left;">
                  <p style="margin-bottom: 15px; font-size: 16px;">
                    To verify your account:
                  </p>
                  <ol style="text-align: left; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                    <li>Check your email inbox</li>
                    <li>Look for an email from "VidalSigns"</li>
                    <li>Click the "Verify Email Address" button</li>
                    <li>Or copy the verification link and paste it in your browser</li>
                  </ol>
                  <div style="background: #f0f9ff; border-radius: 8px; padding: 15px; margin-top: 15px;">
                    <p style="color: #0369a1; margin: 0; font-size: 14px;">
                      <strong>Didn't receive the email?</strong><br>
                      Check your spam folder or contact support at textgpt.team@gmail.com
                    </p>
                  </div>
                </div>
              `,
              icon: 'info',
              confirmButtonText: 'Got It',
              confirmButtonColor: '#667eea',
            });
          } else {
            router.push('/login');
          }
        });
      } else {
        Swal.fire({
          title: 'Signup Successful!',
          text: 'Your account has been created successfully. Please log in to access your dashboard.',
          icon: 'success',
          confirmButtonText: 'Go to Login',
        }).then(() => {
          router.push('/login');
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        // @ts-ignore
        text: err.message || 'Something went wrong',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [showEmailHint, setShowEmailHint] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // @ts-ignore
  function getPasswordStrength(password) {
    const strength = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return strength;
  }

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 min-h-screen ${poppins.className}`}>
      <div className="flex flex-col justify-center items-center px-8 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        <div className="absolute top-6 left-8 md:left-12 lg:left-16">
          <Link href="/" className="inline-block text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            VidalSigns
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">Sign up to start uploading and analyzing your lab reports</p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_Name" className="text-sm font-medium">First name</label>
                  <input
                    id="first_Name"
                    type="text"
                    value={formData.first_Name}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_Name" className="text-sm font-medium">Last name</label>
                  <input
                    id="last_Name"
                    type="text"
                    value={formData.last_Name}
                    onChange={handleChange}
                    className="input-style"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="organization_name" className="text-sm font-medium">Organization name</label>
                <input
                  id="organization_name"
                  type="text"
                  value={formData.organization_name}
                  onChange={handleChange}
                  className="input-style"
                  placeholder="VidalSigns Medical Center"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="state" className="text-sm font-medium">State</label>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ReactCountryFlag countryCode="US" svg style={{ marginRight: '5px', width: '16px', height: '12px' }} />
                    United States
                  </div>
                </div>
                <select
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input-style"
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
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setShowEmailHint(true)}
                  onBlur={() => {
                    if (formData.email === '') setShowEmailHint(false);
                  }}
                  className={`input-style ${formData.email && !isEmailValid ? 'border-red-500' : ''}`}
                  placeholder="m@example.com"
                />

                {showEmailHint && (
                  <div
                    className={`transition-all duration-300 transform text-sm mt-1 ${formData.email ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                  >
                    {!isEmailValid ? (
                      <p className="text-red-500">Please enter a valid email address.</p>
                    ) : (
                      <p className="text-green-600">Valid email format.</p>
                    )}

                    {showEmailHint && isEmailValid && (
                      <div className="text-sm mt-1">
                        {isCheckingEmail ? (
                          <p className="text-yellow-500">Checking email availability...</p>
                        ) : isEmailTaken ? (
                          <p className="text-red-500">Email is already taken.</p>
                        ) : (
                          <p className="text-green-600">Email is available.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordHint(true)}
                  onBlur={() => {
                    if (formData.password === '') setShowPasswordHint(false);
                  }}
                  className="input-style pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {showPasswordHint && (
                  <div className="text-sm mt-1 space-y-1 text-muted-foreground">
                    <p className={passwordStrength.length ? 'text-green-600' : 'text-red-500'}>
                      • At least 8 characters
                    </p>
                    <p className={passwordStrength.upper ? 'text-green-600' : 'text-red-500'}>
                      • Contains uppercase letter
                    </p>
                    <p className={passwordStrength.lower ? 'text-green-600' : 'text-red-500'}>
                      • Contains lowercase letter
                    </p>
                    <p className={passwordStrength.number ? 'text-green-600' : 'text-red-500'}>
                      • Contains number
                    </p>
                    <p className={passwordStrength.special ? 'text-green-600' : 'text-red-500'}>
                      • Contains special character
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="website_link" className="text-sm font-medium">Website (optional)</label>
                <input
                  id="website_link"
                  type="text"
                  value={formData.website_link}
                  onChange={handleChange}
                  className="input-style"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                onClick={handleSignup}
                disabled={!isTermsAccepted || isLoading}
                className={`w-full rounded-md h-10 px-4 font-medium shadow-sm transition-colors ${isTermsAccepted && !isLoading
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : isLoading
                      ? 'bg-primary/70 text-primary-foreground cursor-wait'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
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

      <AuthCarousel />
    </div>
  );
}