'use client';

import { useSession } from 'next-auth/react';

export default function TestRedirectPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 Redirect Test Success!</h1>
        <p className="text-gray-700 mb-4">
          If you can see this page, the redirect is working!
        </p>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Session Info:</h3>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Email:</strong> {session?.user?.email || 'Not available'}</p>
          <p><strong>Name:</strong> {session?.user?.name || 'Not available'}</p>
        </div>
        <div className="mt-4">
          <a href="/partners" className="text-blue-600 hover:underline">
            Go to Partners Page →
          </a>
        </div>
      </div>
    </div>
  );
} 