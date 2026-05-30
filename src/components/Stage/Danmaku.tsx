"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

interface DanmakuItem {
  id: string;
  text: string;
  author: string;
  startTime: number;
}

export default function DanmakuLayer() {
  const danmakus = useAppStore((s) => s.danmakus);
  const [activeItems, setActiveItems] = useState<DanmakuItem[]>([]);

  useEffect(() => {
    const latest = danmakus[danmakus.length - 1];
    if (!latest) return;

    const item: DanmakuItem = {
      ...latest,
      startTime: Date.now(),
    };

    setActiveItems((prev) => [...prev.slice(-15), item]);

    setTimeout(() => {
      setActiveItems((prev) => prev.filter((i) => i.id !== item.id));
    }, 8000);
  }, [danmakus]);

  return (
    <div className="relative h-14 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {activeItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "-100%", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              x: { duration: 8, ease: "linear" },
              opacity: { duration: 0.3 },
            }}
            className="absolute whitespace-nowrap py-1"
            style={{ top: `${(index % 3) * 18 + 2}px` }}
          >
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100/80 dark:bg-rose-900/30 text-[var(--accent-rose)] border border-rose-200/50 dark:border-rose-800/30 backdrop-blur-sm shadow-sm">
              <span className="text-[10px] opacity-60 mr-1">📺</span>
              {item.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
