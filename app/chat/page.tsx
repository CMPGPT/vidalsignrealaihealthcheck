'use client';

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Clear any local storage data if needed
      localStorage.removeItem('user-session');
      sessionStorage.clear();
      
      // Use signOut with specific options to ensure cookies are cleared
      await signOut({ 
        redirect: false,
        callbackUrl: '/'
      });
      
      // Use a small delay to ensure cookies are processed
      setTimeout(() => {
        // Force a hard redirect to clear any remaining state
        window.location.href = '/';
      }, 300);
      
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="p-8 text-center">Not signed in. Please <a href="/login" className="text-blue-600 hover:underline">sign in</a>.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Authentication Data:</h2>
        <div className="bg-gray-50 p-4 rounded border">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <strong>Name:</strong> {session?.user?.name || 'Not available'}
        </div>
        <div>
          <strong>Email:</strong> {session?.user?.email || 'Not available'}
        </div>
        {session?.user?.id && (
          <div>
            <strong>User ID:</strong> {session.user.id}
          </div>
        )}
        {session?.user?.role && (
          <div>
            <strong>Role:</strong> {session.user.role}
          </div>
        )}
        {session?.user?.organization && (
          <div>
            <strong>Organization:</strong> {session.user.organization}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSigningOut ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing Out...
            </span>
          ) : (
            'Sign Out'
          )}
        </button>
      </div>
    </div>
  );
}