'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace('/');
        router.refresh();
      }}
    >
      <LogOut className="w-4 h-4 mr-2" aria-hidden />
      {t.auth.signOut}
    </Button>
  );
}
