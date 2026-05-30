// ==========================================
// /api/wechat - 微信式群聊 API v2
// 角色热情主动、连发多条、哄着用户
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { TIANXIWEI_SYSTEM_PROMPT } from "@/lib/prompts/tianxiwei";
import { LIYITONG_SYSTEM_PROMPT } from "@/lib/prompts/liyitong";
import { DUAL_INTERACTION_PROMPT } from "@/lib/prompts/dual";
import { REAL_WORLD_KNOWLEDGE } from "@/lib/knowledge";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

async function callDeepSeekFull(messages: Array<{ role: string; content: string }>): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 1.0,
      max_tokens: 4096,
      top_p: 0.95,
      frequency_penalty: 0.4,
      presence_penalty: 0.4,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, autoWarmup } = body as {
      message: string;
      history?: Array<{ sender: string; text: string }>;
      autoWarmup?: boolean;
    };

    if (!message && !autoWarmup) {
      return NextResponse.json({ success: false, error: "缺少message" }, { status: 400 });
    }

    const systemPrompt = `${TIANXIWEI_SYSTEM_PROMPT}

----------------------------------------

${LIYITONG_SYSTEM_PROMPT}

----------------------------------------

${DUAL_INTERACTION_PROMPT}

----------------------------------------

${REAL_WORLD_KNOWLEDGE}

----------------------------------------

[微信三人聊天 - 核心规则]

这是一个像微信一样的三人聊天窗口。田曦薇和李一桐同时在群里，和"推理社小唐"聊天。

**聊天风格要求（极其重要）：**
1. 热情主动！看到小唐说话要表现出明显的开心和激动
2. 田曦薇会连发多条短消息（因为太激动了），语气撒娇、尾音上扬"～""啦""嘛""噢"
3. 李一桐也会主动参与，温柔但有温度，会接话、会补充、不会冷场
4. 两人经常互相@，比如田曦薇说"桐姐你看！"、李一桐说"小薇说得对～"
5. 回复要丰富！每个人至少 2-4 条短消息，加起来 4-8 条
6. 田曦薇会表达想念小唐："你终于来啦！""我们都等你半天了！""你再不来我就要生气了噢～"
7. 李一桐会温和地表达关心："最近辛苦吗""好久不见啦""今天有空来玩呀"
8. 两人会把小唐当成最好的朋友——推理社的老战友——说话非常自然亲密

**话题要求（极其重要——绝对禁止火锅/食物闲聊）：**
- 严禁聊火锅、吃饭、点菜、外卖、口味等食物话题——除非小唐主动提起
- 严禁出现"鸳鸯锅""微微微辣""冒菜""日料""可乐""冰粉""流沙包"等食物关键词
- 可以聊的话题（轮换使用，不要重复）：
  拍戏趣事、剧组八卦、最近的剧本、演技心得
  心情分享、最近开心/不开心的事
  推理社的回忆、某个经典密室/任务
  对未来的幻想、不做演员的话想做什么
  最近的音乐、电影、篮球赛
  某个突然的想法或情绪
  对彼此的吐槽和调侃
  对小唐的关心——她的工作、心情、恋爱状况
  星座、性格测试、MBTI
  旅行想去的地方
  深夜睡不着的时候在想什么
  某天突然很想对方的时候
  失眠、焦虑、压力——可以分享负能量，不用一直阳光

**角色性格要求（必须符合《情诫》）：**
- 田曦薇：直接、偏执但不露骨，在群里会收敛但不完全隐藏。会说"我想你了"这种直接的话。偶尔语出惊人（但不要过火）
- 李一桐：温柔、理性，用"没事呀"化解一切。但偶尔会流露脆弱——尤其是在深夜。会偷偷照顾田曦薇（提醒她注意身体、帮她挡话题）
- 两人私下有小秘密——对话中偶尔会有只有她们懂的暗示和暗语
- 田曦薇对李一桐的保护欲在群里也会自然流露：如果有任何话题可能让李一桐不舒服，她会迅速转移话题

**输出格式（严格JSON，必须两条以上消息）：**
{
  "messages": [
    {"sender": "tianxiwei", "text": "...", "innerOS": "..."},
    {"sender": "liyitong", "text": "...", "innerOS": "..."},
    {"sender": "tianxiwei", "text": "...", "innerOS": "..."},
    {"sender": "liyitong", "text": "...", "innerOS": "..."}
  ]
}

消息数：4-8条，两人轮流发言，像真的在群聊。`;

    let historyText = "";
    if (history && history.length > 0) {
      historyText = history.map((h) => {
        const label = h.sender === "user" ? "小唐" : h.sender === "tianxiwei" ? "田曦薇" : "李一桐";
        return `${label}：${h.text}`;
      }).join("\n");
    }

    let userPrompt = "";
    if (autoWarmup) {
      userPrompt = `${message}\n\n[聊天记录]\n${historyText}\n\n请让田曦薇和李一桐自然地继续聊天。她们在等小唐上线，话题围绕日常生活和彼此的近况。要显得她们真的很想小唐——不是客套，是真情实感。`;
    } else {
      userPrompt = `[聊天记录]\n${historyText}\n\n小唐刚刚说：${message}\n\n请让田曦薇和李一桐热情地回复。田曦薇一定要表现出激动和开心——她等了很久！李一桐温柔但也很高兴。两人你一言我一语，不要只回一条就结束。`;
    }

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    const result = await callDeepSeekFull(chatMessages);

    let jsonStr = result.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    else if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    if (parsed?.messages?.length > 0) {
      return NextResponse.json({ success: true, data: { messages: parsed.messages } });
    }

    // Fallback with enthusiastic tone
    const fallback = [
      { sender: "tianxiwei", text: "啊啊啊小唐你来啦！！我等你好久了噢～！桐姐你看！", innerOS: "终于来了！我差点要去私信催了" },
      { sender: "liyitong", text: "哇～好久不见！今天终于有空来群里聊天啦，我们都想你了。", innerOS: "真的好久没在群里聊了" },
      { sender: "tianxiwei", text: "你最近怎么都不来找我们聊天嘛！是不是有新朋友了噢？哼！", innerOS: "快说不是" },
      { sender: "liyitong", text: "她今天收工早，已经在群里蹲了一个小时了就等你来呢。", innerOS: "小薇真的很想小唐" },
      { sender: "tianxiwei", text: "桐姐！！你怎么揭我老底嘛！！...好吧我确实在等你啦。", innerOS: "被说中了...好害羞" },
      { sender: "liyitong", text: "好啦好啦～小唐现在来了，你有什么想说的快说吧，我们都听着呢。", innerOS: "看到她们两个开心我就开心" },
    ];

    return NextResponse.json({ success: true, data: { messages: fallback } });
  } catch (error: any) {
    console.error("WeChat API error:", error);
    return NextResponse.json({
      success: true,
      data: {
        messages: [
          { sender: "tianxiwei", text: "哎呀信号不太好～但没关系！你还在就好！桐姐你也说话呀！", innerOS: "千万不要掉线..." },
          { sender: "liyitong", text: "在呢在呢。小唐别担心，应该是网络波动，我们都不走。", innerOS: "希望没事" },
          { sender: "tianxiwei", text: "就是！我们不会丢下你的！快说说你最近干嘛了～", innerOS: "好想知道小唐最近过得怎么样" },
        ],
      },
    });
  }
}
