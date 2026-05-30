// ==========================================
// DeepSeek API 封装 - 完整 System Prompt 组装逻辑
// ==========================================

import { TIANXIWEI_SYSTEM_PROMPT } from "./prompts/tianxiwei";
import { LIYITONG_SYSTEM_PROMPT } from "./prompts/liyitong";
import { DUAL_INTERACTION_PROMPT } from "./prompts/dual";
import { REAL_WORLD_KNOWLEDGE, FANFIC_KNOWLEDGE } from "./knowledge";
import type { ChatRequest, ChatResponse, CharacterType, SceneType, EmotionTag, DialogueLine } from "@/types";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "清晨";
  if (hour >= 8 && hour < 12) return "上午";
  if (hour >= 12 && hour < 14) return "中午";
  if (hour >= 14 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  if (hour >= 20 && hour < 23) return "晚上";
  return "深夜";
}

function getSceneName(scene: SceneType): string {
  const names: Record<SceneType, string> = {
    home: "在家", set: "片场", set_break: "片场休息", video_call: "视频通话",
    apart: "异地", airport: "机场", hotel_room: "酒店", weibo: "微博互动",
    inference_club: "推理社聚会", shopping: "逛街", rainy_cafe: "雨天咖啡馆",
    late_night_sofa: "深夜沙发", morning_routine: "清晨日常",
    night_routine: "晚间时光", kitchen: "厨房", outdoor: "户外",
  };
  return names[scene] || "在家";
}

function getSceneDescription(scene: SceneType): string {
  const descriptions: Record<SceneType, string> = {
    home: "温馨的小家，她们最放松的私人空间。",
    set: "工作的片场，工作人员忙碌穿梭。镜头前专业认真，镜头后才是真实的彼此。",
    set_break: "拍戏的间隙，她找了个没人的角落偷看手机。",
    video_call: "深夜里手机屏幕亮起。虽然隔着屏幕，但她的笑容比什么都暖。",
    apart: "她在另一个城市拍戏。异地最让人抓狂的不是距离——是明明有那么多话想说却只能打字。",
    airport: "候机大厅里人来人往。她戴着口罩和帽子，还是被认出来了——被那个来接她的人。",
    hotel_room: "一个人在酒店，床很大但只有一个人。翻来覆去睡不着，拿起手机——她的消息刚好进来。",
    weibo: "她今天发了条微博。评论区一个熟悉的ID秒赞了，还留了太阳表情。粉丝已经炸了。",
    inference_club: "女子推理社的聚会。笑声和推理交织，有人调侃她们太默契。",
    shopping: "商场里人来人往，她们并肩走在橱窗前，偶尔驻足。",
    rainy_cafe: "窗外雨声淅沥，咖啡香气在温暖的空气中弥漫。",
    late_night_sofa: "深夜的沙发，灯光调暗了，世界安静得只剩下彼此的呼吸声。",
    morning_routine: "清晨的阳光刚好洒进房间。新的一天从她的声音开始。",
    night_routine: "一天结束后，换上舒服的家居服。这是只属于她们的私密时间。",
    kitchen: "厨房里飘出饭菜的香气。一个在认真做饭，一个在旁边'帮忙'——实际在偷吃。",
    outdoor: "大自然中的她们最真实。散步、看星星，风吹过的时候有人的手悄悄伸过来。",
  };
  return descriptions[scene] || descriptions.home;
}

function getRandomWeather(): string {
  const weathers = ["晴天", "晴天", "晴天", "多云", "多云", "小雨", "微风", "晴朗"];
  return weathers[Math.floor(Math.random() * weathers.length)];
}

async function callDeepSeek(messages: DeepSeekMessage[], temperature = 0.95, maxTokens = 4096): Promise<string> {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  return content;
}

function removeCodeBlockJson(raw: string): string {
  let str = raw.trim();
  if (str.startsWith("```json")) str = str.slice(7);
  else if (str.startsWith("```")) str = str.slice(3);
  if (str.endsWith("```")) str = str.slice(0, -3);
  return str.trim();
}

// ==========================================
// 构建完整的 System Prompt（双人对话模式）
// ==========================================

export function buildFullSystemPrompt(params: {
  mode: string;
  timeOfDay: string;
  weather: string;
  scene: SceneType;
  sceneDescription: string;
  sceneName: string;
  recentMemories: string;
  userInput?: string;
}): string {
  return `${TIANXIWEI_SYSTEM_PROMPT}

----------------------------------------

${LIYITONG_SYSTEM_PROMPT}

----------------------------------------

${DUAL_INTERACTION_PROMPT}

----------------------------------------

${REAL_WORLD_KNOWLEDGE}

----------------------------------------

${FANFIC_KNOWLEDGE}

----------------------------------------

[场景生成指令]

你是一个沉浸式CP互动场景生成器。你的任务是为田曦薇和李一桐生成自然的日常互动对话。

[当前环境]
- 时间：${params.timeOfDay}
- 天气：${params.weather}
- 地点：${params.sceneName} —— ${params.sceneDescription}
- 互动模式：${params.mode === "room9" ? "九号房间模式——两人被困在只有彼此的空间里，面对系统给出的艰难选择。在这里可以更坦诚更真实，不需要演给任何人看。" : params.mode === "observe" ? "旁观模式（用户「小唐」安静旁观，你们自然互动）" : params.mode === "danmaku" ? "弹幕模式（用户发了一条弹幕飘过屏幕，你们看到后口头回应一下，然后继续互动）" : "三人对话模式（用户「小唐」加入了聊天）"}
- 用户说：${params.userInput || "（用户正在安静旁观，暂无输入）"}

[相关记忆]
${params.recentMemories}

[输出格式 - 严格JSON]
{
  "dialogues": [
    {
      "character": "tianxiwei",
      "text": "田曦薇说的话（必须包含口头禅和性格特征）",
      "innerOS": "田曦薇内心OS（可选）",
      "emotion": "撒娇/吃醋/开心/警觉/害羞/感动/放松/内耗",
      "action": "*动作描述*"
    },
    {
      "character": "liyitong",
      "text": "李一桐说的话（必须包含口头禅和性格特征）",
      "innerOS": "李一桐内心OS（可选）",
      "emotion": "温柔/开心/担忧/害羞/感动/满足/心疼",
      "action": "*动作描述*"
    }
  ],
  "sceneDescription": "当前氛围的简短诗意描述",
  "mood": "整体氛围情绪",
  "bondMoment": null
}

[关键生成要求]
1. 每轮对话 8-12 句，必须是二人交替对话，有完整的互动弧线
2. 对话要丰富细腻——不能两句就结束，要有来有往的深入互动
3. 田曦薇：尾音上扬～、偶尔重庆话、口头禅必须出现、撒娇但嘴硬
4. 李一桐：声音轻柔平稳、像哄小孩的语气、行动多于言语
5. 必须穿插肢体动作和场景动作描述，画面感强烈
6. 至少两个角色都带有内心OS
7. 对话要符合当前时间和场景的氛围
8. 可以自然引入《女子推理社》共同经历作为话题
9. 每次对话要不同——变换话题、情绪、互动类型，不要重复
10. 如果某一刻特别甜蜜值得收藏，bondMoment不为null`;
}

function buildPrivateMessageSystemPrompt(character: CharacterType): string {
  const basePrompt = character === "tianxiwei" ? TIANXIWEI_SYSTEM_PROMPT : LIYITONG_SYSTEM_PROMPT;
  return `${basePrompt}

----------------------------------------

[当前模式：私信]
"小唐"悄悄给你发了私信。现在只有你和小唐在对话。
注意：另一个人可能"无意间"知道了一些内容（之后在群聊中可能被提及）。
保持角色性格回应。回复可以稍微比在公开场合更放松一些，但不可OOC。

[回复格式]
直接以角色口吻回复即可。如果愿意，可以在回复末尾用[内心OS]...[/内心OS]的方式透露你的真实想法。`;
}

// ==========================================
// 主对话生成
// ==========================================

export async function generateDialogue(params: ChatRequest & {
  memories?: string;
}): Promise<ChatResponse> {
  const timeOfDay = params.timeOfDay || getTimeOfDay();
  const scene = params.scene || ("home" as SceneType);
  const weather = params.weather || getRandomWeather();
  const userInput = params.userMessage || "";
  const sceneName = getSceneName(scene);
  const sceneDescription = getSceneDescription(scene);

  const recentMemories = params.memories || "（暂无相关记忆）";

  const systemPrompt = buildFullSystemPrompt({
    mode: params.mode || "observe",
    timeOfDay,
    weather,
    scene,
    sceneDescription,
    sceneName,
    recentMemories,
    userInput,
  });

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: `请为以下场景生成一段新鲜的、自然的二人互动对话。

${params.mode === "observe" ? "她们在" + sceneName + "，时间是" + timeOfDay + "，" + weather + "。" : params.mode === "danmaku" ? "用户发了弹幕：「" + userInput + "」。请让角色看到后自然回应，然后继续互动。" : "用户「小唐」说：「" + userInput + "」。请让角色回应，但主要互动仍然是她们二人之间。"}

要求：
- 对话要新鲜有趣，和之前的对话不同
- 让她们互动有来有往，充满生活气息
- 田曦薇必须要有她的标志性撒娇/吃醋/嘴硬表现
- 李一桐必须要有她的温柔守护表现
- 输出严格JSON格式`,
    },
  ];

  try {
    const result = await callDeepSeek(messages, 0.95, 4096);
    const jsonStr = removeCodeBlockJson(result);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      const fixed = tryFixJson(jsonStr);
      if (fixed) {
        parsed = JSON.parse(fixed);
      } else {
        throw parseError;
      }
    }

    const dialogues = (parsed.dialogues || []).map((d: any, i: number) => ({
      id: `dlg_${Date.now()}_${i}`,
      character: d.character as CharacterType,
      text: d.text || "",
      innerOS: d.innerOS || undefined,
      emotion: (d.emotion as EmotionTag) || undefined,
      action: d.action || undefined,
      timestamp: Date.now(),
    }));

    return {
      dialogues,
      innerOS: parsed.innerOS || {},
      sceneUpdate: {
        scene,
        description: parsed.sceneDescription || sceneDescription,
        mood: parsed.mood || "温馨",
      },
      bondMoment: parsed.bondMoment || undefined,
    };
  } catch (error) {
    console.error("Failed to generate dialogue:", error);

    const fallbacks = getFallbackDialogues(scene, timeOfDay, weather);
    return {
      dialogues: fallbacks,
      innerOS: {
        tianxiwei: "（刚才好像信号不太好...不过没关系，她在就好）",
        liyitong: "（怎么突然安静了一下，不过无所谓，她在就行）",
      },
      sceneUpdate: {
        scene: "home",
        description: sceneDescription,
        mood: "温馨日常",
      },
    };
  }
}

// ==========================================
// 私信生成
// ==========================================

export async function generatePrivateMessage(
  character: CharacterType,
  userMessage: string,
  context?: string
): Promise<{ reply: string; innerOS: string }> {
  const systemPrompt = buildPrivateMessageSystemPrompt(character);

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  if (context) {
    messages.push({ role: "system", content: context });
  }

  messages.push({ role: "user", content: userMessage });

  try {
    const result = await callDeepSeek(messages, 0.9, 1024);

    const osMatch = result.match(/\[内心OS\]([\s\S]*?)\[\/内心OS\]/);
    const innerOS = osMatch ? osMatch[1].trim() : "";
    const reply = result
      .replace(/\[内心OS\][\s\S]*?\[\/内心OS\]/, "")
      .trim();

    return {
      reply: reply || result.trim(),
      innerOS,
    };
  } catch (error) {
    console.error("Failed to generate private message:", error);
    return {
      reply: character === "tianxiwei"
        ? "噢～是你呀。有什么想跟我说的就告诉我嘛，桐姐不在旁边的时候可以说悄悄话的～"
        : "在呢。有什么都可以跟我说呀，我会好好听的。",
      innerOS: character === "tianxiwei"
        ? "如果是关于桐姐的事...那我要竖起耳朵听了"
        : "希望不是来告状的...小薇她只是太在意了",
    };
  }
}

// ==========================================
// 辅助函数
// ==========================================

function tryFixJson(raw: string): string | null {
  let fixed = raw.trim();

  const braceStart = fixed.indexOf("{");
  const braceEnd = fixed.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
    fixed = fixed.slice(braceStart, braceEnd + 1);
  }

  fixed = fixed
    .replace(/，/g, ",")
    .replace(/：/g, ":")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/\n/g, " ")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  try {
    JSON.parse(fixed);
    return fixed;
  } catch {
    return null;
  }
}

function getFallbackDialogues(scene: SceneType, timeOfDay: string, weather: string): DialogueLine[] {
  const fallbackSets: Record<string, Array<{ character: CharacterType; text: string; emotion: EmotionTag; action: string; innerOS?: string }>> = {
    rainy_cafe: [
      { character: "tianxiwei", text: "桐姐～你看外面的雨，好适合赖在这里不走噢。", emotion: "撒娇", action: "*趴在桌上，歪头看窗外*", innerOS: "这样就能和她多待一会儿了" },
      { character: "liyitong", text: "好呀，那就再坐一会儿。我给你再点杯热的？", emotion: "温柔", action: "*轻轻把糖罐推到她那边*", innerOS: "她想赖多久就多久" },
      { character: "tianxiwei", text: "你怎么知道我想喝热的...你啷个什么都知道嘛！", emotion: "害羞", action: "*耳根微红，低头搅咖啡*" },
      { character: "liyitong", text: "你每次冷的时候就会不自觉地搓手指呀。", emotion: "满足", action: "*微笑注视她*", innerOS: "她的小习惯我都记得" },
    ],
    late_night_sofa: [
      { character: "tianxiwei", text: "桐姐...你今天是不是有点累。", emotion: "担忧", action: "*从沙发另一边挪过来，靠在她肩上*" },
      { character: "liyitong", text: "没事呀，就是今天工作有点多。你在呢就不累了。", emotion: "满足", action: "*自然地抬手摸了摸她的头发*", innerOS: "她一靠近我就觉得什么都好了" },
      { character: "tianxiwei", text: "你每次都这样说...过来，靠着我。今天换我来。", emotion: "认真", action: "*坐直身体，把她轻轻揽过来*", innerOS: "我也想成为她的依靠" },
      { character: "liyitong", text: "......好。", emotion: "感动", action: "*没有推辞，安静地靠在她肩膀上*", innerOS: "原来被你照顾是这样的感觉..." },
    ],
  };

  const defaultFb = [
    { character: "tianxiwei" as CharacterType, text: "桐姐～今天心情好好噢，因为你在我旁边。", emotion: "撒娇", action: "*笑眯眯地靠过去*", innerOS: "每天最开心就是这个时候" },
    { character: "liyitong" as CharacterType, text: "我也是呀。你今天特别好看。", emotion: "温柔", action: "*认真看着她*", innerOS: "真心话，她每天都好看" },
    { character: "tianxiwei" as CharacterType, text: "你...你好烦噢～突然说这个干嘛！", emotion: "害羞", action: "*耳根通红，别过头*", innerOS: "啊啊啊啊她怎么这么会说" },
    { character: "liyitong" as CharacterType, text: "没有啦，实话实说。", emotion: "满足", action: "*轻轻笑了*", innerOS: "害羞的样子也太可爱了" },
    { character: "tianxiwei" as CharacterType, text: "那...那你今天也很好看。我只是顺便说一下！", emotion: "害羞", action: "*攥着衣角，偷瞄她*" },
    { character: "liyitong" as CharacterType, text: "好～我知道啦。", emotion: "幸福", action: "*伸手牵住她攥衣角的手*" },
  ];

  const set = fallbackSets[scene] || defaultFb;
  return set.map((d, i) => ({
    id: `fallback_${Date.now()}_${i}`,
    character: d.character,
    text: d.text,
    emotion: d.emotion,
    action: d.action,
    innerOS: d.innerOS,
    timestamp: Date.now(),
  }));
}
