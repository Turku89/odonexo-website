"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";
import { useCart } from "@/lib/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShoppingCart, Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center rounded-lg border border-neutral-border">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-4 py-3 text-brand hover:bg-brand-muted transition-colors"
          aria-label="-"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-semibold text-slate-800">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-4 py-3 text-brand hover:bg-brand-muted transition-colors"
          aria-label="+"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={!product.inStock}
        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="h-5 w-5" />
        {added ? t.products.addedToCart : t.products.addToCart}
      </button>
    </div>
  );
}
