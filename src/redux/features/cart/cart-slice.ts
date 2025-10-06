import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  shippingAddress: string;
  phoneNumber: string;
  items: CartItem[];
  totalAmount: number;
  orderDate: string; // ISO string
}

interface CartState {
  items: CartItem[];
  orders: Order[];
}

const initialState: CartState = {
  items: [],
  orders: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },

    increment: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },

    decrement: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter((i) => i.id !== action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    placeOrder: (
      state,
      action: PayloadAction<Omit<Order, "id" | "orderDate">>
    ) => {
      const newOrder: Order = {
        ...action.payload,
        id: Date.now().toString(),
        orderDate: new Date().toISOString(),
      };
      state.orders.push(newOrder);
      state.items = []; // Clear cart after placing order
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  placeOrder,
  increment,
  decrement,
} = cartSlice.actions;
export default cartSlice.reducer;
