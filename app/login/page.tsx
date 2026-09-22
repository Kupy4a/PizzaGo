import { redirect } from 'next/navigation';
import { Notice } from '@/components/ui/Notice';
import { LoginForm } from '@/components/auth/LoginForm';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/server';

export default async function LoginPage() {
  if (!isSupabaseConfigured) {
    const t = getDictionary(await getLocale());
    return <Notice>{t.auth.notConfigured}</Notice>;
  }

  const { user } = await getCurrentUser();
  if (user) redirect('/account');

  return <LoginForm />;
}
