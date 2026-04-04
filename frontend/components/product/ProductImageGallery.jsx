"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { fadeIn } from "@/animations/fadeIn";
import OptimizedImage from "@/components/ui/OptimizedImage";

export default function ProductImageGallery({ images = [] }) {
  const list = useMemo(() => images.filter(Boolean), [images]);
  const [active, setActive] = useState(list[0] || "");

  const activeImage = active || list[0] || "";

  return (
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-2xl border bg-neutral-50">
        <div className="relative aspect-square w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {activeImage ? (
                <OptimizedImage
                  src={activeImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {list.length > 0 ? (
        <div className="flex gap-2 overflow-auto pb-1">
          {list.map((src) => {
            const isActive = src === activeImage;
            return (
              <button
                type="button"
                key={src}
                onClick={() => setActive(src)}
                className={[
                  "h-16 w-16 flex-none overflow-hidden rounded-xl border border-neutral-600 bg-black",
                  isActive ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-primary/40 hover:ring-offset-2",
                ].join(" ")}
                aria-label="Select image"
              >
                <OptimizedImage src={src} alt="" width={64} height={64} className="h-full w-full object-cover" sizes="64px" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
