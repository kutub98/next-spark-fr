import type { CartItem } from "@/types/product";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: CartItem[]; // ✅ FIXED HERE
  totalItems: number;
  totalAmount: number;
  date: string;
}

interface OrderState {
  orders: Order[];
}

const initialState: OrderState = {
  orders: [],
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.unshift(action.payload);
    },
  },
});

export const { addOrder } = orderSlice.actions;
export default orderSlice.reducer;
