"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Room9Event {
  id: string;
  type: "system" | "narration" | "tianxiwei" | "liyitong" | "user" | "completion";
  text?: string;
  innerOS?: string;
  emotion?: string;
  action?: string;
  timestamp: number;
}

// ========== 血色粒子背景 ==========
function BloodyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 暗红渐变底 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0101] via-[#120303] to-[#1a0404]" />
      {/* 闪烁的血色光晕 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-900/10 blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-red-800/8 blur-3xl animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      {/* 墙壁裂缝 */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,0,0,0.3) 2px, rgba(139,0,0,0.3) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(80,0,0,0.2) 1px, rgba(80,0,0,0.2) 3px)`
        }} />
      {/* 滴血效果 */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={`blood${i}`}
          className="absolute w-0.5 bg-red-800/30 rounded-full"
          style={{
            left: `${15 + i * 14}%`,
            top: -20,
            height: `${30 + Math.random() * 40}px`,
          }}
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 4 + i * 1.5, repeat: Infinity, ease: "linear", delay: i * 2 }}
        />
      ))}
      {/* 电视雪花闪烁 */}
      <motion.div className="absolute inset-0 bg-white/[0.01]"
        animate={{ opacity: [0, 0.02, 0, 0.03, 0, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  );
}

// ========== BGM - Web Audio 暗黑纯音乐 ==========
function BGMToggle() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const startBGM = () => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.08;
    master.connect(ctx.destination);

    // 低频铺垫
    const bass = ctx.createOscillator();
    bass.type = "sine"; bass.frequency.value = 41.2;
    const bg = ctx.createGain(); bg.gain.value = 0.3;
    bass.connect(bg); bg.connect(master); bass.start();

    // 暗黑钢琴旋律循环 (使用三角波模拟)
    const notes = [55, 65.4, 73.4, 82.4, 73.4, 65.4, 55, 49]; // A2-C#3-F#3-A3-F#3-C#3-A2-G2
    const noteLen = 2.5;
    let noteIdx = 0;

    const melody = ctx.createOscillator();
    melody.type = "triangle";
    const mg = ctx.createGain(); mg.gain.value = 0.25;
    const mfilter = ctx.createBiquadFilter();
    mfilter.type = "lowpass"; mfilter.frequency.value = 800; mfilter.Q.value = 1.5;
    melody.connect(mfilter); mfilter.connect(mg); mg.connect(master);
    melody.start();

    const playNote = () => {
      melody.frequency.value = notes[noteIdx % notes.length];
      mg.gain.setTargetAtTime(0.25, ctx.currentTime + 0.05, 0.3);
      mg.gain.setTargetAtTime(0.01, ctx.currentTime + noteLen * 0.85, 0.5);
      noteIdx++;
      setTimeout(playNote, noteLen * 1000);
    };
    playNote();

    // 弦乐pad层
    const pad = ctx.createOscillator();
    pad.type = "sawtooth"; pad.frequency.value = 110;
    const pg = ctx.createGain(); pg.gain.value = 0.04;
    const pfilter = ctx.createBiquadFilter();
    pfilter.type = "lowpass"; pfilter.frequency.value = 300;
    pad.connect(pfilter); pfilter.connect(pg); pg.connect(master);
    pad.start();
    setInterval(() => { pad.frequency.value = 108 + Math.sin(Date.now() * 0.0002) * 4; }, 300);

    // 雨声 / 风声
    const bufSize = ctx.sampleRate * 6;
    const nb = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = nb; noise.loop = true;
    const ng = ctx.createGain(); ng.gain.value = 0.03;
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass"; nf.frequency.value = 600; nf.Q.value = 0.3;
    noise.connect(nf); nf.connect(ng); ng.connect(master);
    noise.start();

    // 高音点缀 (玻璃/铃铛声)
    const bell = ctx.createOscillator();
    bell.type = "sine"; bell.frequency.value = 1760;
    const blg = ctx.createGain(); blg.gain.value = 0;
    bell.connect(blg); blg.connect(master);
    bell.start();
    setInterval(() => {
      if (Math.random() > 0.7) {
        bell.frequency.value = 1200 + Math.random() * 800;
        blg.gain.setTargetAtTime(0.06, ctx.currentTime, 0.01);
        blg.gain.setTargetAtTime(0, ctx.currentTime + 0.8, 0.4);
      }
    }, 2500);
  };

  const stopBGM = () => {
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
  };

  const toggle = () => {
    if (playing) { stopBGM(); setPlaying(false); }
    else { startBGM(); setPlaying(true); }
  };
  useEffect(() => { return () => stopBGM(); }, []);

  return (
    <button onClick={toggle}
      className={`px-2.5 py-1 rounded text-xs border transition-all tracking-wider font-[var(--font-display)] ${
        playing ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-red-900/20 bg-transparent text-red-400/25 hover:text-red-400/50"
      }`}>
      {playing ? "🎵 ON" : "🔇 OFF"}
    </button>
  );
}

// ========== 主页面 ==========
export default function Room9Page() {
  const [events, setEvents] = useState<Room9Event[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(20);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  useEffect(() => { scrollToBottom(); }, [events]);
  useEffect(() => { if (initialized && !loading) inputRef.current?.focus(); }, [initialized, loading]);

  const initRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/room9/free", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init" })
      });
      const data = await res.json();
      if (data.success) {
        const evts: Room9Event[] = [
          { id: "sys_0", type: "system", text: "┌───────────────────────────────┐\n│   █ 九 号 房 间 · ROOM 9 █   │\n│   实验体A：田曦薇             │\n│   实验体B：李一桐             │\n│   当前积分：20                │\n│                               │\n│   输入指令 · 发布任务         │\n│   操控角色 · 任意场景         │\n│   角色铁律不可破               │\n└───────────────────────────────┘", timestamp: Date.now() }
        ];
        if (data.systemMessage) evts.push({ id: "sys_1", type: "system", text: data.systemMessage, timestamp: Date.now() });
        if (data.narration) evts.push({ id: "nar_0", type: "narration", text: data.narration, timestamp: Date.now() });
        if (data.dialogues) data.dialogues.forEach((d: any, i: number) => evts.push({
          id: `dlg_0_${i}`, type: d.character, text: d.text, innerOS: d.innerOS, emotion: d.emotion, action: d.action, timestamp: Date.now() + i
        }));
        if (data.completion) evts.push({ id: "comp_0", type: "completion", text: data.completion, timestamp: Date.now() });
        if (data.points) setPoints(data.points);
        setEvents(evts);
        historyRef.current = [{ role: "system", content: "九号房间初始化" }];
        setInitialized(true);
      }
    } catch {
      setEvents([{ id: "err", type: "system", text: "⚠ 无法连接九号房间", timestamp: Date.now() }]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    setLoading(true);
    const userEvt: Room9Event = { id: `usr_${Date.now()}`, type: "user", text: trimmed, timestamp: Date.now() };
    setEvents(p => [...p, userEvt]);
    try {
      const res = await fetch("/api/room9/free", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "interact", userInput: trimmed, points, history: historyRef.current.slice(-30) })
      });
      const data = await res.json();
      if (data.success) {
        const newEvts: Room9Event[] = [];
        if (data.systemMessage) newEvts.push({ id: `sys_${Date.now()}`, type: "system", text: data.systemMessage, timestamp: Date.now() });
        if (data.narration) newEvts.push({ id: `nar_${Date.now()}`, type: "narration", text: data.narration, timestamp: Date.now() });
        if (data.dialogues) data.dialogues.forEach((d: any, i: number) => newEvts.push({
          id: `dlg_${Date.now()}_${i}`, type: d.character, text: d.text, innerOS: d.innerOS, emotion: d.emotion, action: d.action, timestamp: Date.now() + i
        }));
        if (data.completion) newEvts.push({ id: `comp_${Date.now()}`, type: "completion", text: data.completion, timestamp: Date.now() });
        if (data.points !== undefined) setPoints(data.points);
        historyRef.current = [...historyRef.current, { role: "user", content: trimmed }, { role: "assistant", content: "已生成" }].slice(-40);
        setEvents(p => [...p, ...newEvts]);
      }
    } catch {
      setEvents(p => [...p, { id: `err_${Date.now()}`, type: "system", text: "⚠ 房间没有响应...", timestamp: Date.now() }]);
    }
    setLoading(false);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0101] relative">
        <BloodyBackground />
        <div className="text-center relative z-10">
          <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-9xl mb-10 drop-shadow-[0_0_30px_rgba(255,0,0,0.3)]">
            🚪
          </motion.div>
          <p className="text-red-400/50 text-2xl mb-10 font-[var(--font-display)] tracking-widest">九 号 房 间</p>
          <button onClick={initRoom} disabled={loading}
            className="px-14 py-5 bg-red-900/20 border border-red-700/30 text-red-400/80 rounded-lg hover:bg-red-900/30 hover:border-red-600/50 hover:text-red-300 transition-all text-xl disabled:opacity-20 font-[var(--font-display)] tracking-wider">
            {loading ? "连 接 中 ..." : "进 入 九 号 房 间"}
          </button>
        </div>
    </div>
  );
}

  return (
    <>
    <div className="min-h-screen text-white flex flex-col relative">
      <BloodyBackground />

      {/* 顶部 */}
      <header className="relative z-10 shrink-0 px-5 py-4 flex items-center justify-between bg-[#0a0101]/95 backdrop-blur-sm border-b border-red-900/20">
        <Link href="/" className="text-red-400/40 hover:text-red-400/70 text-sm transition-colors tracking-wider">← 退 出</Link>
        <div className="flex items-center gap-4">
          <BGMToggle />
          <span className="text-red-400/15 text-xs">|</span>
          <span className="text-red-400/30 text-xs tracking-wider">积分</span>
          <motion.span key={points} initial={{ scale: 1.5, color: "#ef4444" }} animate={{ scale: 1, color: "#f87171" }}
            className="font-bold text-xl tracking-wider">{points}</motion.span>
          <span className="text-red-400/15 text-xs">/100</span>
          <span className="text-red-400/15 text-xs">|</span>
          <span className="text-red-400/20 text-xs">对话 {events.filter(e => e.type === "tianxiwei" || e.type === "liyitong").length} 条</span>
        </div>
        <button onClick={initRoom} className="text-red-400/20 hover:text-red-400/40 text-xs tracking-wider">重 置</button>
      </header>

      {/* 消息区 */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {events.map((evt) => {
            if (evt.type === "system") return (
              <motion.div key={evt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="whitespace-pre-wrap font-mono text-sm text-red-400/50 leading-relaxed py-3 border-b border-red-900/15">
                {evt.text}
              </motion.div>
            );
            if (evt.type === "narration") return (
              <motion.div key={evt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-4 border-b border-red-900/10 mb-3">
                <p className="text-red-300/30 text-sm italic leading-relaxed tracking-wide font-[var(--font-display)]">{evt.text}</p>
              </motion.div>
            );
            if (evt.type === "completion") return (
              <motion.div key={evt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="my-5 p-5 rounded-xl bg-red-900/10 border border-red-800/20 text-center">
                <p className="text-red-300/50 text-sm leading-relaxed tracking-wide font-[var(--font-display)]">{evt.text}</p>
              </motion.div>
            );
            if (evt.type === "user") return (
              <motion.div key={evt.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end pt-3">
                <div className="max-w-[80%] px-5 py-3 rounded-2xl rounded-tr-sm bg-red-900/10 border border-red-800/20">
                  <p className="text-red-300/60 text-base">{evt.text}</p>
                </div>
              </motion.div>
            );
            const isTian = evt.type === "tianxiwei";
            return (
              <motion.div key={evt.id} initial={{ opacity: 0, x: isTian ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${isTian ? "items-start" : "items-end"} mt-2`}>
                <span className={`text-xs mb-1 flex items-center gap-2 tracking-wider ${isTian ? "text-rose-400/70" : "text-amber-400/70"}`}>
                  {isTian ? "田曦薇" : "李一桐"}
                  {evt.emotion && <span className="text-red-400/20">· {evt.emotion}</span>}
                </span>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl ${
                  isTian
                    ? "bg-rose-500/6 border border-rose-500/12 rounded-tl-sm"
                    : "bg-amber-500/6 border border-amber-500/12 rounded-tr-sm"
                }`}>
                  {evt.action && <p className="text-red-300/20 text-xs italic mb-2">{evt.action}</p>}
                  <p className="text-white/80 text-base leading-relaxed">{evt.text}</p>
                  {evt.innerOS && (
                    <p className={`text-xs mt-3 pt-3 border-t ${isTian ? "text-rose-300/30 border-rose-300/8" : "text-amber-300/30 border-amber-300/8"} italic leading-relaxed`}>
                      💭 {evt.innerOS}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-5 pl-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600/50 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 animate-pulse" style={{ animationDelay: "0.2s" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
              <span className="text-red-400/25 text-sm ml-2 tracking-wider">生成长篇互动中...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区 */}
      <div className="relative z-10 shrink-0 px-4 py-4 bg-[#0a0101]/95 backdrop-blur-sm border-t border-red-900/20">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && input.trim()) { e.preventDefault(); handleSend(); } }}
            placeholder="输入指令、任务、场景描述..."
            disabled={loading}
            className="flex-1 bg-red-900/10 border border-red-800/20 rounded-lg px-5 py-4 text-base text-red-300/80 placeholder:text-red-400/15 focus:outline-none focus:border-red-700/40 transition-colors disabled:opacity-20 tracking-wide font-[var(--font-display)]" />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="px-8 py-4 bg-red-900/15 border border-red-700/25 text-red-400/60 rounded-lg hover:bg-red-900/25 hover:text-red-300/80 transition-all disabled:opacity-10 text-base tracking-widest font-[var(--font-display)] shrink-0">
            发 送
          </button>
        </div>
      </div>
    </div>  </>
  );
}
