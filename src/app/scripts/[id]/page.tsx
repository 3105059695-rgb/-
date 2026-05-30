"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllScripts } from "@/lib/scripts";
import type { MysteryScript } from "@/lib/scripts";

type GamePhase = "intro" | "investigation" | "reveal";

export default function ScriptPlayPage() {
  const params = useParams();
  const scriptId = params.id as string;
  const script = getAllScripts().find((s) => s.id === scriptId);
  const loadedRef = useRef(false);

  const [phase, setPhase] = useState<GamePhase>("intro");
  const [currentRound, setCurrentRound] = useState(0);
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Array<{
    id: string; sender: string; text: string; timestamp: number;
  }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTruth, setShowTruth] = useState(false);
  const [dialogueCount, setDialogueCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const startGame = useCallback(() => {
    if (!script || loadedRef.current) return;
    loadedRef.current = true;
    setGameStarted(true);
    setPhase("investigation");

    const introMsgs = [
      { id: "intro_0", sender: "系统", text: `📜 **${script.title}**\n\n📖 灵感来源：${script.inspiration}`, timestamp: Date.now() },
      { id: "intro_1", sender: "系统", text: `## 故事背景\n\n${script.background}`, timestamp: Date.now() + 100 },
      { id: "intro_2", sender: "系统", text: `## 登场人物\n\n${script.characters.map((c, i) => 
        `${i + 1}. **${c.name}**${c.isVictim ? " 💀（死者）" : c.isKiller ? "（隐藏身份）" : ""}：${c.description}`
      ).join("\n\n")}`, timestamp: Date.now() + 200 },
      { id: "intro_3", sender: "系统", text: `## 你的角色\n\n😎 **你（推理社小唐）**：${script.roles.player}\n\n🌸 **田曦薇**：${script.roles.tianxiwei}\n\n🍃 **李一桐**：${script.roles.liyitong}\n\n---\n\n现在进入调查阶段。你可以随时向田曦薇和李一桐提问、讨论线索、提出推理。她们会按照各自的风格回应。`, timestamp: Date.now() + 300 },
      { id: "intro_4", sender: "田曦薇", text: `小唐来了！桐姐，你觉得这个案子从哪里开始查好噢？`, timestamp: Date.now() + 500 },
      { id: "intro_5", sender: "李一桐", text: `先从案发现场开始吧。时间、地点、死因——这三个是最基本的。然后我们再去问嫌疑人。`, timestamp: Date.now() + 700 },
    ];
    setMessages(introMsgs);
  }, [script]);

  const sendToAi = useCallback(async (userText: string) => {
    if (!script) return;
    setLoading(true);
    setDialogueCount((c) => c + 1);
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptId: script.id,
          round: currentRound,
          action: "chat",
          message: userText,
          history: messages.slice(-20).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });
      const data = await res.json();
      if (data.success && data.data.messages) {
        setMessages((prev) => [
          ...prev,
          ...data.data.messages.map((m: any) => ({
            id: `ai_${Date.now()}_${Math.random()}`,
            sender: m.sender,
            text: m.text,
            timestamp: Date.now(),
          })),
        ]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [script, currentRound, messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !script || loading) return;
    const userMsg = { id: `user_${Date.now()}`, sender: "你", text: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    await sendToAi(userMsg.text);
  }, [input, script, loading, sendToAi]);

  // Quick action buttons for investigation
  const quickActions = [
    { label: "调查案发现场", prompt: "我们先调查一下案发现场吧。死者是在哪里被发现的？现场有什么异常？" },
    { label: "确认死亡时间", prompt: "死者的死亡时间是什么时候？法医报告里有什么发现吗？" },
    { label: "询问不在场证明", prompt: "每个嫌疑人案发时在哪里？有没有人提供不在场证明？" },
    { label: "排查嫌疑人动机", prompt: "我们来梳理一下每个嫌疑人的作案动机。谁最有可能想害死者？" },
    { label: "分析关键线索", prompt: "目前我们手上有哪些关键线索？来整理一下。" },
    { label: "我的推理", prompt: "我有了一个推理方向，你们听听看合不合理..." },
  ];

  const handleQuickAction = (prompt: string) => {
    const userMsg = { id: `user_${Date.now()}`, sender: "你", text: prompt, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    sendToAi(prompt);
  };

  if (!script) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-[var(--text-muted)]">剧本未找到</p></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-panel mx-2 mt-2 px-3 py-2 flex items-center gap-2 flex-wrap">
        <Link href="/scripts" className="text-[var(--text-muted)] hover:text-[var(--accent-rose)] text-xs">← 剧本列表</Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm text-[var(--text-primary)] truncate">{script.title}</h1>
        </div>
        {gameStarted && <span className="text-[10px] text-[var(--text-muted)]">{dialogueCount}条对话</span>}
        {gameStarted && (
          <button onClick={() => setShowTruth(true)}
            className="text-[10px] px-2 py-1 rounded bg-rose-100 text-rose-600 dark:bg-rose-900/30">真相</button>
        )}
      </div>

      <div className="pt-16 flex h-screen">
        {/* Main area */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto px-2">
          {!gameStarted ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h2 className="text-2xl font-bold font-[var(--font-display)] mb-2">{script.title}</h2>
                <p className="text-sm text-[var(--text-muted)] mb-1">{script.inspiration}</p>
                <div className="glass-panel p-6 text-left max-w-lg mx-auto mb-4">
                  <h3 className="font-bold text-sm mb-2">背景</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{script.background}</p>
                </div>
                <div className="glass-panel p-6 text-left max-w-lg mx-auto mb-4">
                  <h3 className="font-bold text-sm mb-2">人物</h3>
                  <div className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                    {script.characters.map((c) => (
                      <p key={c.name}>· <strong>{c.name}</strong>{c.isVictim ? " 💀" : ""}：{c.description}</p>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="btn-primary text-lg px-8 py-3">开始推理</button>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 px-1">
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    {msg.sender === "系统" ? (
                      <div className="text-center py-2">
                        <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] inline-block px-3 py-2 rounded-lg leading-relaxed whitespace-pre-line text-left max-w-[90%]">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div className={`px-3 py-2 rounded-xl max-w-[80%] text-sm ${
                        msg.sender === "你" ? "bg-[#95EC69] text-gray-900 ml-auto"
                        : msg.sender === "田曦薇" ? "bg-rose-50 dark:bg-rose-900/20 text-gray-800 dark:text-gray-200 border border-rose-200 dark:border-rose-800/30"
                        : "bg-amber-50 dark:bg-amber-900/20 text-gray-800 dark:text-gray-200 border border-amber-200 dark:border-amber-800/30"
                      }`}>
                        <span className="text-[10px] font-bold">
                          {msg.sender === "田曦薇" ? "🌸 " : msg.sender === "李一桐" ? "🍃 " : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500">{msg.sender}</span>
                        <p className="mt-0.5 whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-1 px-4">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick actions */}
              <div className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={loading}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-rose)] transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="py-2 flex gap-2">
                <input type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`问田曦薇或李一桐... (共${dialogueCount}条对话)`}
                  className="input-field flex-1 text-sm" maxLength={300} />
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  className="btn-primary text-sm px-4 disabled:opacity-50">发送</button>
              </div>
            </>
          )}
        </div>

        {/* Clues sidebar */}
        {gameStarted && (
          <div className="hidden lg:block w-72 p-4 overflow-y-auto border-l border-[var(--border-color)]">
            <h3 className="font-bold text-sm mb-3">🔍 线索板 ({revealedClues.size}/{script.clues.length})</h3>
            {script.rounds.map((round, idx) => (
              <div key={idx} className="mb-4">
                <p className="text-[10px] font-bold text-[var(--text-muted)] mb-2">
                  {round.name} {idx <= currentRound ? "✅" : "🔒"}
                </p>
                {script.clues
                  .filter((c) => idx <= currentRound || revealedClues.has(c.id))
                  .map((clue) => (
                    <motion.div key={clue.id} initial={{ opacity: 0 }} animate={{ opacity: revealedClues.has(clue.id) ? 1 : 0.35 }}
                      className="p-2 mb-1.5 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      {revealedClues.has(clue.id) ? (
                        <>
                          <p className="font-bold text-[var(--accent-rose)]">{clue.name}</p>
                          <p className="text-[var(--text-secondary)] mt-1">{clue.description}</p>
                          <span className={`tag text-[9px] mt-1 ${clue.importance === "key" ? "bg-red-100 text-red-600" : clue.importance === "supporting" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"}`}>
                            {clue.importance === "key" ? "关键" : clue.importance === "supporting" ? "辅助" : "误导"}
                          </span>
                        </>
                      ) : (
                        <p className="text-[var(--text-muted)] italic">???</p>
                      )}
                    </motion.div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Truth modal */}
      <AnimatePresence>
        {showTruth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowTruth(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-[var(--accent-rose)] mb-4">🔎 真相揭露</h2>
              <div className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-color)]">
                <h3 className="font-bold text-sm mb-3">{script.title} - 真相</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{script.truth}</p>
              </div>
              <button onClick={() => setShowTruth(false)} className="btn-primary w-full mt-4">知道了</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
