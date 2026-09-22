'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { useCartStore, selectTotalPrice } from '@/lib/cart-store';
import { useHydrated } from '@/lib/use-hydrated';
import { formatPrice } from '@/lib/format';
import { PAYMENT_METHODS, type OrderRequest, type PaymentMethod } from '@/lib/order';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
  street: '',
  house: '',
  apartment: '',
  comment: '',
  payment: 'card' as PaymentMethod,
};

const sectionClass = 'bg-white rounded-xl p-6 shadow-sm';

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore(selectTotalPrice);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: OrderRequest = {
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      customer: { name: form.name, phone: form.phone, email: form.email },
      address: {
        city: form.city,
        street: form.street,
        house: form.house,
        apartment: form.apartment,
        comment: form.comment,
      },
      payment: form.payment,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка при оформлении заказа');

      router.push(`/success?id=${encodeURIComponent(data.id)}`);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при оформлении заказа');
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Загрузка" />
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden />
        <h1 className="text-2xl font-bold text-secondary mb-2">Корзина пуста</h1>
        <p className="text-gray-500 mb-8">Добавьте что-нибудь из меню, чтобы оформить заказ.</p>
        <Link href="/#menu" className={buttonVariants({ size: 'lg' })}>
          Перейти в меню
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Назад в меню
      </Link>
      <h1 className="text-3xl font-bold text-secondary mb-8">Оформление заказа</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <fieldset className={sectionClass}>
            <legend className="sr-only">Контактные данные</legend>
            <h2 className="text-lg font-semibold text-secondary mb-4">Контактные данные</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Имя *</Label>
                <Input id="name" name="name" required autoComplete="name" placeholder="Ваше имя"
                  value={form.name} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input id="phone" name="phone" type="tel" required autoComplete="tel"
                    minLength={10} maxLength={20} placeholder="+7 (999) 123-45-67"
                    value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email"
                    placeholder="you@example.com" value={form.email} onChange={handleChange} />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className={sectionClass}>
            <legend className="sr-only">Адрес доставки</legend>
            <h2 className="text-lg font-semibold text-secondary mb-4">Адрес доставки</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Город *</Label>
                  <Input id="city" name="city" required autoComplete="address-level2"
                    value={form.city} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="street">Улица *</Label>
                  <Input id="street" name="street" required autoComplete="address-line1"
                    value={form.street} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="house">Дом *</Label>
                  <Input id="house" name="house" required value={form.house} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="apartment">Квартира</Label>
                  <Input id="apartment" name="apartment" value={form.apartment} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Комментарий курьеру</Label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow bg-white text-secondary placeholder-gray-400 resize-none"
                  placeholder="Код домофона, этаж и т. п."
                  value={form.comment}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={sectionClass}>
            <legend className="sr-only">Способ оплаты</legend>
            <h2 className="text-lg font-semibold text-secondary mb-4">Способ оплаты</h2>
            <div className="space-y-3">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    form.payment === method ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={form.payment === method}
                    onChange={handleChange}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-secondary">{PAYMENT_METHODS[method]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden />
                Оформляем...
              </>
            ) : (
              `Оформить заказ на ${formatPrice(totalPrice)}`
            )}
          </Button>
        </form>

        <aside className="lg:col-span-2">
          <div className={`${sectionClass} lg:sticky lg:top-24`}>
            <h2 className="text-lg font-semibold text-secondary mb-4">Ваш заказ</h2>
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-secondary whitespace-nowrap">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 flex justify-between items-baseline">
              <span className="font-semibold text-secondary">Итого:</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
