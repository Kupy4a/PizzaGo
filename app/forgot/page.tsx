import { Notice } from '@/components/ui/Notice';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export default async function ForgotPasswordPage() {
  if (!isSupabaseConfigured) {
    return <Notice>{getDictionary(await getLocale()).auth.notConfigured}</Notice>;
  }
  return <ForgotPasswordForm />;
}
