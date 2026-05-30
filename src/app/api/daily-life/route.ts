// ==========================================
// /api/daily-life - 离线定时生成CP日常
// 由 Vercel Cron Jobs 定时触发
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { generateDialogue } from "@/lib/deepseek";
import { retrieveMemoryContext, processDialogueForMemories, rememberImportantEvent } from "@/lib/memory";
import { storeEvent, storeBondMoment } from "@/lib/db";
import type { SceneType } from "@/types";

function getCurrentTimeSlot(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "清晨";
  if (hour >= 8 && hour < 12) return "上午";
  if (hour >= 12 && hour < 14) return "中午";
  if (hour >= 14 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  if (hour >= 20 && hour < 23) return "晚上";
  return "深夜";
}

function pickDailyScene(timeSlot: string): SceneType {
  const sceneMap: Record<string, SceneType[]> = {
    "清晨": ["morning_routine", "kitchen", "home"],
    "上午": ["set", "outdoor", "home"],
    "中午": ["kitchen", "home", "set"],
    "下午": ["rainy_cafe", "shopping", "set", "inference_club"],
    "傍晚": ["kitchen", "outdoor", "home"],
    "晚上": ["night_routine", "late_night_sofa", "home"],
    "深夜": ["late_night_sofa", "night_routine", "home"],
  };

  const options = sceneMap[timeSlot] || ["home"];
  return options[Math.floor(Math.random() * options.length)];
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "未授权" },
      { status: 401 }
    );
  }

  try {
    const timeSlot = getCurrentTimeSlot();
    const scene = pickDailyScene(timeSlot);
    const weather = ["晴天", "晴天", "多云", "毛毛雨", "晴天"][Math.floor(Math.random() * 5)];

    const query = `日常生成：${timeSlot} - ${scene}`;
    const memories = await retrieveMemoryContext(query).catch(() => "（暂无相关记忆）");

    const response = await generateDialogue({
      mode: "observe",
      scene,
      timeOfDay: timeSlot,
      weather,
      memories,
    });

    await storeEvent(
      scene,
      "observe",
      response.dialogues,
      response.innerOS,
      undefined,
      `[自动生成] ${timeSlot} - ${scene}`
    ).catch(() => {});

    if (response.bondMoment) {
      await storeBondMoment(
        response.bondMoment.title,
        response.bondMoment.description,
        response.sceneUpdate?.description,
        response.dialogues,
        ["日常", "自动生成"]
      ).catch(() => {});
    }

    await processDialogueForMemories(response.dialogues, "observe").catch(() => {});

    const summary = response.dialogues.map((d) => `${d.character === "tianxiwei" ? "薇" : "桐"}: ${d.text}`).join(" | ");
    await rememberImportantEvent("dual", `[${timeSlot}][${scene}] ${summary}`, 5).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        timeSlot,
        scene,
        weather,
        dialogueCount: response.dialogues.length,
        hasBondMoment: !!response.bondMoment,
        summary,
      },
    });
  } catch (error: any) {
    console.error("Daily life API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "生成日常失败" },
      { status: 500 }
    );
  }
}
