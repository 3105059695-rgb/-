// ==========================================
// /api/private-message - 私信 API
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { generatePrivateMessage } from "@/lib/deepseek";
import { storeMemory } from "@/lib/db";
import type { CharacterType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { character, message, userId } = body as {
      character: CharacterType;
      message: string;
      userId?: string;
    };

    if (!character || !message) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数：character 和 message" },
        { status: 400 }
      );
    }

    if (character !== "tianxiwei" && character !== "liyitong") {
      return NextResponse.json(
        { success: false, error: "角色必须是 tianxiwei 或 liyitong" },
        { status: 400 }
      );
    }

    const context = `（注意：这是私信对话。你说的内容可能被另一个人"无意间"知晓。保持角色性格，可以透露一些在公开场合不会说的话。）`;

    const result = await generatePrivateMessage(character, message, context);

    await storeMemory(
      character,
      `私信对话 - 第六人对${character === "tianxiwei" ? "田曦薇" : "李一桐"}说：${message}。回复：${result.reply}`,
      "short_term",
      4
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        character,
        reply: result.reply,
        innerOS: result.innerOS,
        leaked: Math.random() < 0.3,
      },
    });
  } catch (error: any) {
    console.error("Private message API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "私信发送失败" },
      { status: 500 }
    );
  }
}
