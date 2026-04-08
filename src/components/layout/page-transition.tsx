"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18, filter: "blur(3px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
        transition={{ duration: 0.33, ease: [0.16, 1, 0.3, 1] }}
        className="page-stage"
      >
        <motion.span
          aria-hidden="true"
          className="page-stage-sheen"
          initial={{ x: "-48%", opacity: 0 }}
          animate={{ x: "95%", opacity: [0, 0.42, 0] }}
          transition={{ duration: 0.62, ease: "easeOut" }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}