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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
        // After successful sign-in, check if the user is in the 'admins' table.
        const { data: adminRecord, error: adminError } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', data.user.id)
          .single();

        // PGRST116 means no rows were found, which is expected for non-admins.
        // We only care about other, actual errors.
        if (adminError && adminError.code !== 'PGRST116') {
            await supabase.auth.signOut();
            setError('An error occurred while verifying your permissions.');
        } else if (!adminRecord) {
            // This is a valid user, but not an admin. Sign them out immediately.
            await supabase.auth.signOut();
            setError('Access denied. Only administrators can log in.');
        } else {
            // User is an admin, proceed to the main page.
            router.push('/');
            router.refresh(); 
            setLoading(false);
            return;
        }
    } else {
        setError("Sign-in successful, but user data could not be retrieved.");
    }

    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
               <Button asChild variant="link" className="w-full text-gray-400">
                   <Link href="/">Back to Calendar</Link>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
