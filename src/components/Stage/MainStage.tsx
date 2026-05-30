"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import TianPanel from "./TianPanel";
import LitongPanel from "./LitongPanel";
import DialogueStream from "./DialogueStream";
import DanmakuLayer from "./Danmaku";
import type { ChatResponse, InteractionMode, SceneType } from "@/types";

const DAY_CYCLE_MS = 600000;

const SCENE_CYCLE: SceneType[] = [
  "morning_routine",
  "set",
  "set_break",
  "shopping",
  "kitchen",
  "night_routine",
  "video_call",
  "late_night_sofa",
  "apart",
  "airport",
  "home",
  "weibo",
  "outdoor",
  "rainy_cafe",
  "inference_club",
  "hotel_room",
];

export default function MainStage() {
  const {
    setMode, scene, setScene, appendDialogues, setInnerOS,
    addDanmaku, isLoading, setLoading, addBondMoment, updateStats,
    isRaining, setRaining, clearDialogues,
  } = useAppStore();

  const [danmakuText, setDanmakuText] = useState("");
  const [chatText, setChatText] = useState("");
  const [activeMode, setActiveMode] = useState<InteractionMode>("observe");
  const [dayCount, setDayCount] = useState(1);
  const [sceneIdx, setSceneIdx] = useState(0);
  const sceneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDialogue = useCallback(async (params?: { mode?: InteractionMode; message?: string; forceScene?: SceneType }) => {
    setLoading(true);
    const currentScene = params?.forceScene || scene;
    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: params?.mode || "observe",
          scene: currentScene,
          userMessage: params?.message || undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        const data: ChatResponse = result.data;
        appendDialogues(data.dialogues);
        if (data.innerOS) setInnerOS(data.innerOS);
        if (data.sceneUpdate) {
          setScene(data.sceneUpdate.scene, data.sceneUpdate.description, data.sceneUpdate.mood);
        }
        if (data.bondMoment) {
          addBondMoment({
            id: `bm_${Date.now()}`,
            title: data.bondMoment.title,
            description: data.bondMoment.description,
            sceneDescription: data.sceneUpdate?.description,
            moodTags: ["甜蜜"],
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch dialogue:", err);
    }
    setLoading(false);
  }, [scene, appendDialogues, setInnerOS, setScene, addBondMoment, setLoading]);

  // Day cycle
  useEffect(() => {
    const advanceDayAndScene = () => {
      setDayCount((d) => d + 1);
      setSceneIdx((i) => (i + 1) % SCENE_CYCLE.length);
    };
    sceneTimerRef.current = setInterval(advanceDayAndScene, DAY_CYCLE_MS);
    return () => { if (sceneTimerRef.current) clearInterval(sceneTimerRef.current); };
  }, []);

  // Scene advance
  useEffect(() => {
    if (sceneIdx > 0 || dayCount > 1) {
      const newScene = SCENE_CYCLE[sceneIdx];
      const sameAsCurrent = newScene === scene;
      const weatherEffects = ["rainy_cafe", "rain"];
      const isRain = weatherEffects.includes(newScene);
      setScene(newScene);
      if (isRain) setRaining(true);
      else setRaining(false);
      if (!sameAsCurrent) {
        setTimeout(() => fetchDialogue({ mode: "observe", forceScene: newScene }), 500);
      }
    }
  }, [sceneIdx, dayCount]);

  // Initial fetch
  useEffect(() => {
    fetchDialogue({ mode: "observe" });
  }, []);

  // Interval fetch
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeMode === "observe" && !isLoading) {
        fetchDialogue({ mode: "observe" });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [activeMode, fetchDialogue, isLoading]);

  const handleDanmaku = () => {
    if (!danmakuText.trim()) return;
    addDanmaku(danmakuText);
    fetchDialogue({ mode: "danmaku", message: danmakuText });
    setDanmakuText("");
  };

  const handleJoinChat = () => {
    if (!chatText.trim()) return;
    setActiveMode("chat");
    setMode("chat");
    fetchDialogue({ mode: "chat", message: chatText });
    setChatText("");
  };

  const handleObserve = () => {
    setActiveMode("observe");
    setMode("observe");
    fetchDialogue({ mode: "observe" });
  };

  const isNight = ["late_night_sofa", "night_routine", "video_call", "hotel_room"].includes(scene);

  return (
    <main className="pt-20 pb-32 px-2 sm:px-4 min-h-screen">
      {isRaining && <RainEffect />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-3 text-center"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel text-sm">
          <span className={`font-bold ${isNight ? "text-indigo-400" : "text-amber-500"}`}>
            {isNight ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
          </span>
          <span className="font-bold text-[var(--text-primary)]">Day {dayCount}</span>
          <span className="text-[var(--text-muted)]">|</span>
          <span className="text-[var(--accent-rose)]">{scene}</span>
          <span className="text-[var(--text-muted)] text-xs">
            · {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 max-w-7xl mx-auto">
        <div className="w-full lg:w-1/4 order-2 lg:order-1">
          <TianPanel />
        </div>
        <div className="flex-1 order-1 lg:order-2 min-h-[400px]">
          <div className="glass-panel p-4 h-full flex flex-col">
            <DanmakuLayer />
            <div className="flex-1 overflow-y-auto">
              <DialogueStream />
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 py-2 text-[var(--text-muted)] text-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                正在生成...
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/4 order-3">
          <LitongPanel />
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40">
        <div className="glass-panel mx-2 mb-2 px-3 py-2 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 mr-2">
            <button onClick={handleObserve} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              activeMode === "observe" ? "bg-[var(--accent-gold)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            }`}>偷看</button>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <input type="text" placeholder="发弹幕飘过去..." value={danmakuText}
              onChange={(e) => setDanmakuText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDanmaku()}
              className="input-field flex-1 text-xs py-1.5" maxLength={50} />
            <button onClick={handleDanmaku} disabled={!danmakuText.trim()}
              className="btn-secondary text-xs px-2 py-1.5 disabled:opacity-50">发送</button>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <input type="text" placeholder="推门说句话..." value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinChat()}
              className="input-field text-xs py-1.5 w-24 sm:w-32" maxLength={100} />
            <button onClick={handleJoinChat} disabled={!chatText.trim()}
              className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50 whitespace-nowrap">推门</button>
          </div>
        </div>
      </footer>
    </main>
  );
}

function RainEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="absolute w-[2px] bg-gradient-to-b from-transparent via-blue-300/30 to-blue-400/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -100}px`,
            height: `${10 + Math.random() * 30}px`,
            animation: `rainDrop ${0.5 + Math.random()}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }} />
      ))}
    </div>
  );
}