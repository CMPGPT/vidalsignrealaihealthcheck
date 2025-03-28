'use client';

import { signOut as nextAuthSignOut } from "next-auth/react";

/**
 * Improved sign out function that properly clears all session data
 * @param callback Optional callback function to be executed after sign out
 */
export const signOutAndClearData = async (callback?: () => void): Promise<void> => {
  try {
    // 1. Clear browser storage
    if (typeof window !== 'undefined') {
      // Clear local and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any application-specific cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
    
    // 2. Use NextAuth signOut with redirect: false to properly handle on the client
    await nextAuthSignOut({ 
      redirect: false,
      callbackUrl: '/'
    });
    
    // 3. Allow some time for cookies to be processed before redirect
    setTimeout(() => {
      // 4. Force a hard page reload to clear React state and any in-memory data
      window.location.href = '/';
      
      // 5. Execute callback if provided
      if (callback) {
        callback();
      }
    }, 300);
  } catch (error) {
    console.error('Error during sign out:', error);
    // If there's an error during sign out, force redirect to homepage
    window.location.href = '/';
  }
};