'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/context';
import { deleteOrder } from '@/app/admin/actions';

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const { t } = useI18n();

  return (
    <form
      action={deleteOrder}
      onSubmit={(e) => {
        if (!window.confirm(t.admin.confirmDelete)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={orderId} />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="text-red-600 hover:bg-red-50"
        aria-label={t.admin.delete}
      >
        <Trash2 className="w-4 h-4 mr-1" aria-hidden />
        {t.admin.delete}
      </Button>
    </form>
  );
}
