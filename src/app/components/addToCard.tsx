// components/add-to-cart-button.tsx
"use client";

import { Product } from "@/types/product";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/features/cart/cart-slice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ product }: { product: Product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success("Product added to cart!");
  };

  return (
    <Button
      onClick={handleAddToCart}
      className=" bg-[#f25b29] text-white px-4 py-2 rounded"
    >
      Add to Cart
    </Button>
  );
}
