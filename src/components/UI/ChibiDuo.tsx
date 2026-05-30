"use client";

import { motion } from "framer-motion";

export default function ChibiDuo() {
  return (
    <motion.div
      className="fixed top-4 right-4 z-50 flex gap-2"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.8 }}
    >
      {/* Tian Xiwei chibi */}
      <motion.div
        whileHover={{ scale: 1.15, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer"
      >
        <svg viewBox="0 0 60 60" width="48" height="48">
          <defs>
            <radialGradient id="tianGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFE4E9" />
              <stop offset="100%" stopColor="#FFB6C1" />
            </radialGradient>
          </defs>
          <circle cx="30" cy="30" r="28" fill="url(#tianGrad)" stroke="#FFF" strokeWidth="2" />
          {/* Hair - dark */}
          <ellipse cx="30" cy="22" rx="26" ry="20" fill="#3D2C2E" />
          <path d="M10 28 Q5 45 8 52" stroke="#3D2C2E" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M50 28 Q55 45 52 52" stroke="#3D2C2E" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* Face */}
          <circle cx="30" cy="30" rx="20" ry="16" fill="#FFF5F7" />
          {/* Eyes */}
          <circle cx="24" cy="28" r="3" fill="#2D1B2E" />
          <circle cx="36" cy="28" r="3" fill="#2D1B2E" />
          <circle cx="25" cy="27" r="1.2" fill="white" />
          <circle cx="37" cy="27" r="1.2" fill="white" />
          {/* Smile */}
          <path d="M27 34 Q30 37 33 34" stroke="#D4A0A0" strokeWidth="1" fill="none" />
          {/* Blush */}
          <circle cx="20" cy="32" r="3" fill="#FFB6C1" opacity="0.3" />
          <circle cx="40" cy="32" r="3" fill="#FFB6C1" opacity="0.3" />
          {/* Ribbon */}
          <path d="M12 18 L8 15 L12 12" fill="#F472B6" />
          <path d="M48 18 L52 15 L48 12" fill="#F472B6" />
        </svg>
      </motion.div>

      {/* Li Yitong chibi */}
      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer"
      >
        <svg viewBox="0 0 60 60" width="48" height="48">
          <defs>
            <radialGradient id="yiGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="100%" stopColor="#FFE4B5" />
            </radialGradient>
          </defs>
          <circle cx="30" cy="30" r="28" fill="url(#yiGrad)" stroke="#FFF" strokeWidth="2" />
          {/* Hair - long flowing */}
          <ellipse cx="30" cy="20" rx="26" ry="18" fill="#1A0F0F" />
          <path d="M6 24 Q10 52 14 58" stroke="#1A0F0F" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M54 24 Q50 52 46 58" stroke="#1A0F0F" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* Face */}
          <circle cx="30" cy="28" rx="19" ry="15" fill="#FFF8F0" />
          {/* Eyes */}
          <circle cx="24" cy="26" r="3.2" fill="#1A0F0F" />
          <circle cx="36" cy="26" r="3.2" fill="#1A0F0F" />
          <circle cx="25" cy="25" r="1.3" fill="white" />
          <circle cx="37" cy="25" r="1.3" fill="white" />
          {/* Smile */}
          <path d="M27 32 Q30 34 33 32" stroke="#C4A0A0" strokeWidth="1" fill="none" />
          {/* Blush */}
          <circle cx="21" cy="30" r="3" fill="#FFB6C1" opacity="0.3" />
          <circle cx="39" cy="30" r="3" fill="#FFB6C1" opacity="0.3" />
          {/* Flower accessory */}
          <circle cx="14" cy="16" r="4" fill="#F9A8D4" />
          <circle cx="14" cy="16" r="1.5" fill="#FDE68A" />
        </svg>
      </motion.div>
    </motion.div>
  );
}