"use client";

import { motion } from "framer-motion";
import type { IProps } from "../types/types";

const FloatingShape = ({ color, size, top, left, delay }: IProps) => {
  return (
    <motion.div
      className={`absolute rounded-full ${color} ${size} opacity-20 blur-3xl`}
      style={{ top, left }}
      animate={{
        y: ["0%", "20%", "0%"],
        x: ["0%", "15%", "0%"],
        rotate: [0, 360],
      }}
      transition={{
        duration: 25,
        ease: "linear",
        repeat: Infinity,
        delay,
      }}
      aria-hidden="true"
    />
  );
};

export default FloatingShape;