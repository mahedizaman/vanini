"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiXMark } from "react-icons/hi2";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-slate-950/40" onClick={onClose} />

          <motion.div
            className="relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-white p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {title ? <h3 className="font-display text-lg font-bold text-primary">{title}</h3> : null}
              </div>
              <button
                type="button"
                className="rounded-md bg-black p-2 text-white hover:bg-neutral-900"
                aria-label="Close modal"
                onClick={onClose}
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
