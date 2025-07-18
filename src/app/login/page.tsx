
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { isAdminUser } from '@/app/actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      
      if (data.user) {
        // After successful sign-in, check if the user is a designated admin
        const isAdmin = await isAdminUser();

        if (isAdmin) {
          // User is an admin, redirect to the main page.
          router.push('/');
          router.refresh();
        } else {
          // This is a valid Supabase user, but not an admin. Sign them out.
          await supabase.auth.signOut();
          setError('Login successful, but this account does not have administrative privileges.');
        }
      } else {
        setError('Login failed. Could not retrieve user data after sign-in.');
      }
    } catch (e: any) {
      console.error(e);
      setError("An unexpected error occurred. Please ensure your Supabase connection is configured and try again.");
    }

    setLoading(false);
  };
  
  if (!isSupabaseConfigured) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-md bg-[#1C1C1C] text-white border-gray-700/50">
                <CardHeader>
                    <CardTitle className="text-2xl">Configuration Error</CardTitle>
                    <CardDescription>Supabase is not configured correctly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Action Required: Missing Environment Variables</AlertTitle>
                        <AlertDescription>
                            <p className="font-bold">Your application cannot connect to Supabase.</p>
                            <p className="mt-2">This is almost always because the environment variables are not loaded.</p>
                            <ol className="list-decimal list-inside mt-4 space-y-2">
                                <li>Find or create a file named <strong>.env.local</strong> in your project's root directory.</li>
                                <li>Add your Supabase URL and Key to this file.</li>
                                <li className="font-bold text-lg">You must restart the development server for this change to take effect.</li>
                            </ol>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-sm bg-[#1C1C1C] text-white border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your admin credentials to manage events.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/30 border-gray-600 focus:ring-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/30 border-gray-600 focus:ring-white"
              />
            </div>
            <div className="flex flex-col space-y-2 pt-2">
                 <Button type="submit" className="w-full bg-white text-black hover:bg-gray-300" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
               <Button asChild variant="link" className="w-full text-gray-400 hover:text-white hover:no-underline">
                   <Link href="/" className="hover:no-underline">Back to Calendar</Link>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
