'use client';

import { useState, FormEvent } from 'react';
import { sendPasswordReset } from '../../lib/firebase'; // <-- Firebase functie, even zelf aanmaken/exporteren
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordReset(email);
      setSuccess('Check je inbox voor het reset-linkje.');
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

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none bg-gradient-to-tr from-white via-[hsl(142,69%,58%)]/10 to-[hsl(210,100%,92%)] p-6">
        <CardHeader>
          <CardTitle className="text-[hsl(142,76%,36%)] text-2xl mb-1 font-bold tracking-tight">
            Wachtwoord vergeten
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Vul je e-mailadres in, dan sturen we een reset-link.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleReset}>
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
            {error && (
              <div className="text-destructive text-sm py-2" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-sm py-2" role="status">
                {success}
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
              Verstuur reset-link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
