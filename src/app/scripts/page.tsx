"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LONG_SCRIPTS, MEDIUM_SCRIPTS } from "@/lib/scripts";
import type { ScriptLength } from "@/lib/scripts";

export default function ScriptsPage() {
  const [filter, setFilter] = useState<ScriptLength | "all">("all");

  const displayScripts = filter === "all"
    ? [...LONG_SCRIPTS, ...MEDIUM_SCRIPTS]
    : filter === "long" ? LONG_SCRIPTS : MEDIUM_SCRIPTS;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-rose)] inline-block mb-4">
            ← 回到桐薇宇宙
          </Link>
          <h1 className="text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            推理副本
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            与田曦薇、李一桐一起进入经典推理世界
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-3 mb-8">
          {(["all", "long", "medium"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-rose-400 to-amber-400 text-white shadow-lg"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              {f === "all" ? "全部 (15)" : f === "long" ? "长剧本 (10)" : "中剧本 (5)"}
            </button>
          ))}
        </div>

        {/* Script Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {displayScripts.map((script, i) => (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/scripts/${script.id}`}>
                <div className="glass-panel p-5 h-full cursor-pointer hover:shadow-[var(--shadow-glow)] transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`tag text-[10px] mb-1 inline-block ${
                        script.difficulty === "hard"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : script.difficulty === "medium"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {script.difficulty === "hard" ? "高难" : script.difficulty === "medium" ? "中等" : "入门"}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)]">{script.estimatedTime}</p>
                    </div>
                    <span className={`tag text-[10px] ${
                      script.length === "long" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {script.length === "long" ? "长剧本" : "中剧本"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-rose)] transition-colors">
                    {script.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    灵感：{script.inspiration}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {script.background.slice(0, 120)}...
                  </p>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {script.playerCount.min}-{script.playerCount.max}人
                    </span>
                    <span className="text-[10px] text-[var(--accent-rose)] flex items-center gap-1">
                      🌸 田曦薇：{script.roles.tianxiwei.slice(0, 15)}...
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 text-xs text-[var(--text-muted)]">
          <p>剧本灵感来自阿加莎·克里斯蒂、东野圭吾、柯南·道尔等大师作品</p>
          <p className="mt-1">所有剧本均经过精心改编，保留原作精髓</p>
        </div>
      </div>
    </div>
  );
}
