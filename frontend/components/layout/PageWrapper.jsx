"use client";

import { motion } from "framer-motion";
import { pageVariants } from "@/animations/pageTransition";

export default function PageWrapper({ children }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      {children}
    </motion.div>
  );
}
