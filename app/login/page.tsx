'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCarousel from '@/components/auth/AuthCarousel';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';
import { Poppins, Raleway } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    console.log('🔍 LOGIN DEBUG: ========== Form Submit Event ==========');
    console.log('🔍 LOGIN DEBUG: Event type:', e.type);
    console.log('🔍 LOGIN DEBUG: Preventing default...');
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 LOGIN DEBUG: Default prevented, starting login process');
    
    if (loading) {
      console.log('⚠️ LOGIN DEBUG: Already loading, ignoring submission');
      return;
    }

    // Validate inputs
    if (!email.trim()) {
      console.log('❌ LOGIN DEBUG: Email is empty');
      setError('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      console.log('❌ LOGIN DEBUG: Password is empty');
      setError('Please enter your password');
      return;
    }

    console.log('✅ LOGIN DEBUG: Validation passed');
    setLoading(true);
    setError('');

    try {
      console.log('🔍 LOGIN DEBUG: Email:', email);
      console.log('🔍 LOGIN DEBUG: Password length:', password.length);
      console.log('🔍 LOGIN DEBUG: Password first 3 chars:', password.substring(0, 3) + '...');

      console.log('🔍 LOGIN DEBUG: Calling signIn...');
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('🔍 LOGIN DEBUG: SignIn completed');
      console.log('🔍 LOGIN DEBUG: Result.ok:', result?.ok);
      console.log('🔍 LOGIN DEBUG: Result.error:', result?.error);
      console.log('🔍 LOGIN DEBUG: Result.status:', result?.status);

      if (result?.ok) {
        console.log('✅ LOGIN DEBUG: Login successful! Redirecting to /partners');
        
        // Show success message
        setError('Login successful! Redirecting...');
        
        // Force session update before redirect
        await getSession();
        setTimeout(() => {
          window.location.href = '/partners';
        }, 500);
      } else {
        console.log('❌ LOGIN DEBUG: Login failed');
        console.log('❌ LOGIN DEBUG: Error details:', result?.error);
        
        let errorMessage = 'Login failed. ';
        if (result?.error === 'CredentialsSignin') {
          errorMessage += 'Invalid email or password.';
        } else if (result?.error) {
          errorMessage += `Error: ${result.error}`;
        } else {
          errorMessage += 'Please check your credentials and try again.';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ LOGIN DEBUG: Exception during login:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log('🔍 LOGIN DEBUG: Setting loading to false');
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold">Log in to your account</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <form 
            onSubmit={handleLogin} 
            className="space-y-6 mt-8"
            noValidate
            onInvalid={(e) => {
              console.log('🔍 LOGIN DEBUG: Form invalid event:', e);
              e.preventDefault();
            }}
          >
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input-style"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link href="/forgetpassword" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-style pr-10"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[33px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                onClick={(e) => {
                  console.log('🔍 LOGIN DEBUG: Button clicked');
                  console.log('🔍 LOGIN DEBUG: Button type:', e.currentTarget.type);
                  // Don't prevent default here, let the form handle it
                }}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </div>

            <div className="relative my-6">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <span className="bg-background px-2 z-10">or continue with</span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => signIn('google')}
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
                  onClick={() => signIn('facebook')}
                  className="inline-flex items-center justify-center w-full h-10 px-4 border border-input rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 fill-white" viewBox="0 0 24 24">
                    <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 5 3.66 9.13 8.44 9.93v-7.03h-2.54v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.9h-2.3v7.03C18.34 21.2 22 17.07 22 12.07z" />
                  </svg>
                  Continue with Facebook
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
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

      <AuthCarousel />
    </div>
  );
}
