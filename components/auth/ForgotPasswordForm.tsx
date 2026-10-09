'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/password`,
    });
    // The same message either way, so the form can't be used to find out
    // which addresses are registered.
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-secondary mb-2 text-center">{t.auth.forgotTitle}</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">{t.auth.forgotHint}</p>

      {sent ? (
        <p role="status" className="rounded-xl bg-green-50 text-green-700 px-4 py-3 text-sm text-center">
          {t.auth.linkSent}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {t.auth.sendLink}
          </Button>
        </form>
      )}

      <Link href="/login" className="block text-center mt-4 text-sm text-gray-600 hover:text-primary">
        {t.auth.backToSignIn}
      </Link>
    </div>
  );
}
