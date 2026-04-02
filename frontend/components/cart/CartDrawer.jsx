"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HiXMark, HiMinus, HiPlus, HiTrash } from "react-icons/hi2";

import { slideInRight } from "@/animations/slideIn";
import useCart from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, total } = useCart();

  const subtotal = total;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-full flex-col bg-white sm:max-w-md"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-display text-lg font-bold text-primary">Your Cart</h2>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-neutral-100"
                aria-label="Close cart"
                onClick={onClose}
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {items.length === 0 ? (
                <p className="text-sm text-neutral-800">Your cart is empty</p>
              ) : (
                <ul className="grid gap-4">
                  {items.map((item, idx) => (
                    <li key={`${item.product}-${item.size}-${item.color}-${idx}`} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                        {item.image ? (
                          <OptimizedImage src={item.image} alt={item.title || ""} width={64} height={64} className="object-cover" sizes="64px" />
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-primary">{item.title}</p>
                            <p className="mt-0.5 text-xs text-neutral-800">
                              {item.size ? `Size: ${item.size}` : null}
                              {item.size && item.color ? " • " : null}
                              {item.color ? `Color: ${item.color}` : null}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="rounded-md p-2 text-neutral-800 hover:bg-neutral-100"
                            aria-label="Remove item"
                            onClick={() => removeItem(item.product, item.size, item.color)}
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-md border">
                            <button
                              type="button"
                              className="p-2 hover:bg-neutral-100 disabled:opacity-40"
                              aria-label="Decrease quantity"
                              disabled={Number(item.quantity || 1) <= 1}
                              onClick={() =>
                                updateQuantity(item.product, item.size, item.color, Number(item.quantity || 1) - 1)
                              }
                            >
                              <HiMinus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 select-none text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              className="p-2 hover:bg-neutral-100"
                              aria-label="Increase quantity"
                              onClick={() =>
                                updateQuantity(item.product, item.size, item.color, Number(item.quantity || 1) + 1)
                              }
                            >
                              <HiPlus className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="text-sm font-semibold text-primary">
                            ৳{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-800">Subtotal</span>
                <span className="font-semibold text-primary">৳{Number(subtotal || 0).toFixed(0)}</span>
              </div>

              <Link href="/cart" className="mt-2 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline" onClick={onClose}>
                View full cart
              </Link>
              <Link href="/checkout" className="mt-3 block" onClick={onClose}>
                <Button className="w-full bg-accent hover:bg-accent-hover">Proceed to Checkout</Button>
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
