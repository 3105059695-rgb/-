"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

const TIAN_MOODS: Record<string, { emoji: string; label: string }> = {
  "撒娇": { emoji: "🥺", label: "想要关注" },
  "开心": { emoji: "✨", label: "心情好好" },
  "吃醋": { emoji: "😤", label: "有点醋" },
  "警觉": { emoji: "👀", label: "警觉中" },
  "不安": { emoji: "😔", label: "不太安定" },
  "内耗": { emoji: "🌙", label: "在想了" },
  "感动": { emoji: "🥹", label: "被暖到了" },
  "害羞": { emoji: "💕", label: "被说中了" },
  "放松": { emoji: "🐱", label: "充电中" },
  "幸福": { emoji: "💖", label: "这一刻真好" },
};

export default function TianPanel() {
  const { dialogues, innerOS } = useAppStore();

  const tianDialogues = dialogues.filter((d) => d.character === "tianxiwei");
  const latestTian = tianDialogues[tianDialogues.length - 1];
  const emotion = latestTian?.emotion || "放松";
  const moodInfo = TIAN_MOODS[emotion] || TIAN_MOODS["放松"];

  const recentThoughts = tianDialogues
    .slice(-5)
    .filter((d) => d.innerOS)
    .map((d) => d.innerOS);

  return (
    <div className="glass-panel p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-rose-400/40 ring-offset-2 ring-offset-[var(--bg-secondary)] shrink-0 shadow-lg shadow-rose-300/20">
          <img src="/tianxiwei.jpg" alt="田曦薇" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-[var(--accent-rose)]">田曦薇</h3>
          <p className="text-[10px] text-[var(--text-muted)]">INFJ-T · 甜辣烈酒</p>
        </div>
      </div>

      <motion.div
        key={emotion}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 rounded-xl bg-gradient-to-br from-rose-50/50 to-amber-50/50 dark:from-rose-900/20 dark:to-amber-900/20 border border-rose-200/50 dark:border-rose-800/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moodInfo.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{moodInfo.label}</p>
            <p className="text-[10px] text-[var(--text-muted)]">此刻状态</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-3">
        <h4 className="text-[10px] uppercase text-[var(--text-muted)] mb-2 tracking-wider">内心碎片</h4>
        {innerOS.tianxiwei && (
          <motion.p
            key={innerOS.tianxiwei}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-primary)] rounded-lg p-2 border border-[var(--border-color)]"
          >
            💭 {innerOS.tianxiwei}
          </motion.p>
        )}
        {!innerOS.tianxiwei && recentThoughts.length > 0 && (
          <motion.p
            key={recentThoughts[recentThoughts.length - 1]}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-primary)] rounded-lg p-2 border border-[var(--border-color)]"
          >
            💭 {recentThoughts[recentThoughts.length - 1]}
          </motion.p>
        )}
        {!innerOS.tianxiwei && recentThoughts.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] italic">她在想什么呢...</p>
        )}
      </div>

      <div>
        <h4 className="text-[10px] uppercase text-[var(--text-muted)] mb-2 tracking-wider">口头禅轮盘</h4>
        <div className="flex flex-wrap gap-1">
          {["桐姐～", "我哪有！", "你好烦噢～", "过来，抱。", "我才没有吃醋", "就一下下嘛"].map((phrase) => (
            <span
              key={phrase}
              className="tag text-[10px] bg-rose-100/50 dark:bg-rose-900/20 text-[var(--text-secondary)]"
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
