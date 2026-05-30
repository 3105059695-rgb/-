// ==========================================
// /api/chat - 对话生成 API
// 支持 observe | danmaku | chat 三种模式
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { generateDialogue } from "@/lib/deepseek";
import { retrieveMemoryContext, processDialogueForMemories } from "@/lib/memory";
import { storeEvent, updateRelationStats, storeBondMoment } from "@/lib/db";
import type { ChatRequest, SceneType, InteractionMode } from "@/types";

function getUserId(req: NextRequest): string | undefined {
  return req.cookies.get("user_id")?.value || req.headers.get("x-user-id") || undefined;
}

function getWeather(req: NextRequest): string {
  return req.cookies.get("weather")?.value || "晴天";
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const userId = getUserId(req);

    const mode: InteractionMode = body.mode || "observe";
    const scene: SceneType = body.scene || "home";
    const timeOfDay = body.timeOfDay;
    const weather = body.weather || getWeather(req);

    const userQuery = body.userMessage || `当前场景：${scene}，时间：${timeOfDay || "未知"}，模式：${mode}`;
    const memories = await retrieveMemoryContext(userQuery).catch(() => "（暂无相关记忆）");

    const response = await generateDialogue({
      mode,
      userMessage: body.userMessage,
      scene,
      timeOfDay,
      weather,
      userId,
      target: body.target,
      memories,
    });

    if (userId) {
      await updateRelationStats(userId, {
        totalInteractions: 1,
        assistCount: mode === "chat" ? 1 : 0,
      }).catch(() => {});
    }

    const eventId = await storeEvent(
      scene,
      mode,
      response.dialogues,
      response.innerOS,
      userId,
      body.userMessage
    ).catch(() => undefined);

    if (response.bondMoment) {
      await storeBondMoment(
        response.bondMoment.title,
        response.bondMoment.description,
        response.sceneUpdate?.description,
        response.dialogues,
        ["甜蜜"],
        userId
      ).catch(() => {});
    }

    processDialogueForMemories(response.dialogues, mode).catch(() => {});

    return NextResponse.json({
      success: true,
      data: response,
      eventId,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "生成对话失败" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const scene = (req.nextUrl.searchParams.get("scene") as SceneType) || "home";
  const mode = (req.nextUrl.searchParams.get("mode") as InteractionMode) || "observe";
  const timeOfDay = req.nextUrl.searchParams.get("time") || undefined;

  const userId = getUserId(req);
  const weather = getWeather(req);

  const query = `场景：${scene}，模式：${mode}`;
  const memories = await retrieveMemoryContext(query).catch(() => "（暂无相关记忆）");

  const response = await generateDialogue({
    mode,
    scene,
    timeOfDay,
    weather,
    userId,
    memories,
  });

  storeEvent(scene, mode, response.dialogues, response.innerOS, userId).catch(() => {});
  processDialogueForMemories(response.dialogues, mode).catch(() => {});

  return NextResponse.json({ success: true, data: response });
}
