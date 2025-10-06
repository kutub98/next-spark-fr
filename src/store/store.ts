import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/redux/features/cart/cart-slice";
import orderReducer from "@/redux/features/cart/orderSlice";
import authReducer from "@/redux/features/auth/authSlice";
import eventReducer from "@/redux/features/eventSlice";
import quizReducer from "@/redux/features/quizSlice";
import questionReducer from "@/redux/features/questionSlice";
import participationReducer from "@/redux/features/participationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    events: eventReducer,
    quizzes: quizReducer,
    questions: questionReducer,
    participations: participationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
