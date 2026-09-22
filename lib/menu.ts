import type { Banner, Category, Product } from '@/types';

// Static catalog used when Supabase is not configured.
// The order API re-reads prices from here, so the client can't change them.

const unsplash = (id: string, w = 500, h = 500) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;

export const categories: Category[] = [
  { id: '1', name: 'Пицца', slug: 'pizza', image_url: '' },
  { id: '2', name: 'Десерты', slug: 'desserts', image_url: '' },
  { id: '3', name: 'Напитки', slug: 'drinks', image_url: '' },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Маргарита',
    description: 'Классическая пицца с томатным соусом, моцареллой и свежим базиликом',
    price: 499,
    category_id: '1',
    image_url: unsplash('photo-1574071318508-1cdbab80d002'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'p2',
    name: 'Пепперони',
    description: 'Острая пепперони, моцарелла, томатный соус и орегано',
    price: 599,
    category_id: '1',
    image_url: unsplash('photo-1628840042765-356cda07504e'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'p3',
    name: 'Четыре сыра',
    description: 'Моцарелла, горгонзола, пармезан и эмменталь на сливочном соусе',
    price: 699,
    category_id: '1',
    image_url: unsplash('photo-1513104890138-7c749659a591'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'p4',
    name: 'Гавайская',
    description: 'Ветчина, ананас, моцарелла и томатный соус',
    price: 549,
    category_id: '1',
    image_url: unsplash('photo-1565299624946-b28f40a0ae38'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'd1',
    name: 'Тирамису',
    description: 'Классический итальянский десерт с маскарпоне и кофе',
    price: 349,
    category_id: '2',
    image_url: unsplash('photo-1571877227200-a0d98ea607e9'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'd2',
    name: 'Чизкейк',
    description: 'Нью-йоркский чизкейк с ягодным соусом',
    price: 399,
    category_id: '2',
    image_url: unsplash('photo-1533134242443-d4fd215305ad'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'd3',
    name: 'Наполеон',
    description: 'Слоёный торт с заварным кремом',
    price: 299,
    category_id: '2',
    image_url: unsplash('photo-1551024601-bec78aea704b'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'dr1',
    name: 'Кола',
    description: 'Классическая кола 0,5 л',
    price: 149,
    category_id: '3',
    image_url: unsplash('photo-1554866585-cd94860890b7'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'dr2',
    name: 'Лимонад',
    description: 'Домашний лимонад с мятой 0,5 л',
    price: 199,
    category_id: '3',
    image_url: unsplash('photo-1621263764928-df1444c5e859'),
    is_available: true,
    created_at: '',
  },
  {
    id: 'dr3',
    name: 'Морс',
    description: 'Клюквенный морс 0,5 л',
    price: 179,
    category_id: '3',
    image_url: unsplash('photo-1600271886742-f049cd451bba'),
    is_available: true,
    created_at: '',
  },
];

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Свежая пицца',
    subtitle: 'С доставкой за 30 минут',
    image_url: unsplash('photo-1565299624946-b28f40a0ae38', 1600, 800),
    link_url: '#menu',
    order: 1,
  },
  {
    id: '2',
    title: 'Скидка 20%',
    subtitle: 'На первый заказ',
    image_url: unsplash('photo-1513104890138-7c749659a591', 1600, 800),
    link_url: '#menu',
    order: 2,
  },
  {
    id: '3',
    title: 'Новые десерты',
    subtitle: 'Попробуйте наши новинки',
    image_url: unsplash('photo-1551024601-bec78aea704b', 1600, 800),
    link_url: '#menu',
    order: 3,
  },
];

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
