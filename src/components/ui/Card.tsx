import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <motion.div
      className={`w-[420px] max-w-full p-[42px] rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl transition-all duration-400 z-[5] hover:-translate-y-2 flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
