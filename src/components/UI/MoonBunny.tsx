"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MoonBunny() {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [clicked, setClicked] = useState(0);
  const [bubble, setBubble] = useState("");
  let heartId = 0;

  const pet = useCallback(() => {
    setClicked(c => c + 1);
    const id = ++heartId;
    setHearts(h => [...h.slice(-6), { id, x: Math.random() * 50 - 25, y: -30 - Math.random() * 40 }]);
    setTimeout(() => setHearts(h => h.filter(he => he.id !== id)), 1800);
    const msgs = ["噗哟~", "好开心！", "啾~", "再摸摸嘛~", "最喜欢你了☆"];
    setBubble(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => setBubble(""), 2500);
  }, []);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50 select-none cursor-pointer"
        initial={{ y: 120, opacity: 0, scale: 0.3 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.85 }}
        onClick={pet}
      >
        {/* Bubble */}
        <AnimatePresence>
          {bubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-pink-500 text-xs px-3 py-1.5 rounded-2xl rounded-bl-sm shadow-lg whitespace-nowrap font-[var(--font-display)]"
            >
              {bubble}
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white/95 rotate-45 rounded-sm" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Moon + Bunny SVG */}
        <div className="relative drop-shadow-[0_4px_24px_rgba(244,114,182,0.3)]" style={{ width: 72, height: 72 }}>
          <svg viewBox="0 0 120 120" width="72" height="72">
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE4B5" />
                <stop offset="100%" stopColor="#FFD700" />
              </radialGradient>
              <radialGradient id="bunnyBody" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFF5F7" />
              </radialGradient>
            </defs>

            {/* Moon crescent base */}
            <motion.circle cx="60" cy="60" r="38" fill="url(#moonGlow)" opacity="0.6"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }} />

            {/* Bunny body - sitting on moon */}
            <ellipse cx="60" cy="72" rx="20" ry="14" fill="url(#bunnyBody)" />
            {/* Fluffy tail */}
            <circle cx="82" cy="74" r="10" fill="#FFF5F7" opacity="0.8" />

            {/* Bunny head */}
            <circle cx="60" cy="50" r="18" fill="url(#bunnyBody)" />

            {/* Long ears */}
            <motion.ellipse cx="50" cy="20" rx="6" ry="18" fill="#FFF5F7"
              animate={{ rotate: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: "50px 30px" }} />
            <motion.ellipse cx="70" cy="18" rx="6" ry="20" fill="#FFF5F7"
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              style={{ transformOrigin: "70px 28px" }} />
            {/* Ear insides */}
            <ellipse cx="50" cy="20" rx="3" ry="12" fill="#FFE4E9" />
            <ellipse cx="70" cy="18" rx="3" ry="13" fill="#FFE4E9" />

            {/* Eyes - big cute */}
            <circle cx="54" cy="48" r="3.5" fill="#4A4A4A" />
            <circle cx="66" cy="48" r="3.5" fill="#4A4A4A" />
            <circle cx="55" cy="47" r="1.5" fill="white" />
            <circle cx="67" cy="47" r="1.5" fill="white" />

            {/* Pink nose */}
            <ellipse cx="60" cy="54" rx="2.5" ry="1.8" fill="#FFB6C1" />

            {/* Mouth */}
            <path d="M57 57 Q60 60 63 57" stroke="#D4A0A0" strokeWidth="0.8" fill="none" />

            {/* Blush */}
            <circle cx="46" cy="52" r="4" fill="#FFE4E9" opacity="0.6" />
            <circle cx="74" cy="52" r="4" fill="#FFE4E9" opacity="0.6" />

            {/* Little paws */}
            <ellipse cx="48" cy="82" rx="5" ry="3" fill="#FFF5F7" />
            <ellipse cx="72" cy="82" rx="5" ry="3" fill="#FFF5F7" />

            {/* Stars around */}
            <motion.text x="30" y="30" fontSize="8" fill="#FFE4B5"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}>✦</motion.text>
            <motion.text x="90" y="25" fontSize="6" fill="#FFE4B5"
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}>✧</motion.text>
            <motion.text x="20" y="60" fontSize="5" fill="#FFD700"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}>⋆</motion.text>
          </svg>
        </div>

        {/* Floating hearts */}
        {hearts.map(h => (
          <motion.div
            key={h.id}
            className="absolute text-pink-400 text-lg pointer-events-none drop-shadow-[0_2px_8px_rgba(244,114,182,0.4)]"
            style={{ left: "50%", top: "20%" }}
            initial={{ opacity: 1, scale: 0.3, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.6, x: h.x, y: h.y }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          >
            {"💕🩷💗✨"[Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}