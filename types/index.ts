export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  order: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  address: Record<string, string>;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
