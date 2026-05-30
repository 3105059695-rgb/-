"use client";

import { useCallback, useEffect, useState } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine, ISourceOptions } from "@tsparticles/engine";
import { useAppStore } from "@/lib/store";

const HEARTS_CONFIG: ISourceOptions = {
  fullScreen: { enable: true, zIndex: 5 },
  particles: {
    number: { value: 0 },
    color: { value: ["#F47285", "#FB7185", "#F43F5E", "#FDA4AF", "#FECDD3"] },
    shape: { type: "heart" },
    opacity: {
      value: { min: 0.3, max: 0.8 },
      animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false },
    },
    size: {
      value: { min: 8, max: 22 },
      animation: { enable: true, speed: 2, minimumValue: 4, sync: false },
    },
    move: {
      enable: true,
      speed: { min: 1, max: 3 },
      direction: "top" as const,
      straight: false,
      outModes: { default: "out" as const },
      gravity: { enable: true, acceleration: 0.5 },
    },
    life: {
      duration: { value: { min: 3, max: 8 } },
      count: 1,
    },
    rotate: {
      value: { min: -30, max: 30 },
      animation: { enable: true, speed: 2, sync: false },
    },
    tilt: {
      value: { min: -20, max: 20 },
      animation: { enable: true, speed: 1, sync: false },
    },
    wobble: {
      distance: 5,
      enable: true,
      speed: { min: -5, max: 5 },
    },
  },
  emitters: [
    {
      direction: "top" as const,
      position: { x: 50, y: 100 },
      rate: { delay: 0.15, quantity: 3 },
      size: { width: 80, height: 10 },
      life: { duration: 6, count: 0 },
    },
  ],
  detectRetina: true,
};

const SPARKLE_CONFIG: ISourceOptions = {
  fullScreen: { enable: true, zIndex: 4 },
  particles: {
    number: { value: 0 },
    color: { value: ["#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7", "#FFFBEB"] },
    shape: { type: "circle" },
    opacity: {
      value: { min: 0.1, max: 0.6 },
      animation: { enable: true, speed: 0.5, minimumValue: 0.05, sync: false },
    },
    size: {
      value: { min: 1, max: 4 },
      animation: { enable: true, speed: 1, minimumValue: 0.5, sync: false },
    },
    move: {
      enable: true,
      speed: { min: 0.2, max: 0.8 },
      direction: "none" as const,
      straight: false,
      outModes: { default: "out" as const },
    },
    life: {
      duration: { value: { min: 3, max: 6 } },
      count: 1,
    },
    twinkle: {
      particles: { enable: true, frequency: 0.05, opacity: 0.8 },
    },
  },
  emitters: [
    {
      direction: "none" as const,
      position: { x: 50, y: 50 },
      rate: { delay: 0.3, quantity: 2 },
      size: { width: 100, height: 100 },
      life: { duration: 0, count: 0 },
      spawnColor: { value: "#FBBF24", animation: { enable: true, speed: 8 } },
    },
  ],
  detectRetina: true,
};

export default function ParticleEffect() {
  const { dialogues, bondMoments } = useAppStore();
  const [showHearts, setShowHearts] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const initEngine = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) container.refresh();
  }, []);

  useEffect(() => {
    if (bondMoments.length > 0) {
      setShowHearts(true);
      const timer = setTimeout(() => setShowHearts(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [bondMoments.length]);

  useEffect(() => {
    if (dialogues.length === 0) return;
    const latest = dialogues[dialogues.length - 1];
    if (!latest) return;
    const sweetWords = ["喜欢", "可爱", "好看", "抱", "好", "在", "陪你", "暖暖"];
    if (sweetWords.some((w) => latest.text?.includes(w))) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [dialogues]);

  return (
    <ParticlesProvider init={initEngine}>
      {showHearts && (
        <Particles
          id="tsparticles-hearts"
          particlesLoaded={particlesLoaded}
          options={HEARTS_CONFIG}
        />
      )}
      {showSparkles && (
        <Particles
          id="tsparticles-sparkles"
          particlesLoaded={particlesLoaded}
          options={SPARKLE_CONFIG}
        />
      )}
    </ParticlesProvider>
  );
}
