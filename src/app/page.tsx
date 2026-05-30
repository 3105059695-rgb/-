"use client";

import { useEffect } from "react";
import Header from "@/components/Layout/Header";
import MainStage from "@/components/Stage/MainStage";
import AmbientSound from "@/components/UI/AmbientSound";
import ParticleEffect from "@/components/UI/ParticleEffect";
import SakuraParticles from "@/components/UI/SakuraParticles";
import MoonBunny from "@/components/UI/MoonBunny";
import ChibiDuo from "@/components/UI/ChibiDuo";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { setDarkMode, setUser } = useAppStore();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) {
      setDarkMode(true);
    }

    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data.user.id, data.data.user.nickname);
        } else {
          fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "anonymous" }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                setUser(d.data.user.id, d.data.user.nickname);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />

      <SakuraParticles />

      <AmbientSound />
      <ParticleEffect />

      <ChibiDuo />
      <MoonBunny />

      <Header />
      <MainStage />
    </>
  );
}