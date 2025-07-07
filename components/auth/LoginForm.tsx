'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail, loginWithGoogle } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Loader2 } from 'lucide-react';
import GoogleGIcon from '@/components/ui/GoogleGIcon';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      router.push('/weekmenu');
    } catch (caught) {
      let message = 'Er ging iets mis';
      if (caught instanceof Error) {
        message = caught.message;
      } else if (
        typeof caught === 'object' &&
        caught !== null &&
        'message' in caught &&
        typeof (caught as { message?: unknown }).message === 'string'
      ) {
        message = (caught as { message: string }).message;
      }
      setError(message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push('/weekmenu');
    } catch {
      setError('Google login mislukt');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none bg-gradient-to-tr from-white via-[hsl(142,69%,58%)]/10 to-[hsl(210,100%,92%)] p-6">
        <CardHeader>
          <CardTitle className="text-[hsl(142,76%,36%)] text-2xl mb-1 font-bold tracking-tight">
            Inloggen
          </CardTitle>
          <p className="text-sm text-muted-foreground">Welkom terug bij Familie Recepten!</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin} autoComplete="on">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(210,100%,56%)] w-5 h-5 opacity-90 pointer-events-none" />
              <Input
                type="email"
                placeholder="E-mailadres"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 bg-white"
                aria-label="E-mailadres"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(142,76%,36%)] w-5 h-5 opacity-90 pointer-events-none" />
              <Input
                type="password"
                placeholder="Wachtwoord"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 bg-white"
                aria-label="Wachtwoord"
              />
            </div>
            {error && (
              <div className="text-destructive text-sm py-2" role="alert">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className={cn(
                'w-full font-bold py-2 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,84%,24%)] transition-colors',
                loading && 'opacity-80 cursor-not-allowed'
              )}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
              Inloggen
            </Button>
          </form>
          <Separator className="my-4" />
          {/* Hier komt de nieuwe Google button */}
          <Button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className={cn(
              'w-full flex items-center justify-center gap-3 rounded-xl py-2 px-4 bg-white border border-[hsl(210,100%,56%)] shadow-sm transition hover:shadow-md hover:bg-[hsl(210,100%,92%)]',
              loading && 'opacity-80 cursor-not-allowed'
            )}
          >
            <span className="bg-white rounded-full p-1 flex items-center justify-center border border-[hsl(210,100%,56%)]">
              <GoogleGIcon className="w-5 h-5" />
            </span>
            <span className="font-semibold text-sm text-[hsl(210,100%,56%)]">
              Inloggen met Google
            </span>
          </Button>
          <p className="mt-4 text-center text-sm">
            Nog geen account?{' '}
            <a
              href="/auth/register"
              className="text-[hsl(210,100%,56%)] font-medium underline underline-offset-2 hover:text-[hsl(142,76%,36%)]"
            >
              Registreren
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
