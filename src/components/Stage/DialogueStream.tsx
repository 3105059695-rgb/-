"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import SpeechButton from "@/components/UI/SpeechButton";
import type { DialogueLine } from "@/types";

export default function DialogueStream() {
  const { dialogues, isLoading } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  }, [dialogues]);

  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dialogues, shouldAutoScroll]);

  if (dialogues.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center"
        >
          <p className="text-4xl mb-2">🚪</p>
          <p className="text-sm text-[var(--text-muted)] font-[var(--font-display)]">
            她们的故事即将开始...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 py-4 max-h-[60vh] overflow-y-auto"
    >
      <AnimatePresence>
        {dialogues.map((line, index) => (
          <DialogueBubble
            key={line.id || index}
            line={line}
            isLatest={index === dialogues.length - 1}
          />
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}

function DialogueBubble({
  line,
  isLatest,
}: {
  line: DialogueLine;
  isLatest: boolean;
}) {
  const isTian = line.character === "tianxiwei";
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(isLatest);

  useEffect(() => {
    if (!isLatest) {
      setDisplayText(line.text);
      setIsTyping(false);
      return;
    }

    let index = 0;
    setDisplayText("");
    setIsTyping(true);
    const timer = setInterval(() => {
      if (index < line.text.length) {
        setDisplayText(line.text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [line.text, line.id, isLatest]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex ${isTian ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] ${
          isTian
            ? "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200/50 dark:border-rose-800/30"
            : "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200/50 dark:border-amber-800/30"
        } rounded-2xl px-4 py-2.5 border shadow-sm`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-[var(--text-muted)] flex items-center gap-1.5">
            <img src={isTian ? "/tianxiwei.jpg" : "/liyitong.jpg"} alt="" className="w-4 h-4 rounded-full inline-block" />
            {isTian ? "田曦薇" : "李一桐"}
          </span>
          {line.emotion && (
            <span className="text-[10px] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-full text-[var(--text-muted)]">
              {line.emotion}
            </span>
          )}
          {!isTyping && (
            <SpeechButton text={displayText} character={isTian ? "tianxiwei" : "liyitong"} />
          )}
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {displayText}
          {isTyping && <span className="inline-block w-0.5 h-3.5 bg-[var(--accent-rose)] animate-pulse ml-0.5 align-middle" />}
        </p>
        {line.action && !isTyping && (
          <p className="text-[11px] text-[var(--text-muted)] italic mt-0.5">
            {line.action}
          </p>
        )}
        {line.innerOS && !isTyping && (
          <p className="text-[10px] text-[var(--text-muted)] italic mt-1 opacity-70">
            💭 {line.innerOS}
          </p>
        )}
      </div>
    </motion.div>
  );
}
