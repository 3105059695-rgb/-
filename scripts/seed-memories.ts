// ==========================================
// 记忆注入脚本 - 预注入女子推理社真实记忆 + 初始化 Pinecone
// 运行: npx ts-node scripts/seed-memories.ts
// ==========================================

import { createClient } from "@vercel/postgres";
import { seedCanonMemories } from "../src/lib/pinecone";

async function seedDb() {
  console.log("Seeding canon memories into PostgreSQL...");

  const client = createClient({
    connectionString: process.env.POSTGRES_URL,
  });

  await client.connect();

  const canonMemories = [
    {
      character_type: "dual",
      content: `在《女子推理社》录制中，田曦薇在黑暗密室环节下意识挡在李一桐前面，说「别怕，我在」。`,
      importance: 9,
    },
    {
      character_type: "dual",
      content: `推理社某次户外录制，李一桐看到田曦薇穿得少，默默把自己的外套递过去。田曦薇接过愣住，嘴硬说「我不冷」但还是穿上了。`,
      importance: 8,
    },
    {
      character_type: "tianxiwei",
      content: `推理社聚餐时，田曦薇会不自觉地观察李一桐喜欢吃什么，悄悄把那道菜挪到她面前。被发现了立刻别过头假装看手机。`,
      importance: 7,
    },
    {
      character_type: "liyitong",
      content: `李一桐在推理社总是第一个注意到田曦薇的状态变化——累不累、渴不渴。她不说，但手边的水、递过去的纸巾都是证据。`,
      importance: 7,
    },
    {
      character_type: "dual",
      content: `推理社录制结束后，两人经常是最后离开。被拍到在停车场，田曦薇靠在李一桐肩上，安静站了很久。`,
      importance: 8,
    },
    {
      character_type: "tianxiwei",
      content: `田曦薇在采访中被问到「推理社里最信任谁」，不假思索说「李一桐」。说完愣住补了一句「因为她很靠谱」，但耳朵红了。`,
      importance: 8,
    },
    {
      character_type: "liyitong",
      content: `李一桐在采访中说如果推理社只剩一个人可以依靠，选田曦薇。理由：「她看起来甜甜的，但关键时刻特别靠得住。」`,
      importance: 8,
    },
    {
      character_type: "dual",
      content: `推理社一道难题，两人配合默契几乎不用说话就能理解对方思路。其他成员调侃她们「心有灵犀」，李一桐低头笑，田曦薇说「那当然」。`,
      importance: 6,
    },
    {
      character_type: "dual",
      content: `录制到很晚，李一桐困得在沙发上睡着了，田曦薇让大家小声点，然后坐在旁边守着。`,
      importance: 7,
    },
    {
      character_type: "tianxiwei",
      content: `田曦薇私下跟朋友提起李一桐：「她那个人就是太好了，明明自己也很累，还总先想着别人。我看不下去。」但表情很柔软。`,
      importance: 6,
    },
  ];

  for (const mem of canonMemories) {
    await client.query(
      `INSERT INTO memories (character_type, content, importance, memory_type) VALUES ($1, $2, $3, 'canon')`,
      [mem.character_type, mem.content, mem.importance]
    );
    console.log(`  OK ${mem.content.slice(0, 40)}...`);
  }

  await client.end();
  console.log("PostgreSQL seeding complete.");
}

async function seed() {
  console.log("=== TongWei Universe - Memory Seed ===\n");

  try {
    await seedDb();
  } catch (error) {
    console.error("PostgreSQL seeding error:", error);
    console.log("Continuing with Pinecone only...");
  }

  try {
    await seedCanonMemories();
  } catch (error) {
    console.error("Pinecone seeding error:", error);
    console.log("Make sure PINECONE_API_KEY is set in .env");
  }

  console.log("\n=== Memory seeding complete ===");
}

seed();
