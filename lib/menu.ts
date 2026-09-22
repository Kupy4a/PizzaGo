import type { Banner, Category, Product } from '@/types';
import type { Locale } from '@/lib/i18n/config';

// Static catalog used when Supabase is not configured.
// The order API re-reads prices from here, so the client can't change them.

type Text = Record<Locale, string>;

interface CatalogProduct extends Omit<Product, 'name' | 'description'> {
  name: Text;
  description: Text;
}

const unsplash = (id: string, w = 500, h = 500) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;

const catalogCategories: (Omit<Category, 'name'> & { name: Text })[] = [
  { id: '1', slug: 'pizza', name: { en: 'Pizza', ru: 'Пицца' } },
  { id: '2', slug: 'desserts', name: { en: 'Desserts', ru: 'Десерты' } },
  { id: '3', slug: 'drinks', name: { en: 'Drinks', ru: 'Напитки' } },
];

const product = (
  id: string,
  categoryId: string,
  price: number,
  photo: string,
  name: Text,
  description: Text
): CatalogProduct => ({
  id,
  category_id: categoryId,
  price,
  image_url: unsplash(photo),
  is_available: true,
  name,
  description,
});

const catalogProducts: CatalogProduct[] = [
  product('p1', '1', 499, 'photo-1574071318508-1cdbab80d002',
    { en: 'Margherita', ru: 'Маргарита' },
    {
      en: 'Classic pizza with tomato sauce, mozzarella and fresh basil',
      ru: 'Классическая пицца с томатным соусом, моцареллой и свежим базиликом',
    }),
  product('p2', '1', 599, 'photo-1628840042765-356cda07504e',
    { en: 'Pepperoni', ru: 'Пепперони' },
    {
      en: 'Spicy pepperoni, mozzarella, tomato sauce and oregano',
      ru: 'Острая пепперони, моцарелла, томатный соус и орегано',
    }),
  product('p3', '1', 699, 'photo-1513104890138-7c749659a591',
    { en: 'Four Cheese', ru: 'Четыре сыра' },
    {
      en: 'Mozzarella, gorgonzola, parmesan and emmental on a cream base',
      ru: 'Моцарелла, горгонзола, пармезан и эмменталь на сливочном соусе',
    }),
  product('p4', '1', 549, 'photo-1565299624946-b28f40a0ae38',
    { en: 'Hawaiian', ru: 'Гавайская' },
    {
      en: 'Ham, pineapple, mozzarella and tomato sauce',
      ru: 'Ветчина, ананас, моцарелла и томатный соус',
    }),
  product('d1', '2', 349, 'photo-1571877227200-a0d98ea607e9',
    { en: 'Tiramisu', ru: 'Тирамису' },
    {
      en: 'Classic Italian dessert with mascarpone and coffee',
      ru: 'Классический итальянский десерт с маскарпоне и кофе',
    }),
  product('d2', '2', 399, 'photo-1533134242443-d4fd215305ad',
    { en: 'Cheesecake', ru: 'Чизкейк' },
    {
      en: 'New York cheesecake with berry sauce',
      ru: 'Нью-йоркский чизкейк с ягодным соусом',
    }),
  product('d3', '2', 299, 'photo-1551024601-bec78aea704b',
    { en: 'Napoleon', ru: 'Наполеон' },
    {
      en: 'Layered puff pastry cake with custard',
      ru: 'Слоёный торт с заварным кремом',
    }),
  product('dr1', '3', 149, 'photo-1554866585-cd94860890b7',
    { en: 'Cola', ru: 'Кола' },
    { en: 'Classic cola, 0.5 L', ru: 'Классическая кола 0,5 л' }),
  product('dr2', '3', 199, 'photo-1621263764928-df1444c5e859',
    { en: 'Lemonade', ru: 'Лимонад' },
    { en: 'Homemade mint lemonade, 0.5 L', ru: 'Домашний лимонад с мятой 0,5 л' }),
  product('dr3', '3', 179, 'photo-1600271886742-f049cd451bba',
    { en: 'Cranberry Mors', ru: 'Морс' },
    { en: 'Cranberry berry drink, 0.5 L', ru: 'Клюквенный морс 0,5 л' }),
];

const catalogBanners: (Omit<Banner, 'title' | 'subtitle'> & { title: Text; subtitle: Text })[] = [
  {
    id: '1',
    title: { en: 'Fresh pizza', ru: 'Свежая пицца' },
    subtitle: { en: 'Delivered in 30 minutes', ru: 'С доставкой за 30 минут' },
    image_url: unsplash('photo-1565299624946-b28f40a0ae38', 1600, 800),
    link_url: '#menu',
  },
  {
    id: '2',
    title: { en: '20% off', ru: 'Скидка 20%' },
    subtitle: { en: 'On your first order', ru: 'На первый заказ' },
    image_url: unsplash('photo-1513104890138-7c749659a591', 1600, 800),
    link_url: '#menu',
  },
  {
    id: '3',
    title: { en: 'New desserts', ru: 'Новые десерты' },
    subtitle: { en: 'Try our latest treats', ru: 'Попробуйте наши новинки' },
    image_url: unsplash('photo-1551024601-bec78aea704b', 1600, 800),
    link_url: '#menu',
  },
];

export interface Menu {
  categories: Category[];
  products: Product[];
  banners: Banner[];
  productById: Map<string, Product>;
}

const menuCache = new Map<Locale, Menu>();

export function getMenu(locale: Locale): Menu {
  const cached = menuCache.get(locale);
  if (cached) return cached;

  const products = catalogProducts.map((p) => ({
    ...p,
    name: p.name[locale],
    description: p.description[locale],
  }));
  const menu: Menu = {
    categories: catalogCategories.map((c) => ({ ...c, name: c.name[locale] })),
    products,
    banners: catalogBanners.map((b) => ({
      ...b,
      title: b.title[locale],
      subtitle: b.subtitle[locale],
    })),
    productById: new Map(products.map((p) => [p.id, p])),
  };
  menuCache.set(locale, menu);
  return menu;
}

export function findProduct(id: string): CatalogProduct | undefined {
  return catalogProducts.find((p) => p.id === id);
}
