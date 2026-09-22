import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getMenu } from '@/lib/menu';
import { formatPrice } from '@/lib/format';
import { shortOrderId, type OrderRow } from '@/lib/orders';

const statusStyles: Record<OrderRow['status'], string> = {
  pending: 'bg-orange-100 text-orange-700',
  processing: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

interface OrderCardProps {
  order: OrderRow;
  locale: Locale;
  showCustomer?: boolean;
  children?: React.ReactNode;
}

export function OrderCard({ order, locale, showCustomer = false, children }: OrderCardProps) {
  const t = getDictionary(locale);
  const { productById } = getMenu(locale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(order.created_at)
  );
  const { address } = order;

  return (
    <article className="bg-white rounded-xl p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-semibold text-secondary">
            {t.account.order} <span className="font-mono">{shortOrderId(order.id)}</span>
          </h2>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[order.status]}`}>
          {t.status[order.status]}
        </span>
      </header>

      {showCustomer && (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
          <div>
            <dt className="text-gray-500">{t.admin.customer}</dt>
            <dd className="text-secondary">
              {order.customer.name}, {order.customer.phone}, {order.customer.email}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">{t.admin.address}</dt>
            <dd className="text-secondary">
              {[address.city, address.street, address.house, address.apartment].filter(Boolean).join(', ')}
              {address.comment && <span className="block text-gray-500">{address.comment}</span>}
            </dd>
          </div>
        </dl>
      )}

      <ul className="text-sm space-y-1 border-t pt-3">
        {order.order_items.map((item) => (
          <li key={item.product_id} className="flex justify-between gap-4">
            <span className="text-gray-600">
              {productById.get(item.product_id)?.name ?? item.product_id} × {item.quantity}
            </span>
            <span className="text-secondary">
              {formatPrice(item.price_at_purchase * item.quantity, locale)}
            </span>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t mt-3 pt-3">
        <span className="font-bold text-primary">{formatPrice(order.total_price, locale)}</span>
        {children}
      </footer>
    </article>
  );
}
