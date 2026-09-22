import { expect, test } from '@playwright/test';

test('English is the default language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Our menu' })).toBeVisible();
});

test('cart keeps items across reloads and follows the language', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Pepperoni/ }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: /Tiramisu/ }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await page.getByRole('button', { name: 'Cart, 2 items' }).click();
  await page.getByRole('button', { name: 'Increase quantity: Pepperoni' }).click();
  const drawer = page.getByRole('dialog', { name: 'Your order' });
  await expect(drawer).toContainText('₽1,547');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'ru' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.reload();
  await page.getByRole('button', { name: 'Корзина, товаров: 3' }).click();
  await expect(page.getByRole('dialog', { name: 'Ваш заказ' })).toContainText('Пепперони');
});

test('checkout places an order', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Margherita/ }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('/checkout');

  await page.getByLabel('Name *').fill('John');
  await page.getByLabel('Phone *').fill('+1 555 123 4567');
  await page.getByLabel('Email *').fill('john@example.com');
  await page.getByLabel('City *').fill('New York');
  await page.getByLabel('Street *').fill('Broadway');
  await page.getByLabel('House *').fill('1');
  await page.getByRole('button', { name: /Place order/ }).click();

  await expect(page).toHaveURL(/\/success\?id=/);
  await expect(page.getByRole('heading', { name: 'Order placed!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cart' })).toBeVisible();
});

test('server errors are shown in the current language', async ({ page }) => {
  await page.route('**/api/orders', (route) =>
    route.fulfill({ status: 400, contentType: 'application/json', body: '{"error":"invalid_phone"}' })
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Cola/ }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('/checkout');
  for (const [label, value] of [
    ['Name *', 'John'],
    ['Phone *', '+1 555 123 4567'],
    ['Email *', 'john@example.com'],
    ['City *', 'NY'],
    ['Street *', 'Broadway'],
    ['House *', '1'],
  ]) {
    await page.getByLabel(label).fill(value);
  }
  await page.getByRole('button', { name: /Place order/ }).click();
  await expect(page.locator('p[role=alert]')).toHaveText('Invalid phone number');
});
