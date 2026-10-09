import { redirect } from 'next/navigation';
import { Notice } from '@/components/ui/Notice';
import { NewPasswordForm } from '@/components/auth/NewPasswordForm';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/server';

// Reached from the recovery email, which signs the visitor in first.
export default async function NewPasswordPage() {
  if (!isSupabaseConfigured) {
    return <Notice>{getDictionary(await getLocale()).auth.notConfigured}</Notice>;
  }

  const { user } = await getCurrentUser();
  if (!user) redirect('/login');

  return <NewPasswordForm />;
}
