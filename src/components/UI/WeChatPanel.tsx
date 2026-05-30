"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface WeChatMessage {
  id: string;
  sender: "tianxiwei" | "liyitong" | "user";
  text: string;
  innerOS?: string;
  timestamp: number;
  playing?: boolean;
}

const STORAGE_KEY = "tongwei_wechat_history";

const WARMUP_MESSAGES: WeChatMessage[] = [
  { id: "warm_1", sender: "tianxiwei", text: "桐姐～今天拍戏好累噢...你那边怎么样了嘛？", timestamp: Date.now() - 300000 },
  { id: "warm_2", sender: "liyitong", text: "刚收工～今天有场哭戏，眼睛还有点肿。你累的话早点休息呀。", timestamp: Date.now() - 280000 },
  { id: "warm_3", sender: "tianxiwei", text: "不要！我要跟你聊会儿天～你哭戏是不是又哭太久了，眼睛不舒服记得用冰敷噢。", timestamp: Date.now() - 260000 },
  { id: "warm_4", sender: "liyitong", text: "知道啦。你今天那场打戏我看了花絮，帅的。不过膝盖磕到了吧？我看到了。", timestamp: Date.now() - 240000 },
  { id: "warm_5", sender: "tianxiwei", text: "你怎么什么都知道！...就磕了一下下嘛。你啷个连花絮都看了嘛...", timestamp: Date.now() - 220000 },
  { id: "warm_6", sender: "liyitong", text: "你的每一条花絮我都看了呀。下次小心点，别那么拼。", timestamp: Date.now() - 200000 },
  { id: "warm_7", sender: "tianxiwei", text: "咦，小唐怎么还没出现噢？不会又在加班吧...", timestamp: Date.now() - 180000 },
  { id: "warm_8", sender: "liyitong", text: "可能工作忙吧。TA来了肯定会冒泡的。我们聊着等～", timestamp: Date.now() - 160000 },
  { id: "warm_9", sender: "tianxiwei", text: "小唐！！你到底什么时候来！！我都等半天了哼！再不来我要生气了噢！", timestamp: Date.now() - 140000 },
  { id: "warm_10", sender: "liyitong", text: "小薇你小点声啦...不过TA真的好久没来聊天了，有点想TA呢。小唐快出现呀～", timestamp: Date.now() - 120000 },
];

function loadHistory(): WeChatMessage[] {
  if (typeof window === "undefined") return [...WARMUP_MESSAGES];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as WeChatMessage[];
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  return [...WARMUP_MESSAGES];
}

function saveHistory(messages: WeChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
  } catch {}
}

export default function WeChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<WeChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState<"tianxiwei" | "liyitong" | null>(null);
  const [queuedMessages, setQueuedMessages] = useState<WeChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages(loadHistory());
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 && initialized.current) saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Sequential message display from queue
  useEffect(() => {
    if (queuedMessages.length === 0) return;
    const timer = setTimeout(() => {
      const [next, ...rest] = queuedMessages;
      setMessages((prev) => [...prev, { ...next, playing: true }]);

      // Animate out the "playing" state after 300ms
      setTimeout(() => {
        setMessages((prev) => prev.map((m) => m.id === next.id ? { ...m, playing: false } : m));
      }, 400);

      setQueuedMessages(rest);
      if (rest.length > 0) {
        const nextSender = rest[0].sender;
        if (nextSender !== "user") setTyping(nextSender);
        else setTyping(null);
      } else {
        setTyping(null);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [queuedMessages]);

  // Auto warm-up
  useEffect(() => {
    if (messages.length < 3) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === "user") return;
    if (lastMsg.timestamp < Date.now() - 60000 && !loading) {
      const warmup = async () => {
        setTyping("tianxiwei");
        try {
          const res = await fetch("/api/wechat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: "（系统：请自然地继续聊天，聊聊今天发生的事、吐槽工作、或者互相撒娇。要显得很想小唐。）",
              history: messages.slice(-10).map((m) => ({ sender: m.sender, text: m.text })),
              autoWarmup: true,
            }),
          });
          const data = await res.json();
          if (data.success) {
            const replies: WeChatMessage[] = (data.data.messages || []).map((m: any, i: number) => ({
              id: `wc_auto_${Date.now()}_${i}`,
              sender: m.sender as "tianxiwei" | "liyitong",
              text: m.text,
              innerOS: m.innerOS,
              timestamp: Date.now() + i * 500,
            }));
            setTyping(null);
            if (replies.length > 0) {
              if (replies[0].sender !== "user") setTyping(replies[0].sender);
              setQueuedMessages(replies);
            }
          }
        } catch { setTyping(null); }
      };
      warmup();
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: WeChatMessage = { id: `wc_user_${Date.now()}`, sender: "user", text: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/wechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.slice(-15).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        const replies: WeChatMessage[] = (data.data.messages || []).map((m: any, i: number) => ({
          id: `wc_reply_${Date.now()}_${i}`,
          sender: m.sender as "tianxiwei" | "liyitong",
          text: m.text,
          innerOS: m.innerOS,
          timestamp: Date.now() + i * 500,
        }));
        setLoading(false);
        if (replies.length > 0) {
          if (replies[0].sender !== "user") setTyping(replies[0].sender);
          setQueuedMessages(replies);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
      setTyping(null);
    }
  }, [input, loading, messages]);

  const clearHistory = () => {
    setMessages([...WARMUP_MESSAGES]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md h-[90vh] sm:h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#EDEDED" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#EDEDED] border-b border-gray-300">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">←</button>
          <div className="flex-1 text-center">
            <p className="font-bold text-base text-gray-800">桐心薇泯</p>
            <p className="text-xs text-gray-500">{typing ? `${typing === "tianxiwei" ? "田曦薇" : "李一桐"} 正在输入...` : "3人在线"}</p>
          </div>
          <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400">清空</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3" style={{ background: "#EDEDED" }}>
          {messages.map((msg) => (
            <WeChatBubble key={msg.id} message={msg} isOwn={msg.sender === "user"} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-xs text-gray-400">对方正在输入</span>
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F7] border-t border-gray-300">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="说点什么..." className="flex-1 px-3 py-2 rounded-full bg-white border border-gray-300 text-sm outline-none focus:border-green-400 transition-colors" maxLength={200} />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: input.trim() ? "#07C160" : "#B0B0B0" }}>发送</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WeChatBubble({ message, isOwn }: { message: WeChatMessage; isOwn: boolean }) {
  const isTian = message.sender === "tianxiwei";
  const isLitong = message.sender === "liyitong";
  const avatarImg = isTian ? "/tianxiwei.jpg" : isLitong ? "/liyitong.jpg" : null;
  const name = isTian ? "田曦薇" : isLitong ? "李一桐" : "小唐";
  const nameColor = isTian ? "#F47285" : isLitong ? "#D4942A" : "#07C160";
  const bubbleBg = isOwn ? "#95EC69" : "#FFFFFF";

  return (
    <motion.div
      initial={message.playing ? { opacity: 0, y: 10, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-lg"
        style={{ background: isOwn ? "#07C160" : isTian ? "#FEE2E8" : "#FEF3C7", overflow: "hidden" }}>
          {avatarImg ? <img src={avatarImg} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🍦"}
        </div>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        <p className="text-[10px] mb-0.5 px-1" style={{ color: nameColor }}>{name}</p>
        <div className="px-3 py-2 rounded-lg text-sm leading-relaxed shadow-sm"
          style={{ background: bubbleBg, borderTopLeftRadius: isOwn ? "12px" : "2px", borderTopRightRadius: isOwn ? "2px" : "12px", color: "#1A1A1A" }}>
          {message.text}
        </div>
        {message.innerOS && <p className="text-[10px] text-gray-400 mt-0.5 px-1 italic">💭 {message.innerOS}</p>}
      </div>
    </motion.div>
  );
}
