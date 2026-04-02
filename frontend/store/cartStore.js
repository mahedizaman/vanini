import { create } from "zustand";

const sameVariant = (a, productId, size, color) =>
  String(a.product) === String(productId) && a.size === size && a.color === color;

const useCartStore = create((set, get) => ({
  items: [],
  couponCode: null,
  discountAmount: 0,
  setCoupon: (couponCode, discountAmount) =>
    set({
      couponCode: couponCode ? String(couponCode).trim() : null,
      discountAmount: Math.max(0, Number(discountAmount) || 0),
    }),
  clearCoupon: () => set({ couponCode: null, discountAmount: 0 }),
  addItem: (item) =>
    set((state) => {
      const existingIndex = state.items.findIndex((i) =>
        sameVariant(i, item.product, item.size, item.color)
      );
      if (existingIndex >= 0) {
        const items = [...state.items];
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + (item.quantity || 1),
        };
        return { items };
      }
      return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
    }),
  removeItem: (productId, size, color) =>
    set((state) => ({
      items: state.items.filter((i) => !sameVariant(i, productId, size, color)),
    })),
  updateQuantity: (productId, size, color, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        sameVariant(i, productId, size, color) ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    })),
  clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),
  total: () =>
    get().items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0),
}));

export default useCartStore;
