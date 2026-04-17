import React from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    once,
    margin: '0px 0px -12% 0px',
    amount: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}