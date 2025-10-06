"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  decrement,
  increment,
  removeFromCart,
} from "@/redux/features/cart/cart-slice";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(open);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const closeOnEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", closeOnEsc);
    }
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, [isOpen, closeOnEsc]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 h-screen max-w-md w-full bg-white shadow-xl z-[1000] transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-[#f25b29]">
            Your Cart ({cartItems.length})
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-800 dark:text-[#f25b29]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 space-y-2">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800 dark:text-[#f25b29]">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground">
                Add items to get started.
              </p>
              <Link
                href="/products"
                className="mt-6 bg-green-600 text-white px-3 py-2 rounded shadow inline-block"
              >
                Go to Products
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border p-3 rounded-md shadow-sm bg-white"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="rounded-md object-cover border"
                />
                <div className="flex-1">
                  <h2 className="text-base text-gray-800 dark:text-[#f25b29] font-semibold line-clamp-1">
                    {item.title}
                  </h2>
                  <div className="flex items-center mt-2 gap-2 text-gray-800 dark:text-[#f25b29]">
                    <Button
                      size="sm"
                      onClick={() => dispatch(decrement(item.id))}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      size="sm"
                      onClick={() => dispatch(increment(item.id))}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground  dark:text-[#f25b29]">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                  <Button
                    className="bg-red-500 text-white mt-2"
                    variant="destructive"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Remove
                  </Button>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  $
                  {(item.price * item.quantity).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-white sticky bottom-0 z-10">
            <div className="flex justify-end text-gray-800 dark:text-[#f25b29] gap-4 text-lg font-semibold mb-4">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="cursor-pointer">
              <Button className="bg-green-600 text-white w-full" size="lg"  onClick={onClose} >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
