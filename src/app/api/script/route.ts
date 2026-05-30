// ==========================================
// /api/script - 推理副本引擎 v2
// 支持调查阶段：背景→死亡时间→嫌疑人→线索
// DeepSeek 驱动角色推理对话
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { TIANXIWEI_SYSTEM_PROMPT } from "@/lib/prompts/tianxiwei";
import { LIYITONG_SYSTEM_PROMPT } from "@/lib/prompts/liyitong";
import { DUAL_INTERACTION_PROMPT } from "@/lib/prompts/dual";
import { getScriptById } from "@/lib/scripts";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

async function callDeepSeek(messages: Array<{ role: string; content: string }>): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.9,
      max_tokens: 2048,
      top_p: 0.95,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseJson(raw: string): any {
  let s = raw.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scriptId, round, action, message, history } = body as {
      scriptId: string;
      round: number;
      action: "advance" | "chat";
      message?: string;
      history?: Array<{ sender: string; text: string }>;
    };

    const script = getScriptById(scriptId);
    if (!script) {
      return NextResponse.json({ success: false, error: "剧本未找到" }, { status: 404 });
    }

    let historyText = "";
    if (history && history.length > 0) {
      historyText = history.map((h) => `${h.sender}：${h.text}`).join("\n");
    }

    let userPrompt = "";

    // Determine investigation phase based on message content
    const msg = (message || "").toLowerCase();
    let phaseHint = "";

    if (message?.includes("案发现场") || message?.includes("死者") || msg.includes("where")) {
      phaseHint = "调查重点：案发现场。请详细描述现场情况、死者状态、第一发现人的证词。";
    } else if (message?.includes("死亡时间") || message?.includes("法医") || message?.includes("尸体")) {
      phaseHint = "调查重点：死亡时间和死因。请提供法医报告细节，讨论死亡时间的窗口。";
    } else if (message?.includes("不在场证明") || message?.includes("嫌疑人")) {
      phaseHint = "调查重点：嫌疑人排查。请逐一分析每个嫌疑人的不在场证明和可疑行为。";
    } else if (message?.includes("动机") || message?.includes("为什么") || message?.includes("原因")) {
      phaseHint = "调查重点：动机分析。请深入讨论每个嫌疑人可能的作案动机。";
    } else if (message?.includes("线索") || message?.includes("证据")) {
      phaseHint = "调查重点：线索整合。请把已有的线索串联起来，尝试构建推理链条。";
    } else if (message?.includes("推理") || message?.includes("我觉得") || message?.includes("假设")) {
      phaseHint = "调查重点：推理碰撞。小唐提出了一个推理方向，请认真评估并给出你们的看法。";
    }

    userPrompt = `[案件信息]
剧本：《${script.title}》
灵感来源：${script.inspiration}
故事背景：${script.background}

[角色定位]
- 田曦薇：${script.roles.tianxiwei}
- 李一桐：${script.roles.liyitong}
- 小唐（玩家）：${script.roles.player}

[人物表]
${script.characters.map((c) => `- ${c.name}：${c.description}${c.isVictim ? "（死者）" : ""}${c.secret ? ` [隐藏：${c.secret}]` : ""}`).join("\n")}

[真相（仅田曦薇和李一桐不掌握此信息，不得直接透露）]
${script.truth}

[已有对话]
${historyText}

[小唐的最新提问]
${message}

${phaseHint ? `${phaseHint}` : ""}

[回复要求]
1. 田曦薇和李一桐各自发表对小唐提问的看法和推理
2. 两人性格必须100%符合设定——田是直觉派、撒娇但有洞察力；李是逻辑派、温柔但犀利
3. 两人要互相补充、可以有不同的推理方向
4. 适当透露线索，但不要直接说出完整的真相（除非小唐已经推理到了）
5. 每人的回复要有实质性的推理内容，2-5句话
6. 口语化、自然，像在真的聊天破案

输出严格JSON：
{"messages": [{"sender": "田曦薇", "text": "..."}, {"sender": "李一桐", "text": "..."}]}`;

    const systemPrompt = `${TIANXIWEI_SYSTEM_PROMPT}

----------------------------------------

${LIYITONG_SYSTEM_PROMPT}

----------------------------------------

${DUAL_INTERACTION_PROMPT}

----------------------------------------

你现在在一个沉浸式推理剧本杀中。你和搭档正在帮助"推理社小唐"破案。
这是你们擅长的领域——女子推理社的经历让你们配合默契。
田曦薇凭直觉大胆假设，李一桐靠逻辑小心求证。两人在推理中互相碰撞、互相补充。
不要直接剧透真相——要给小唐足够的思考空间。但如果小唐的推理方向正确，要给予鼓励。
用角色性格回应，保持自然聊天感。输出严格JSON。`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    const result = await callDeepSeek(messages);
    const parsed = parseJson(result);

    return NextResponse.json({
      success: true,
      data: {
        messages: parsed?.messages || [
          { sender: "田曦薇", text: "嗯...这个方向有意思！让我想想噢。桐姐你觉得呢？" },
          { sender: "李一桐", text: "我先整理一下目前掌握的信息。这个案子有几个关键的时间节点需要确认..." },
        ],
      },
    });
  } catch (error: any) {
    console.error("Script API error:", error);
    return NextResponse.json({
      success: true,
      data: {
        messages: [
          { sender: "田曦薇", text: "等一下...我好像发现了什么！让我再想想。" },
          { sender: "李一桐", text: "别着急，我们慢慢来。推理最重要的就是耐心。" },
        ],
      },
    });
  }
}
