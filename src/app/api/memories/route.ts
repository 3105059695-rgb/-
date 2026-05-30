// ==========================================
// /api/memories - 记忆查询 API
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { getRecentMemories, getBondMoments, getAchievements, getRelationStats } from "@/lib/db";
import { querySimilarMemories } from "@/lib/pinecone";
import type { CharacterType } from "@/types";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type") || "recent";
  const character = searchParams.get("character") as CharacterType | undefined;
  const query = searchParams.get("query");
  const userId = searchParams.get("userId") || req.cookies.get("user_id")?.value;

  try {
    switch (type) {
      case "recent": {
        const memories = await getRecentMemories(20, character as CharacterType | undefined);
        return NextResponse.json({ success: true, data: memories });
      }
      case "semantic": {
        if (!query) {
          return NextResponse.json({ success: false, error: "缺少query参数" }, { status: 400 });
        }
        const results = await querySimilarMemories(query, character as CharacterType | undefined, 10);
        return NextResponse.json({ success: true, data: results });
      }
      case "bond-moments": {
        const moments = await getBondMoments(userId);
        return NextResponse.json({ success: true, data: moments });
      }
      case "achievements": {
        if (!userId) {
          return NextResponse.json({ success: false, error: "需要userId" }, { status: 400 });
        }
        const achievements = await getAchievements(userId);
        return NextResponse.json({ success: true, data: achievements });
      }
      case "stats": {
        if (!userId) {
          return NextResponse.json({ success: false, error: "需要userId" }, { status: 400 });
        }
        const stats = await getRelationStats(userId);
        return NextResponse.json({ success: true, data: stats });
      }
      default:
        return NextResponse.json({ success: false, error: "未知的type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Memories API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "查询失败" },
      { status: 500 }
    );
  }
}
