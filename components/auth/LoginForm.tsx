'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';

type Mode = 'signIn' | 'signUp';

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    if (mode === 'signIn') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ kind: 'error', text: t.auth.failed });
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setMessage({ kind: 'error', text: t.auth.signUpFailed });
        setLoading(false);
        return;
      }
      // With email confirmation enabled there is no session until the link is opened.
      if (!data.session) {
        setMessage({ kind: 'info', text: t.auth.checkEmail });
        setMode('signIn');
        setLoading(false);
        return;
      }
    }

    router.replace('/account');
    router.refresh();
  };

  const signIn = mode === 'signIn';

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-secondary mb-8 text-center">
        {signIn ? t.auth.signInTitle : t.auth.signUpTitle}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" type="password" required minLength={6}
            autoComplete={signIn ? 'current-password' : 'new-password'}
            placeholder={signIn ? undefined : t.auth.passwordHint}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {message && (
          <p
            role={message.kind === 'error' ? 'alert' : 'status'}
            className={`rounded-xl px-4 py-3 text-sm ${
              message.kind === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message.text}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
          {signIn ? t.auth.signIn : t.auth.signUp}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(signIn ? 'signUp' : 'signIn');
          setMessage(null);
        }}
        className="block mx-auto mt-4 text-sm text-gray-600 hover:text-primary"
      >
        {signIn ? t.auth.toSignUp : t.auth.toSignIn}
      </button>
    </div>
  );
}
