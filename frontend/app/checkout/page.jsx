"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import PageWrapper from "@/components/layout/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useCart from "@/hooks/useCart";
import { orderGrandTotal, shippingCharge } from "@/lib/orderTotals";
import api from "@/utils/axios";

const addressSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

function CheckoutContent() {
  const router = useRouter();
  const {
    items,
    total,
    couponCode,
    discountAmount,
    clearCart,
  } = useCart();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const seededRef = useRef(false);

  const { data: profile } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      city: "",
      district: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    if (!profile?.address?.length || seededRef.current) return;
    seededRef.current = true;
    const list = profile.address;
    const defaultIdx = list.findIndex((a) => a.isDefault);
    const idx = defaultIdx >= 0 ? defaultIdx : 0;
    setSelectedSaved(idx);
    const a = list[idx];
    reset({
      fullName: a.fullName || "",
      phone: a.phone || "",
      street: a.street || "",
      city: a.city || "",
      district: a.district || "",
      postalCode: a.postalCode || "",
    });
  }, [profile, reset]);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const subtotal = total;
  const shipping = shippingCharge(subtotal, discountAmount);
  const grandTotal = orderGrandTotal(subtotal, discountAmount, shipping);

  const applyAddress = (addr) => {
    reset({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      district: addr.district || "",
      postalCode: addr.postalCode || "",
    });
  };

  const selectSaved = (index) => {
    setSelectedSaved(index);
    if (profile?.address?.[index]) applyAddress(profile.address[index]);
  };

  const useNewAddress = () => {
    setSelectedSaved("new");
    reset({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      district: "",
      postalCode: "",
    });
  };

  const buildOrderItems = () =>
    items.map((item) => ({
      product: item.product,
      title: item.title,
      image: item.image,
      quantity: Number(item.quantity),
      price: Number(item.price),
      ...(item.size ? { size: item.size } : {}),
      ...(item.color ? { color: item.color } : {}),
    }));

  const onPlaceOrder = handleSubmit(async (shippingAddress) => {
    if (!paymentMethod) {
      toast.error("Choose a payment method");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        items: buildOrderItems(),
        shippingAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        discountAmount: discountAmount || 0,
        shippingCharge: shipping,
      };

      const { data: res } = await api.post("/orders", payload);
      const order = res?.data;
      if (!order?._id) {
        toast.error("Could not create order");
        return;
      }

      if (paymentMethod === "COD") {
        clearCart();
        router.push(`/orders/${order._id}?status=success`);
        return;
      }

      if (paymentMethod === "SSLCommerz") {
        const init = await api.post("/payment/init", { orderId: order._id });
        const gatewayUrl = init.data?.GatewayPageURL;
        if (gatewayUrl) {
          window.location.href = gatewayUrl;
        } else {
          toast.error("Payment gateway unavailable");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  });

  const goToPayment = handleSubmit(() => {
    setStep(2);
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold text-primary">Checkout</h1>
        <p className="mt-1 text-sm text-neutral-600">Complete shipping and payment.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-6">
            <div className="flex gap-4 text-sm font-medium text-neutral-500">
              <span className={step === 1 ? "text-primary" : ""}>1. Shipping</span>
              <span aria-hidden="true">/</span>
              <span className={step === 2 ? "text-primary" : ""}>2. Payment</span>
            </div>

            {step === 1 ? (
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-primary">Shipping address</h2>

                {profile?.address?.length ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-neutral-600">Saved addresses</p>
                    <ul className="grid gap-2">
                      {profile.address.map((addr, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => selectSaved(i)}
                            className={[
                              "w-full rounded-lg border px-4 py-3 text-left text-sm transition",
                              selectedSaved === i
                                ? "border-primary bg-neutral-50"
                                : "border-neutral-100 hover:border-neutral-200",
                            ].join(" ")}
                          >
                            <span className="font-medium text-primary">{addr.fullName}</span>
                            <span className="mt-1 block text-neutral-600">
                              {[addr.street, addr.city, addr.district, addr.postalCode].filter(Boolean).join(", ")}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={useNewAddress}
                      className={[
                        "w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition",
                        selectedSaved === "new"
                          ? "border-primary bg-neutral-50"
                          : "border-dashed border-neutral-200 text-primary hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      + Use a new address
                    </button>
                  </div>
                ) : null}

                <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <Input label="Full name" name="fullName" register={register} error={errors.fullName} />
                  <Input label="Phone" name="phone" type="tel" register={register} error={errors.phone} />
                  <Input label="Street" name="street" register={register} error={errors.street} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="City" name="city" register={register} error={errors.city} />
                    <Input label="District" name="district" register={register} error={errors.district} />
                  </div>
                  <Input label="Postal code" name="postalCode" register={register} error={errors.postalCode} />

                  <Button type="button" className="mt-2 w-full sm:w-auto" size="lg" onClick={goToPayment}>
                    Continue to payment
                  </Button>
                </form>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-primary">Payment method</h2>
                <p className="mt-1 text-sm text-neutral-600">Choose how you want to pay.</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("SSLCommerz")}
                    className={[
                      "rounded-xl border px-4 py-4 text-left text-sm font-medium transition",
                      paymentMethod === "SSLCommerz"
                        ? "border-primary bg-neutral-50 text-primary"
                        : "border-neutral-100 hover:border-neutral-200",
                    ].join(" ")}
                  >
                    Pay with SSLCommerz
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={[
                      "rounded-xl border px-4 py-4 text-left text-sm font-medium transition",
                      paymentMethod === "COD"
                        ? "border-primary bg-neutral-50 text-primary"
                        : "border-neutral-100 hover:border-neutral-200",
                    ].join(" ")}
                  >
                    Cash on Delivery
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="bg-accent hover:bg-accent-hover"
                    size="lg"
                    isLoading={placing}
                    onClick={onPlaceOrder}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-primary">Order summary</h2>
            <ul className="mt-4 max-h-48 space-y-2 overflow-auto text-sm">
              {items.map((item, idx) => (
                <li key={`${item.product}-${idx}`} className="flex justify-between gap-2 text-neutral-700">
                  <span className="min-w-0 truncate">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    ৳{(Number(item.price) * Number(item.quantity)).toFixed(0)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd className="tabular-nums font-medium">৳{subtotal.toFixed(0)}</dd>
              </div>
              {discountAmount > 0 ? (
                <div className="flex justify-between text-accent">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">−৳{discountAmount.toFixed(0)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-neutral-600">Shipping</dt>
                <dd className="tabular-nums font-medium">{shipping === 0 ? "Free" : `৳${shipping}`}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-semibold text-primary">
                <dt>Total</dt>
                <dd className="tabular-nums">৳{grandTotal.toFixed(0)}</dd>
              </div>
            </dl>

            <Link href="/cart" className="mt-6 block text-center text-sm text-primary underline-offset-4 hover:underline">
              Edit cart
            </Link>
          </aside>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}
