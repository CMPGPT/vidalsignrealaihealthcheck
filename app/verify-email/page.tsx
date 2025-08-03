'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import Swal from 'sweetalert2';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(data.message);
          
          // Show success SweetAlert
          Swal.fire({
            title: 'Email Verified Successfully! 🎉',
            html: `
              <div style="text-align: center;">
                <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <CheckCircle style="color: #22c55e; font-size: 40px;" />
                </div>
                <h3 style="color: #166534; margin-bottom: 15px;">Account Verified!</h3>
                <p style="color: #166534; font-size: 16px; line-height: 1.5;">
                  Your VidalSigns account has been successfully verified. You can now log in and access all features.
                </p>
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#667eea',
            allowOutsideClick: false,
          }).then(() => {
            router.push('/login');
          });
        } else {
          setVerificationStatus('error');
          setMessage(data.error || 'Verification failed');
          
          // Show error SweetAlert
          Swal.fire({
            title: 'Verification Failed',
            html: `
              <div style="text-align: center;">
                <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <XCircle style="color: #ef4444; font-size: 40px;" />
                </div>
                <h3 style="color: #991b1b; margin-bottom: 15px;">Verification Failed</h3>
                <p style="color: #991b1b; font-size: 16px; line-height: 1.5;">
                  ${data.error || 'The verification link is invalid or has expired.'}
                </p>
                <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 15px;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">
                    <strong>Need help?</strong><br>
                    Contact support at textgpt.team@gmail.com
                  </p>
                </div>
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#667eea',
            allowOutsideClick: false,
          }).then(() => {
            router.push('/login');
          });
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('An error occurred during verification');
        
        Swal.fire({
          title: 'Verification Error',
          text: 'An error occurred during verification. Please try again or contact support.',
          icon: 'error',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: '#667eea',
        }).then(() => {
          router.push('/login');
        });
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mb-6">
              <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
                VidalSigns
              </Link>
            </div>

            {verificationStatus === 'loading' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Verifying Your Email</h2>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
                <p className="text-gray-600">{message}</p>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
                <p className="text-gray-600">{message}</p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Go to Login
              </Link>
              
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Back to Home
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:textgpt.team@gmail.com" className="text-primary hover:underline">
                  textgpt.team@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mb-6">
              <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
                VidalSigns
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
              <p className="text-gray-600">Please wait while we load the verification page...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
} 