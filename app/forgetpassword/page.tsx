'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Check, Mail, KeyRound, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import isEmail from 'validator/lib/isEmail';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // 'email' or 'verification' or 'newPassword'
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validate email
    if (!email || !isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call like:
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      setSuccess('Verification code has been sent to your email.');
      setStep('verification');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code inputs
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;
    
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);
    
    // Auto focus to next input if value is entered
    if (value && index < 7) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Check if code is complete
    const code = verificationCode.join('');
    if (code.length !== 8) {
      setError('Please enter the complete 8-digit verification code.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call like:
      // const response = await fetch('/api/verify-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      setSuccess('Code verified successfully. Please set your new password.');
      setStep('newPassword');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call like:
      // const response = await fetch('/api/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code: verificationCode.join(''), password }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-8">
        <Link href="/" className="inline-block text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          VidalSigns
        </Link>
      </div>
      
      <Link href="/login" className="absolute top-6 right-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4 inline mr-1" />
        Back to login
      </Link>
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-md">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            We'll guide you through the process to reset your password.
          </p>
        </div>
        
        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="email" 
              disabled={true}
              className={step === 'email' ? 'bg-primary text-primary-foreground' : ''}
            >
              Email
            </TabsTrigger>
            <TabsTrigger 
              value="verification" 
              disabled={true}
              className={step === 'verification' ? 'bg-primary text-primary-foreground' : ''}
            >
              Verify
            </TabsTrigger>
            <TabsTrigger 
              value="newPassword" 
              disabled={true}
              className={step === 'newPassword' ? 'bg-primary text-primary-foreground' : ''}
            >
              New Password
            </TabsTrigger>
          </TabsList>
          
          {/* Email Step */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Enter your email</CardTitle>
                <CardDescription>
                  We'll send a verification code to your email to reset your password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription className="text-green-800">
                        <Check className="h-4 w-4 inline mr-2" />
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Verification Step */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Enter verification code</CardTitle>
                <CardDescription>
                  Enter the 8-digit code we sent to {email}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerificationSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription className="text-green-800">
                        <Check className="h-4 w-4 inline mr-2" />
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <div className="flex justify-between">
                      {verificationCode.map((digit, index) => (
                        <Input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => {
                            // Handle backspace
                            if (e.key === 'Backspace' && !digit && index > 0) {
                              const prevInput = document.getElementById(`code-${index - 1}`);
                              if (prevInput) {
                                prevInput.focus();
                              }
                            }
                          }}
                          className="w-10 h-12 text-center p-0"
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <button 
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setVerificationCode(['', '', '', '', '', '', '', '']);
                      }}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Change email address
                    </button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* New Password Step */}
          <TabsContent value="newPassword">
            <Card>
              <CardHeader>
                <CardTitle>Set new password</CardTitle>
                <CardDescription>
                  Create a new password for your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordReset}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription className="text-green-800">
                        <Check className="h-4 w-4 inline mr-2" />
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}