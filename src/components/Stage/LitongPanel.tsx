"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

const LITONG_MOODS: Record<string, { emoji: string; label: string }> = {
  "温柔": { emoji: "🍃", label: "岁月静好" },
  "开心": { emoji: "😊", label: "心情很好" },
  "担忧": { emoji: "🤍", label: "有点挂心" },
  "害羞": { emoji: "🌷", label: "被逗到了" },
  "感动": { emoji: "✨", label: "心里暖暖的" },
  "满足": { emoji: "☺️", label: "这样就好" },
  "心疼": { emoji: "💗", label: "在意她" },
  "放松": { emoji: "📖", label: "安静时光" },
  "焦虑": { emoji: "🫧", label: "默默消化" },
  "幸福": { emoji: "🌸", label: "她开心就好" },
};

export default function LitongPanel() {
  const { dialogues, innerOS } = useAppStore();

  const litongDialogues = dialogues.filter((d) => d.character === "liyitong");
  const latestLitong = litongDialogues[litongDialogues.length - 1];
  const emotion = latestLitong?.emotion || "温柔";
  const moodInfo = LITONG_MOODS[emotion] || LITONG_MOODS["温柔"];

  const tianEye = dialogues
    .slice(-3)
    .filter((d) => d.character === "liyitong" && d.text.includes("田曦薇"))
    .map((d) => d.text);

  return (
    <div className="glass-panel p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-amber-400/40 ring-offset-2 ring-offset-[var(--bg-secondary)] shrink-0 shadow-lg shadow-amber-300/20">
          <img src="/liyitong.jpg" alt="李一桐" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[var(--accent-gold)]">李一桐</h3>
          <p className="text-[10px] text-[var(--text-muted)]">ISFJ-A · 温润清茶</p>
        </div>
      </div>

      <motion.div
        key={emotion}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 rounded-xl bg-gradient-to-br from-amber-50/50 to-rose-50/50 dark:from-amber-900/20 dark:to-rose-900/20 border border-amber-200/50 dark:border-amber-800/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moodInfo.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{moodInfo.label}</p>
            <p className="text-[10px] text-[var(--text-muted)]">此刻感受</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-3">
        <h4 className="text-[10px] uppercase text-[var(--text-muted)] mb-2 tracking-wider">记事本</h4>
        {innerOS.liyitong && (
          <motion.p
            key={innerOS.liyitong}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-primary)] rounded-lg p-2 border border-[var(--border-color)]"
          >
            📝 {innerOS.liyitong}
          </motion.p>
        )}
        {!innerOS.liyitong && (
          <p className="text-xs text-[var(--text-muted)] italic">在心里默默记下...</p>
        )}
      </div>

      <div>
        <h4 className="text-[10px] uppercase text-[var(--text-muted)] mb-2 tracking-wider">眼中的她</h4>
        {tianEye.length > 0 && (
          <motion.p
            key={tianEye[0]}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] rounded-lg p-2 border border-[var(--border-color)]"
          >
            👀 {tianEye[tianEye.length - 1]}
          </motion.p>
        )}
      </div>

      <div className="mt-3">
        <h4 className="text-[10px] uppercase text-[var(--text-muted)] mb-2 tracking-wider">这个人的底线</h4>
        <div className="flex flex-wrap gap-1">
          {["没事呀～", "都可以。", "我在呢。", "她很好。", "你好烦～", "好。"].map((phrase) => (
            <span
              key={phrase}
              className="tag text-[10px] bg-amber-100/50 dark:bg-amber-900/20 text-[var(--text-secondary)]"
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
