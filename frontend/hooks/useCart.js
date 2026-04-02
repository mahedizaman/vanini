import useCartStore from "@/store/cartStore";

const useCart = () => {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.total());
  const couponCode = useCartStore((s) => s.couponCode);
  const discountAmount = useCartStore((s) => s.discountAmount);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    couponCode,
    discountAmount,
    setCoupon,
    clearCoupon,
  };
};

export default useCart;
