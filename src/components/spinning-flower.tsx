"use client";
import { motion } from "framer-motion";
import { FlowerIcon } from "lucide-react";

export default function SpinningFlower() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 360,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        },
      }}
      className="rounded-full p-4 h-[5rem] w-[5rem] bg-zinc-800"
    >
      <FlowerIcon className="h-full w-full text-zinc-300" />
    </motion.div>
  );
}
