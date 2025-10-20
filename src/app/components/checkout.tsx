"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  clearCart,
  decrement,
  increment,
  removeFromCart,
} from "@/redux/features/cart/cart-slice";
import { addOrder } from "@/redux/features/cart/orderSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import Head from "next/head";

// CartItem type
export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

// Order type
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

// Form validation schema
const schema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutList() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = (data: FormData) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      customer: data.fullName,
      address: data.address,
      phone: data.phone,
      items: cartItems,
      totalItems: cartItems.length,
      totalAmount: total,
      date: new Date().toISOString(),
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());
    toast.success("✅ Order placed successfully!");
    router.push("/thank-you");
  };

  const handleRemove = (id: number) => {
    dispatch(removeFromCart(id));
  };
  <Head>
    <title>Checkout | কুইজ প্রতিযোগিতা</title>
    <meta
      name="description"
      content="Secure checkout page for কুইজ প্রতিযোগিতা. Review your cart and complete your purchase with confidence."
    />
  </Head>;
  return (
    <>
      <Head>
        <title>Checkout | কুইজ প্রতিযোগিতা</title>
        <meta
          name="description"
          content="Secure checkout for কুইজ প্রতিযোগিতা."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: "Checkout",
              description: "Checkout page for কুইজ প্রতিযোগিতা.",
              url: "https://yourecommercesite.com/checkout",
            }),
          }}
        />
      </Head>
      <main className="min-h-screen bg-slate-50  sm:p-6 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto p-5 sm:py-8">
          <h1 className="text-3xl font-bold text-start mb-8 text-gray-800">
            <ShoppingCart className="inline mr-2 text-indigo-600" />
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cart Section */}
            <div className="bg-white rounded shadow  space-y-4 p-4">
              <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">
                Cart
              </h2>
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  Your cart is empty.
                </p>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border rounded-lg p-4 bg-white hover:shadow-sm transition"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={100}
                        height={50}
                        className="rounded-md sm:object-cover object-fit w-10 h-10 sm:w-24 sm:h-34"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="flex flex-col gap-1">
                            <p className="font-semibold text-base text-gray-800 line-clamp-2 dark:text-[#f25b29]">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Price: ${item.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => dispatch(decrement(item.id))}
                              >
                                −
                              </Button>
                              <span className="text-base font-medium text-gray-800 dark:text-[#f25b29]">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => dispatch(increment(item.id))}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-indigo-600 dark:text-[#f25b29]">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(item.id)}
                            className="w-fit border-red-500 border-[0.1px] text-red-500 text-sm font-normal"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-gray-800 dark:text-[#f25b29] text-lg font-semibold pt-3 border-t">
                    Total:{" "}
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Form Section */}
            <div className="bg-white rounded shadow p-4 space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2 text-blue-700">
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <Input
                    placeholder="Full Name"
                    {...register("fullName")}
                    className="rounded-md border-gray-300 focus:outline-none focus:ring-0 focus:ring-indigo-300 transition-all"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Shipping Address"
                    {...register("address")}
                    className="rounded-md border-gray-300 focus:outline-none focus:ring-0 focus:ring-indigo-300 transition-all"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Phone Number"
                    {...register("phone")}
                    className="rounded-md border-gray-300 focus:outline-none focus:ring-0 focus:ring-indigo-300 transition-all"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base rounded-lg py-4 transition-all"
                  disabled={cartItems.length === 0}
                >
                  {cartItems.length > 0 ? "Place Order" : "Cart is Empty"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
