"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: "petal" | "sparkle" | "light";
}

export default function SakuraParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const isDark = document.documentElement.classList.contains("dark");

    // Colors: cherry blossom pink palette
    const petalColors = ["#F472B6", "#F9A8D4", "#FCE7F3", "#EC4899", "#FBCFE8"];
    const sparkleColors = ["#FDE68A", "#FEF3C7", "#FFF", "#E0E7FF", "#FCE7F3"];
    const lightColors = ["rgba(244,114,182,0.6)", "rgba(192,132,252,0.4)", "rgba(249,168,212,0.5)"];

    const particles: Particle[] = [];
    const maxParticles = 80;

    const createParticle = (): Particle => {
      const typeRand = Math.random();
      return {
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        size: 3 + Math.random() * 12,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: 0.8 + Math.random() * 2.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.3 + Math.random() * 0.7,
        type: typeRand < 0.7 ? "petal" : typeRand < 0.95 ? "sparkle" : "light",
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    let animId: number;

    const drawPetal = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      const color = petalColors[Math.floor(Math.random() * petalColors.length)];

      // Draw sakura petal shape
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.5, -s * 0.3, s, -s * 0.1, s * 0.7, s * 0.2);
      ctx.bezierCurveTo(s * 0.4, s * 0.1, s * 0.2, s * 0.3, 0, s * 0.1);
      ctx.bezierCurveTo(-s * 0.2, s * 0.3, -s * 0.4, s * 0.1, -s * 0.7, s * 0.2);
      ctx.bezierCurveTo(-s, -s * 0.1, -s * 0.5, -s * 0.3, 0, 0);
      ctx.fillStyle = color;
      ctx.fill();

      // Small center detail
      ctx.beginPath();
      ctx.arc(0, s * 0.1, s * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();

      ctx.restore();
    };

    const drawSparkle = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      gradient.addColorStop(0, "rgba(255,255,255,0.9)");
      gradient.addColorStop(0.3, "rgba(253,232,138,0.6)");
      gradient.addColorStop(1, "rgba(249,168,212,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Cross sparkle
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      const r = p.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
      ctx.moveTo(0, -r); ctx.lineTo(0, r);
      ctx.stroke();

      ctx.restore();
    };

    const drawLight = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.opacity * 0.15;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, "rgba(244,114,182,0.3)");
      gradient.addColorStop(1, "rgba(192,132,252,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.opacity += (Math.random() - 0.5) * 0.005;
        p.opacity = Math.max(0.1, Math.min(1, p.opacity));

        if (p.type === "petal") drawPetal(p);
        else if (p.type === "sparkle") drawSparkle(p);
        else drawLight(p);

        // Reset when off screen
        if (p.y > canvas.height + 30 || p.x < -50 || p.x > canvas.width + 50) {
          p.x = Math.random() * canvas.width;
          p.y = -20 - Math.random() * 100;
          p.opacity = 0.3 + Math.random() * 0.7;
          p.size = 3 + Math.random() * 12;
          p.rotation = Math.random() * Math.PI * 2;
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}