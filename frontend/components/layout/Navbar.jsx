"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiBars3, HiXMark } from "react-icons/hi2";

import CartDrawer from "@/components/cart/CartDrawer";
import useAuth from "@/hooks/useAuth";
import useCartStore from "@/store/cartStore";
import api from "@/utils/axios";
import { slideInLeft } from "@/animations/slideIn";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { accessToken, logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Requires bearer token (handled by axios interceptor when accessToken exists)
      await api.post("/auth/logout");
    } catch {
      // Even if the API call fails (e.g. expired token), clear local session.
    } finally {
      logout();
      router.push("/login");
    }
  };

  const itemsCount = useCartStore((s) => s.items.reduce((sum, i) => sum + Number(i.quantity || 0), 0));

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist");
      return res.data?.wishlist ?? [];
    },
    enabled: mounted && Boolean(accessToken),
  });
  const wishlistCount = Array.isArray(wishlistQuery.data) ? wishlistQuery.data.length : 0;
  const safeAccessToken = mounted ? accessToken : null;
  const safeItemsCount = mounted ? itemsCount : 0;
  const safeWishlistCount = mounted ? wishlistCount : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setCartOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (cartOpen || mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, mobileOpen]);

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/shop", label: "Shop" },
    ],
    []
  );

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className={[
          "fixed inset-x-0 top-0 z-50",
          "transition-colors",
          scrolled ? "bg-white shadow" : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-black p-2 text-white hover:bg-neutral-900 md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <HiBars3 className="h-6 w-6" />
            </button>

            <Link href="/" className="font-display text-xl font-bold tracking-wide text-primary">
              VANINI
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex font-poppins">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-primary/80 transition hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 font-poppins">
            <Link
              href="/wishlist"
              className="relative inline-flex items-center justify-center rounded-md p-2 bg-black text-white  hover:bg-neutral-100"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="h-6 w-6 " />
              {safeWishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-white">
                  {safeWishlistCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md bg-black p-2 text-white hover:bg-neutral-900"
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
            >
              <HiOutlineShoppingBag className="h-6 w-6" />
              {safeItemsCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-white">
                  {safeItemsCount}
                </span>
              ) : null}
            </button>

            <Link
              href={safeAccessToken ? "/account" : "/login"}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-neutral-100"
              aria-label={safeAccessToken ? "Account" : "Sign in"}
            >
              <HiOutlineUser className="h-6 w-6" />
            </Link>

            {safeAccessToken ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 md:inline-flex"
                aria-label="Logout"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 md:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900 md:inline-flex"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <div className="h-16" />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full w-full max-w-xs bg-white p-4"
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-display text-lg font-bold">Menu</span>
                <button
                  type="button"
                  className="rounded-md bg-black p-2 text-white hover:bg-neutral-900"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <HiXMark className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-neutral-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <button
                  type="button"
                  className="rounded-md bg-black px-3 py-2 text-left text-sm font-medium text-white hover:bg-neutral-900"
                  onClick={() => {
                    setMobileOpen(false);
                    setCartOpen(true);
                  }}
                >
                  Cart{safeItemsCount > 0 ? ` (${safeItemsCount})` : ""}
                </button>
                <Link
                  href="/wishlist"
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-neutral-100"
                  onClick={() => setMobileOpen(false)}
                >
                  Wishlist{safeWishlistCount > 0 ? ` (${safeWishlistCount})` : ""}
                </Link>
                {safeAccessToken ? (
                  <Link
                    href="/account"
                    className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Account
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-900"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}

                {safeAccessToken ? (
                  <button
                    type="button"
                    className="rounded-md bg-black px-3 py-2 text-left text-sm font-medium text-white hover:bg-neutral-900"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
