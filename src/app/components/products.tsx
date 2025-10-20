// components/ProductCard.tsx
import type { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./addToCard";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white border-[#1d1c1c2a] border-[0.2px] rounded-xl  w-full max-w-7xl shadow-md overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1">
      <div className="p-4 ">
        <div className="relative h-48 w-full mb-4">
          <Image
            src={product?.image}
            alt={product?.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
        <h3 className="font-semibold dark:text-[#f25b29] text-gray-800 text-lg mb-1 line-clamp-2">
          {product?.title}
        </h3>
        <p className="text-gray-600 dark:text-[#f25b29] font-medium mb-4">
          ${product?.price}
        </p>
      </div>
      <div className="flex justify-between gap-2 border-t border-[#f25b29] border-[0.5px p-4 bg-gray-50">
        <Link href={`/products/${product?.id}`}>
          <Button
            variant="secondary"
            className="flex-1 text-[#f25b29] border-[#f25b29] border-[0.5px]"
          >
            View Details
          </Button>
        </Link>

        <AddToCartButton product={product} />
      </div>
    </div>
  );
}
