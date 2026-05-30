// ==========================================
// 桐薇宇宙 - TypeScript 类型定义
// ==========================================

export type CharacterType = "tianxiwei" | "liyitong";

export type InteractionMode = "observe" | "danmaku" | "chat" | "private_message" | "room9";

export type SceneType =
  | "home" | "set" | "set_break" | "video_call" | "apart"
  | "airport" | "hotel_room" | "weibo" | "inference_club"
  | "shopping" | "rainy_cafe" | "late_night_sofa"
  | "morning_routine" | "night_routine" | "kitchen" | "outdoor";

export type EmotionTag =
  | "开心" | "害羞" | "吃醋" | "不安" | "内耗" | "生气" | "感动"
  | "放松" | "焦虑" | "幸福" | "担忧" | "警觉" | "心疼" | "满足"
  | "撒娇" | "温柔" | "认真" | "期待" | "得意" | "困惑" | "委屈"
  | "骄傲" | "后悔" | "急" | "暖";

export interface DialogueLine {
  id: string;
  character: CharacterType;
  text: string;
  innerOS?: string;
  emotion?: EmotionTag;
  action?: string;
  timestamp: number;
}

export interface ChatRequest {
  mode: InteractionMode;
  userMessage?: string;
  scene?: SceneType;
  timeOfDay?: string;
  weather?: string;
  userId?: string;
  target?: CharacterType;
  memories?: string;
}

export interface ChatResponse {
  dialogues: DialogueLine[];
  innerOS: { tianxiwei?: string; liyitong?: string };
  sceneUpdate?: { scene: SceneType; description: string; mood: string };
  bondMoment?: { title: string; description: string; cardPrompt: string };
  stats?: { sweetness: number; jealousy: number; assistCount: number };
}

export interface User {
  id: string;
  email?: string;
  nickname: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface Memory {
  id: string;
  characterType: CharacterType | "dual" | "system";
  content: string;
  summary?: string;
  importance: number;
  memoryType: "short_term" | "long_term" | "canon" | "user_shared";
  createdAt: string;
}

export interface BondMoment {
  id: string;
  title: string;
  description: string;
  sceneDescription?: string;
  dialogueSnapshot?: DialogueLine[];
  moodTags: string[];
  createdAt: string;
}

export interface RelationStats {
  sweetness: number;
  jealousy: number;
  assistCount: number;
  totalInteractions: number;
}

export interface SceneConfig {
  id: SceneType;
  name: string;
  description: string;
  timePreference: string[];
  weatherTags: string[];
  moodBase: string;
}

export const SCENE_CONFIGS: Record<SceneType, SceneConfig> = {
  home: { id: "home", name: "在家", description: "温馨的小家", timePreference: ["晚上", "周末"], weatherTags: ["任意"], moodBase: "温馨放松" },
  set: { id: "set", name: "片场", description: "忙碌的拍摄现场", timePreference: ["白天"], weatherTags: ["任意"], moodBase: "专业认真" },
  set_break: { id: "set_break", name: "片场休息", description: "拍戏间隙，她偷偷拿起手机", timePreference: ["白天", "下午"], weatherTags: ["任意"], moodBase: "短暂思念" },
  video_call: { id: "video_call", name: "视频通话", description: "深夜的视频电话，屏幕里的她笑得很甜", timePreference: ["晚上", "深夜"], weatherTags: ["任意"], moodBase: "甜蜜思念" },
  apart: { id: "apart", name: "异地", description: "她在另一个城市拍戏，距离让人更想她", timePreference: ["任意"], weatherTags: ["任意"], moodBase: "想念" },
  airport: { id: "airport", name: "机场", description: "她来机场接机——人群里一眼就看到了", timePreference: ["上午", "下午"], weatherTags: ["任意"], moodBase: "期待" },
  hotel_room: { id: "hotel_room", name: "酒店", description: "出差一个人翻来覆去睡不着", timePreference: ["晚上", "深夜"], weatherTags: ["任意"], moodBase: "孤单" },
  weibo: { id: "weibo", name: "微博互动", description: "她的微博下面另一个熟悉的ID秒赞了", timePreference: ["任意"], weatherTags: ["任意"], moodBase: "暗戳戳" },
  inference_club: { id: "inference_club", name: "推理社聚会", description: "女子推理社的聚会", timePreference: ["下午", "晚上"], weatherTags: ["任意"], moodBase: "热闹好玩" },
  shopping: { id: "shopping", name: "逛街", description: "一起逛街，田曦薇活力满满，李一桐温柔陪伴", timePreference: ["下午", "周末"], weatherTags: ["晴天", "多云"], moodBase: "轻松愉快" },
  rainy_cafe: { id: "rainy_cafe", name: "雨天咖啡馆", description: "窗外雨声淅沥，咖啡香气氤氲", timePreference: ["下午"], weatherTags: ["雨"], moodBase: "安静温柔" },
  late_night_sofa: { id: "late_night_sofa", name: "深夜沙发", description: "深夜的沙发，最容易打开心扉", timePreference: ["深夜"], weatherTags: ["任意"], moodBase: "内省温柔" },
  morning_routine: { id: "morning_routine", name: "清晨日常", description: "阳光洒进房间，新的一天从她开始", timePreference: ["清晨"], weatherTags: ["晴天"], moodBase: "清新活力" },
  night_routine: { id: "night_routine", name: "晚间时光", description: "属于她们的私密时间", timePreference: ["晚上"], weatherTags: ["任意"], moodBase: "宁静亲密" },
  kitchen: { id: "kitchen", name: "厨房", description: "一起做饭，一个掌勺一个偷吃", timePreference: ["傍晚"], weatherTags: ["任意"], moodBase: "烟火气温暖" },
  outdoor: { id: "outdoor", name: "户外", description: "散步、看星星，自然中的她们最真实", timePreference: ["下午", "傍晚"], weatherTags: ["晴天", "多云"], moodBase: "自由舒展" },
};
