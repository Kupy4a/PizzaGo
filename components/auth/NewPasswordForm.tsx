'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';

export function NewPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError(t.auth.resetFailed);
      setLoading(false);
      return;
    }

    router.replace('/account');
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-secondary mb-8 text-center">{t.auth.newPasswordTitle}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <Label htmlFor="password">{t.auth.newPassword}</Label>
          <Input id="password" type="password" required minLength={6} autoComplete="new-password"
            placeholder={t.auth.passwordHint}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
          {t.auth.savePassword}
        </Button>
      </form>
    </div>
  );
}
