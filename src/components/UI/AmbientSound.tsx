"use client";

import { useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { useAppStore } from "@/lib/store";

interface SoundProfile {
  id: string;
  type: "rain" | "cafe" | "night" | "morning" | "outdoor" | "fireplace";
  volume: number;
}

const AMBIENT_PRESETS: Record<string, SoundProfile> = {
  rain: { id: "rain", type: "rain", volume: 0.3 },
  rainy_cafe: { id: "rain", type: "rain", volume: 0.25 },
  late_night_sofa: { id: "night", type: "night", volume: 0.2 },
  night_routine: { id: "night", type: "night", volume: 0.2 },
  morning_routine: { id: "morning", type: "morning", volume: 0.3 },
  outdoor: { id: "outdoor", type: "outdoor", volume: 0.25 },
  home: { id: "fireplace", type: "fireplace", volume: 0.15 },
  kitchen: { id: "fireplace", type: "fireplace", volume: 0.15 },
};

export default function AmbientSound() {
  const { scene, isRaining, isDarkMode } = useAppStore();
  const currentSound = useRef<Howl | null>(null);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const getPresetForScene = useCallback((): SoundProfile | null => {
    if (isRaining) return AMBIENT_PRESETS.rain;
    return AMBIENT_PRESETS[scene] || null;
  }, [scene, isRaining]);

  const generateRainNoise = useCallback((): Howl => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 10;
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    let lowPassData = new Float32Array(length);
    let prev = 0;
    const alpha = 0.02;
    for (let i = 0; i < length; i++) {
      prev = prev + alpha * (data[i] - prev);
      lowPassData[i] = prev * 2;
    }

    let brownNoise = new Float32Array(length);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      brownNoise[i] = lastOut * 3;
    }

    for (let i = 0; i < length; i++) {
      data[i] = lowPassData[i] * 0.6 + brownNoise[i] * 0.4;
    }

    const wavBuffer = audioBufferToWav(buffer);
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const howl = new Howl({
      src: [url],
      loop: true,
      volume: 0.25,
      format: ["wav"],
      onend: () => URL.revokeObjectURL(url),
    });

    return howl;
  }, []);

  const generateCricketNoise = useCallback((): Howl => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 4;
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 4000 * t) * Math.sin(2 * Math.PI * 30 * t) * 0.02
        + (Math.random() * 2 - 1) * 0.005;
    }

    const wavBuffer = audioBufferToWav(buffer);
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    return new Howl({
      src: [url],
      loop: true,
      volume: 0.15,
      format: ["wav"],
      onend: () => URL.revokeObjectURL(url),
    });
  }, []);

  useEffect(() => {
    const preset = getPresetForScene();

    if (currentSound.current) {
      const old = currentSound.current;
      old.fade(old.volume(), 0, 2000);
      setTimeout(() => {
        old.unload();
      }, 2500);
      currentSound.current = null;
    }

    if (!preset) return;

    let newSound: Howl;

    switch (preset.type) {
      case "rain":
        newSound = generateRainNoise();
        break;
      case "night":
        newSound = generateCricketNoise();
        break;
      default:
        return;
    }

    newSound.volume(0);
    newSound.play();
    newSound.fade(0, preset.volume, 2000);
    currentSound.current = newSound;

    return () => {
      if (currentSound.current) {
        currentSound.current.unload();
        currentSound.current = null;
      }
    };
  }, [scene, isRaining, getPresetForScene, generateRainNoise, generateCricketNoise]);

  return null;
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;

  const data = buffer.getChannelData(0);
  const dataLength = data.length * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return arrayBuffer;
}
