"use client";

import { useState, useCallback, useRef } from "react";

interface SpeechButtonProps {
  text: string;
  character: "tianxiwei" | "liyitong";
  className?: string;
}

const VOICE_CONFIG: Record<string, { voice: string; rate: number; pitch: number }> = {
  tianxiwei: { voice: "zh-CN-XiaoxiaoNeural", rate: 1.15, pitch: 1.2 },
  liyitong: { voice: "zh-CN-XiaoyiNeural", rate: 0.9, pitch: 0.95 },
};

export default function SpeechButton({ text, character, className }: SpeechButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = character === "tianxiwei" ? 1.1 : 0.85;
    utterance.pitch = character === "tianxiwei" ? 1.25 : 1.0;
    utterance.volume = 0.9;

    const config = VOICE_CONFIG[character];
    if (config) {
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
    }

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Xiaoxiao") || v.name.includes("Xiaoyi") || v.lang === "zh-CN"
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, character]);

  return (
    <button
      onClick={speak}
      disabled={speaking}
      className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-all ${
        speaking
          ? "bg-rose-100 text-rose-500 animate-pulse"
          : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-rose-100 hover:text-rose-500"
      } ${className || ""}`}
      title={speaking ? "播放中..." : "点击播放语音"}
    >
      {speaking ? "🔊" : "🔈"}
    </button>
  );
}

// Preload voices
export function preloadVoices() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
