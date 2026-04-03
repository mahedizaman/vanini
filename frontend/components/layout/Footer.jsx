import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-bold">VANINI</h3>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            Modern e-commerce experience built with Next.js and a Node/Express + MongoDB backend.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="mt-3 grid gap-2 text-sm text-white/80">
            <li>
              <Link className="hover:text-white" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/shop">
                Shop
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/wishlist">
                Wishlist
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/checkout">
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 grid gap-2 text-sm text-white/80">
            <li>Email: info@vanini.com</li>
            <li>Phone: +880 0000-000000</li>
            <li>Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/70">
          © {new Date().getFullYear()} VANINI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
