// types.ts
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  quantity: number;
}

// types.ts

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customer: string;
  address: string;
  phone: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  date: string;
}
