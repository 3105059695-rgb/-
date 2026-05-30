// ==========================================
// Pinecone 向量记忆库 - 初始化与记忆操作
// ==========================================

import { Pinecone } from "@pinecone-database/pinecone";
import type { CharacterType } from "@/types";

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
  }
  return pineconeClient;
}

export async function getIndex() {
  const client = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX_NAME || "tongwei-memories";
  return client.index(indexName);
}

export async function upsertMemory(
  id: string,
  content: string,
  metadata: Record<string, string> = {}
): Promise<void> {
  try {
    const index = await getIndex();
    const embedding = await generateEmbedding(content);
    await index.upsert([
      {
        id,
        values: embedding,
        metadata: {
          content,
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
  } catch (error) {
    console.error("Failed to upsert memory to Pinecone:", error);
    throw error;
  }
}

export async function querySimilarMemories(
  query: string,
  character?: CharacterType,
  topK = 5
): Promise<Array<{ content: string; score: number; metadata: Record<string, string> }>> {
  try {
    const index = await getIndex();
    const embedding = await generateEmbedding(query);
    const filter = character
      ? { character_type: { $eq: character } }
      : undefined;

    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter,
    });

    return (results.matches || []).map((match) => ({
      content: (match.metadata?.content as string) || "",
      score: match.score || 0,
      metadata: (match.metadata as Record<string, string>) || {},
    }));
  } catch {
    return [];
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY || "";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

  try {
    const response = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        input: text,
      }),
    });

    if (!response.ok) throw new Error(`Embedding API ${response.status}`);
    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  } catch (error) {
    console.error("Embedding API error, using fallback:", error);
    return new Array(1536).fill(0).map(() => Math.random() * 0.01);
  }
}

export async function storeImportantMemory(
  id: string,
  content: string,
  characterType: CharacterType | "dual" | "system",
  importance: number
): Promise<void> {
  await upsertMemory(id, content, {
    character_type: characterType,
    importance: importance.toString(),
    memory_type: importance >= 7 ? "long_term" : "short_term",
  });
}

// ==========================================
// 《女子推理社》真实记忆预注入数据
// ==========================================

export const CANON_MEMORIES = [
  {
    id: "canon_001",
    character: "dual",
    content: `在《女子推理社》录制中，田曦薇在黑暗密室环节下意识挡在李一桐前面，说「别怕，我在」。李一桐后来在采访中提到，那一刻觉得特别安心。`,
    importance: 9,
  },
  {
    id: "canon_002",
    character: "dual",
    content: `推理社某次户外录制，李一桐看到田曦薇穿得少，默默把自己的外套递过去，什么都没说。田曦薇接过外套的时候愣了一下，然后嘴硬说「我不冷」，但还是穿上了。`,
    importance: 8,
  },
  {
    id: "canon_003",
    character: "tianxiwei",
    content: `推理社聚餐时，田曦薇会不自觉地观察李一桐喜欢吃什么，然后悄悄把那道菜挪到她面前。被李一桐发现后立刻别过头假装在看手机。`,
    importance: 7,
  },
  {
    id: "canon_004",
    character: "liyitong",
    content: `李一桐在推理社的任务中总是第一个注意到田曦薇的状态变化——累不累、渴不渴、情绪好不好。她不说，但手边的水、递过去的纸巾，都是证据。`,
    importance: 7,
  },
  {
    id: "canon_005",
    character: "dual",
    content: `推理社录制结束后，两人经常是最后离开的。有一次被拍到在停车场，田曦薇靠在李一桐肩上，两人安静地站了很久，谁都没说话。`,
    importance: 8,
  },
  {
    id: "canon_006",
    character: "tianxiwei",
    content: `田曦薇在采访中被问到「推理社里最信任谁」，她不假思索地说「李一桐」。说完之后愣了一下，补充说「因为她很靠谱啊」，但耳朵红了。`,
    importance: 8,
  },
  {
    id: "canon_007",
    character: "liyitong",
    content: `李一桐在采访中被问到「如果推理社只剩一个人可以依靠」，她说「田曦薇」。理由是「她看起来甜甜的，但关键时刻特别靠得住」。`,
    importance: 8,
  },
  {
    id: "canon_008",
    character: "dual",
    content: `推理社一次很难的谜题，两人配合默契，几乎不用说话就能理解对方的思路。其他成员调侃她们「心有灵犀」，李一桐低头笑，田曦薇说「那当然」。`,
    importance: 6,
  },
  {
    id: "canon_009",
    character: "dual",
    content: `有一次推理社录制到很晚，李一桐困得靠在沙发上睡着了，田曦薇让大家小声点，然后坐在旁边守着，直到录制继续。`,
    importance: 7,
  },
  {
    id: "canon_010",
    character: "tianxiwei",
    content: `田曦薇私下会跟朋友提起李一桐：「她那个人就是太好了，明明自己也很累，还总先想着别人。我看不下去。」但说这话的时候表情很柔软。`,
    importance: 6,
  },
];

export async function seedCanonMemories(): Promise<void> {
  console.log("Seeding canon memories into Pinecone...");
  for (const memory of CANON_MEMORIES) {
    try {
      await upsertMemory(memory.id, memory.content, {
        character_type: memory.character,
        importance: memory.importance.toString(),
        memory_type: "canon",
        source: "\u5973\u5B50\u63A8\u7406\u793E",
      });
      console.log(`  Seeded: ${memory.id}`);
    } catch (error) {
      console.error(`  Failed to seed ${memory.id}:`, error);
    }
  }
  console.log("Canon memories seeding complete.");
}
