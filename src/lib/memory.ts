// ==========================================
// 记忆与成长系统 - 整合 Pinecone + PostgreSQL
// ==========================================

import { querySimilarMemories, storeImportantMemory } from "./pinecone";
import { getRecentMemories, getImportantMemories, storeMemory } from "./db";
import type { CharacterType } from "@/types";

function buildMemoryContext(recentPgMemories: any[], pineconeResults: any[], importantMemories: any[]): string {
  const parts: string[] = [];

  if (recentPgMemories.length > 0) {
    const recent = recentPgMemories.slice(0, 5).map((m: any) => `- ${m.content}`).join("\n");
    parts.push(`[近期记忆]\n${recent}`);
  }

  if (pineconeResults.length > 0) {
    const similar = pineconeResults
      .filter((r: any) => r.score > 0.7)
      .slice(0, 3)
      .map((r: any) => `- ${r.content}`)
      .join("\n");
    if (similar) {
      parts.push(`[语义相关记忆]\n${similar}`);
    }
  }

  if (importantMemories.length > 0) {
    const important = importantMemories.slice(0, 3).map((m: any) => `- ${m.content}`).join("\n");
    parts.push(`[重要事件记忆]\n${important}`);
  }

  return parts.join("\n\n") || "（暂无相关记忆）";
}

export async function retrieveMemoryContext(
  query: string,
  character?: CharacterType
): Promise<string> {
  const [recentMemories, importantMemories, pineconeResults] = await Promise.all([
    getRecentMemories(10, character).catch(() => []),
    getImportantMemories(5).catch(() => []),
    querySimilarMemories(query, character, 5).catch(() => []),
  ]);

  return buildMemoryContext(recentMemories, pineconeResults, importantMemories);
}

export async function rememberImportantEvent(
  characterType: CharacterType | "dual" | "system",
  content: string,
  importance: number
): Promise<void> {
  if (importance < 5) return;

  const memoryType = importance >= 7 ? "long_term" : "short_term";

  try {
    const pgResult = await storeMemory(characterType, content, memoryType, importance);

    if (importance >= 7) {
      await storeImportantMemory(pgResult.id, content, characterType, importance).catch((e) =>
        console.error("Pinecone storage failed:", e)
      );
    }
  } catch (error) {
    console.error("Failed to store important memory:", error);
  }
}

export async function processDialogueForMemories(
  dialogues: Array<{ character: CharacterType; text: string; innerOS?: string }>,
  mode: string
): Promise<void> {
  const interestingLines = dialogues.filter((d) => {
    const text = d.text + (d.innerOS || "");
    const keywords = [
      "喜欢", "爱", "保护", "抱", "担心", "心疼",
      "永远", "我在", "没事", "傻瓜", "笨蛋",
      "吃醋", "等你", "陪你", "不哭", "有我在",
    ];
    return keywords.some((kw) => text.includes(kw));
  });

  for (const line of interestingLines) {
    const importance = line.innerOS && line.innerOS.length > 20 ? 7 : 5;
    const characterType = line.character;
    const content = `${line.character === "tianxiwei" ? "田曦薇" : "李一桐"}: ${line.text}${line.innerOS ? ` (内心: ${line.innerOS})` : ""}`;

    await rememberImportantEvent(characterType, content, importance).catch(() => {});
  }
}
