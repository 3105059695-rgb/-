"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import WeChatPanel from "@/components/UI/WeChatPanel";

export default function Header() {
  const { isDarkMode, toggleDarkMode, setDarkMode, scene, mood, nickname, isLoggedIn, bondMoments, mode } = useAppStore();
  const [showBondBook, setShowBondBook] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPrivateMsg, setShowPrivateMsg] = useState(false);
  const [showWeChat, setShowWeChat] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-panel mx-2 mt-2 px-4 py-3 flex items-center justify-between border-opacity-60">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent font-[var(--font-display)]">
              桐薇宇宙
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
              <span>Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/scripts" className="btn-secondary text-xs px-3 py-1.5 inline-block no-underline">
              推理副本
            </Link>

            <Link href="/room9" className="btn-secondary text-xs px-3 py-1.5 inline-block no-underline border-rose-500/30 bg-rose-50/50 dark:bg-rose-900/10">
              九号房间
            </Link>

            <button
              onClick={() => setShowWeChat(!showWeChat)}
              className="btn-secondary text-xs px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border-green-300"
            >
              微信聊天
            </button>

            <button
              onClick={() => setShowBondBook(!showBondBook)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              羁绊之书
            </button>

            <button
              onClick={() => setShowPrivateMsg(!showPrivateMsg)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              私信
            </button>

            <button
              onClick={toggleDarkMode}
              className="btn-secondary text-xs px-2.5 py-1.5"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={() => setShowAuth(!showAuth)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {isLoggedIn ? nickname : "游客模式"}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showBondBook && <BondBookPanel onClose={() => setShowBondBook(false)} />}
        {showAuth && <AuthPanel onClose={() => setShowAuth(false)} />}
        {showPrivateMsg && <PrivateMessagePanel onClose={() => setShowPrivateMsg(false)} />}
        {showWeChat && <WeChatPanel onClose={() => setShowWeChat(false)} />}
      </AnimatePresence>
    </>
  );
}

function BondBookPanel({ onClose }: { onClose: () => void }) {
  const bondMoments = useAppStore((s) => s.bondMoments);
  const [moments, setMoments] = useState(bondMoments);

  useEffect(() => {
    fetch("/api/memories?type=bond-moments")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMoments(d.data);
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-[var(--font-display)]">羁绊之书</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ✕
          </button>
        </div>
        {moments.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-8">还没有收藏的瞬间，多互动来创造回忆吧～</p>
        ) : (
          <div className="space-y-4">
            {moments.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
              >
                <h3 className="font-semibold text-[var(--accent-rose)]">{m.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{m.description}</p>
                <div className="flex gap-1 mt-2">
                  {(m.moodTags || []).map((tag) => (
                    <span key={tag} className="tag text-xs">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function AuthPanel({ onClose }: { onClose: () => void }) {
  const { setUser } = useAppStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "login") {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user.id, data.data.user.nickname);
        onClose();
      } else {
        setError(data.error);
      }
    } else {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, nickname }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user.id, data.data.user.nickname);
        onClose();
      } else {
        setError(data.error);
      }
    }
  };

  const handleAnonymous = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "anonymous" }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.data.user.id, data.data.user.nickname);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTab("login")}
              className={`text-sm font-semibold ${tab === "login" ? "text-[var(--accent-rose)]" : "text-[var(--text-muted)]"}`}
            >
              登录
            </button>
            <button
              onClick={() => setTab("register")}
              className={`text-sm font-semibold ${tab === "register" ? "text-[var(--accent-rose)]" : "text-[var(--text-muted)]"}`}
            >
              注册
            </button>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "register" && (
            <input
              type="text"
              placeholder="昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-field"
            />
          )}
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            {tab === "login" ? "登录" : "注册"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            onClick={handleAnonymous}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-rose)]"
          >
            以游客身份进入 →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PrivateMessagePanel({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState<"tianxiwei" | "liyitong">("tianxiwei");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [innerOS, setInnerOS] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/private-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: target, message }),
      });
      const data = await res.json();
      if (data.success) {
        setReply(data.data.reply);
        setInnerOS(data.data.innerOS || "");
      }
    } catch (e) {
      setReply("私信暂时发不出去...");
    }
    setLoading(false);
    setMessage("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-[var(--font-display)]">私信</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTarget("tianxiwei")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              target === "tianxiwei"
                ? "bg-gradient-to-r from-rose-300 to-rose-400 text-white"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
            }`}
          >
            <img src="/tianxiwei.jpg" alt="" className="w-5 h-5 rounded-full inline-block -mt-0.5" /> 田曦薇
          </button>
          <button
            onClick={() => setTarget("liyitong")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              target === "liyitong"
                ? "bg-gradient-to-r from-amber-300 to-amber-400 text-white"
                : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
            }`}
          >
            <img src="/liyitong.jpg" alt="" className="w-5 h-5 rounded-full inline-block -mt-0.5" /> 李一桐
          </button>
        </div>

        {reply && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
          >
            <p className="text-sm font-semibold text-[var(--accent-rose)]">
              {target === "tianxiwei" ? "田曦薇" : "李一桐"}
            </p>
            <p className="text-sm text-[var(--text-primary)] mt-1">{reply}</p>
            {innerOS && (
              <p className="text-xs text-[var(--text-muted)] mt-1 italic">💭 {innerOS}</p>
            )}
          </motion.div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`悄悄对${target === "tianxiwei" ? "田曦薇" : "李一桐"}说...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="input-field flex-1"
          />
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="btn-primary text-sm px-4 disabled:opacity-50"
          >
            {loading ? "发送中" : "发送"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
