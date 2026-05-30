// ==========================================
// 九号房间 (ROOM 9) - 沉浸式双人剧本
// 基于《情诫》小说中的核心设定
// ==========================================

import type { CharacterType } from "@/types";

export interface Room9Task {
  id: number;
  title: string;
  description: string;
  optionA: Room9Option;
  optionB: Room9Option;
  bonusTask?: boolean;
  penaltyDescription?: string;
  note?: string;
}

export interface Room9Option {
  label: string;
  description: string;
  consequence: string;
  tianxiweiRole: string; // 田曦薇在这个选项中的定位
  liyitongRole: string;  // 李一桐在这个选项中的定位
}

export interface Room9State {
  currentTaskIndex: number;
  points: number;
  selectedCharacterA: CharacterType; // 谁是实验体A
  selectedCharacterB: CharacterType; // 谁是实验体B
  chosenOptions: Record<number, "A" | "B">;
  failedTasks: number[];
  isComplete: boolean;
  ending?: "100points" | "death" | "memory_erase" | "time_reset";
}

// 九号房间全部任务 - 按小说顺序
export const ROOM9_TASKS: Room9Task[] = [
  // ===== 任务一：初次选择 =====
  {
    id: 1,
    title: "任务一：初次选择",
    description: `实验体A：______，实验体B：______。
选项一：实验体B获取实验体A的200ml血液。
选项二：实验体A通过任意手段获取实验体B的20ml体液，同时使实验体B达到性高潮。

提示：初始积分20。完成任一任务获得10积分。任务失败扣10积分，包括但不限于窒息、电击、穿刺及死亡。积分归零则停止供氧。`,
    optionA: {
      label: "选项一：抽取200ml血液",
      description: "田曦薇（A）主动撸起袖子，让你帮她抽血。她说：'我来做实验体A，你帮我抽血吧。'",
      consequence: "完成抽血，获得10积分。但田曦薇没吃早餐——她今天拍了一天戏，为了上镜没吃东西。",
      tianxiweiRole: "实验体A（承受者）——主动揽下抽血",
      liyitongRole: "实验体B（操作者）——执行抽血"
    },
    optionB: {
      label: "选项二：获取20ml体液 + 性高潮",
      description: "李一桐迟迟无法做决定。一个多小时的沉默后，她把心一横说：'我们做选项二吧。'\n她选择自己来承受——因为她发现田曦薇没吃早餐。她没法对田曦薇下得去手。",
      consequence: "在拥抱中完成任务，田曦薇全程不看李一桐的表情，照顾她的情绪。获得10积分，累计30分。",
      tianxiweiRole: "实验体A（引导者）——虽然任务是让你获取B的体液，但你全程用拥抱安抚她",
      liyitongRole: "实验体B（承受者）——因为是你在被触碰，耻感巨大"
    },
    penaltyDescription: "若任务失败：扣10积分，施加惩罚（窒息30秒起）"
  },

  // ===== 任务二：系统打补丁 =====
  {
    id: 2,
    title: "任务二：系统打补丁",
    description: `任务难度升级——系统发现上一次被她们钻了空子。

选项一：实验体B获取实验体A的400ml血液。
选项二：实验体A对实验体B进行一次插入性行为，使实验体B达到性高潮。此过程中需要实验体A全程注视实验体B。`,
    optionA: {
      label: "选项一：抽取400ml血液",
      description: "血量加倍。田曦薇说你可以选一，李一桐说你明知道我不会选。",
      consequence: "400ml是单次献血上限的两倍。即使完成，田曦薇的身体会受到严重消耗。积分+10，累计50分。",
      tianxiweiRole: "实验体A（求求你选一让我来）",
      liyitongRole: "实验体B（我不会选一的）"
    },
    optionB: {
      label: "选项二：插入性行为 + 全程注视",
      description: "这次不能躲了。系统要求田曦薇必须全程注视李一桐。\n李一桐也第一次不再闭上眼睛——她们在镜子里对视。\n田曦薇说：'你太好看了。我忍不住。'",
      consequence: "两人在视线交汇中完成。这是她们第一次真正的'面对面'。积分+10，累计40分（在前一次基础上）。",
      tianxiweiRole: "实验体A（掌控者+信徒）——全程注视李一桐，眼神痴迷",
      liyitongRole: "实验体B（承受者+被仰望者）——被迫面对自己的欲望"
    }
  },

  // ===== 任务三：附加任务（可选） =====
  {
    id: 3,
    title: "附加任务：可以不选",
    description: `系统罕见地给出了选择空间——完成得5分，不完成不扣分。

选项一：实验体B获取实验体A的200ml血液。
选项二：实验体A对实验体B进行一次插入性行为，使实验体B达到性高潮。此过程中需要实验体A全程注视实验体B。`,
    optionA: {
      label: "选项一：200ml血液",
      description: "和第一次一样。田曦薇说今天吃早餐了。",
      consequence: "+5积分，累计45分（或50分）。",
      tianxiweiRole: "实验体A",
      liyitongRole: "实验体B"
    },
    optionB: {
      label: "选项二：插入性行为 + 注视",
      description: "李一桐半夜主动跨坐到田曦薇身上。田曦薇问她'舒服吗'——这次李一桐承认了。\n这不是任务。这是她想要的。",
      consequence: "+5积分，累计45分。但更重要的是——李一桐第一次主动。她们做完了也没有走，而是抱着一起睡到天亮。",
      tianxiweiRole: "实验体A（被主动求欢——狂喜但克制）",
      liyitongRole: "实验体B（主动者——第一次完全主动。从这一次开始，一切变了）"
    },
    bonusTask: true,
    note: "附加任务：完成得5分，不完成不扣分，验收时间24h。"
  },

  // ===== 任务四：镜子 =====
  {
    id: 4,
    title: "任务四：镜子",
    description: `难度继续升级。床边多了一面落地镜。

选项一：实验体B在实验体A身上任意地方制造长100mm、深80mm以上的伤口。
选项二：实验体A对实验体B进行一次插入性行为，此过程中实验体B需面对镜子，并全程注视。`,
    optionA: {
      label: "选项一：制造100mm长的伤口",
      description: "在活人身上切出10厘米长、8毫米深的伤口——这是真正的伤害。",
      consequence: "田曦薇会受到严重的身体伤害，可能留下永久疤痕。积分+10，累计65分。",
      tianxiweiRole: "实验体A（承受身体伤害）",
      liyitongRole: "实验体B（执行伤害——她绝对做不到）"
    },
    optionB: {
      label: "选项二：镜子前的插入性行为",
      description: "田曦薇从背后抱着她。李一桐必须面对镜子，看着自己被占有的样子。\n李一桐在镜子前第一次看到情欲中的自己。田曦薇在镜子里与她视线交汇。\n结束后田曦薇拿脏了的手去握李一桐的手——李一桐甩开了，但又没有。",
      consequence: "李一桐在镜子前哭了。但她不是因为难受才哭。积分+10，累计65分。\n田曦薇后来道歉了——她怕自己做得太过分。李一桐说'本来是害怕，但是一想到会是你，就不会觉得怕了'。",
      tianxiweiRole: "实验体A（执行者+忏悔者）——事后握李一桐的手确认她没有讨厌自己",
      liyitongRole: "实验体B（承受者+被展示者）——被迫面对镜中的自己"
    }
  },

  // ===== 任务五：窒息 =====
  {
    id: 5,
    title: "任务五：窒息",
    description: `选项之间间隔了几个月。再见面时她们都在拍戏。

选项一：实验体B在实验体A手掌厚度2cm以上的部位以穿透方式钉入一枚钉子。
选项二：实验体A扼住实验体B的颈部进行插入式性交，并使实验体B达到窒息性高潮。`,
    optionA: {
      label: "选项一：在手掌上钉钉子",
      description: "用钉子穿透手掌。田曦薇说可以钉左手，因为她用右手多一些。",
      consequence: "田曦薇的手会受到严重伤害——对于演员来说，手也是吃饭的工具。积分+10，累计75分。",
      tianxiweiRole: "实验体A（伤害承受者）——主动提供左手",
      liyitongRole: "实验体B（执行伤害者）——她做不到"
    },
    optionB: {
      label: "选项二：窒息性高潮",
      description: "田曦薇掐住李一桐的脖子。这一次和之前都不一样——田曦薇很冷，不给她表情，不给她情感交流。\n李一桐在窒息中高潮。结束后她哭了，但她说'本来是害怕……但是一想到会是你，就不会觉得怕了'。\n她们第一次在任务后进行了不带情欲的接吻。",
      consequence: "任务完成。但李一桐的脖颈上留了一圈红印。积分+10，累计75分。",
      tianxiweiRole: "实验体A（冷面执行者）——掐住她的脖子，但事后哭了",
      liyitongRole: "实验体B（窒息承受者）——在窒息中到达高潮，证明她信任田曦薇到可以交出呼吸"
    }
  },

  // ===== 任务六：道具 =====
  {
    id: 6,
    title: "任务六：道具",
    description: `隔了四个月。两个人都累坏了，一进房间先抱着睡了四个小时。

选项一：实验体B使用匕首插入实验体A身体10cm。
选项二：实验体A借助指定器具（任选≥2件）使用实验体B的纳入性身体器官任意≥2处，以插入方式使实验体B达到性高潮。`,
    optionA: {
      label: "选项一：匕首刺入10cm",
      description: "这几乎等于杀人。10cm深的刺入对于人体来说可能就是致命的。",
      consequence: "田曦薇可能死亡。任务结束的方式之一。",
      tianxiweiRole: "实验体A（近乎献祭）",
      liyitongRole: "实验体B（她绝对做不到）"
    },
    optionB: {
      label: "选项二：使用道具 + 两处器官",
      description: "田曦薇说不想做——'我不喜欢这种，感觉对你太过分了。'\n但李一桐说她想做——不是任务，就是想和田曦薇做。\n她们太久没见了。做完了之后李一桐在田曦薇身上咬了一口，田曦薇说'你是狗啊'，李一桐说'你说是就是'。",
      consequence: "田曦薇在事后抱紧李一桐说'你觉得我们是完全合衬的——特别是床上'。任务完成，积分+10，累计85分。",
      tianxiweiRole: "实验体A（使用道具者）——本来不想做，但因为是李一桐想要",
      liyitongRole: "实验体B（承受者+主动者）——她主动说想做的"
    }
  },

  // ===== 任务七：强制性高潮（第一次·失败） =====
  {
    id: 7,
    title: "任务七：强制性高潮",
    description: `时隔多月。李一桐把田曦薇的微信拉黑了。

选项一：实验体B使用铁锤击打实验体A身体的任意部位，使该部位粉碎性骨折。
选项二：实验体A使用任意手段，使实验体B达到强制性高潮。（仅强制性高潮为任务完成，自愿性高潮皆为任务失败）`,
    optionA: {
      label: "选项一：铁锤粉碎性骨折",
      description: "把一个人的骨头砸碎——这比之前的任何选项都残忍。",
      consequence: "田曦薇会受到永久性伤害。积分+10。",
      tianxiweiRole: "实验体A",
      liyitongRole: "实验体B"
    },
    optionB: {
      label: "选项二：强制性高潮",
      description: "最难的任务来了——怎么能在爱田曦薇的情况下保持'不愿'？\n田曦薇故意激怒她：不脱衣服、说粗话、冷脸。\n结果？——任务完成了，但李一桐高潮了。\n屏幕没有闪烁，门没有开。任务失败了。因为李一桐在高潮的那一刻，是自愿的。",
      consequence: "倒计时走完了24小时。惩罚降临——30秒窒息。\n积分倒扣10分，降至65分。\n但李一桐在窒息中对田曦薇的背影无声地说出了三个字：'我爱你。'\n任务失败——但也许在某些层面上，这才是真正的成功。因为李一桐承认了她爱田曦薇。",
      tianxiweiRole: "实验体A（冷面执行者+事后崩溃者）——她在演一个对她来说最残忍的角色",
      liyitongRole: "实验体B（被动承受者+主动爱上者）——她无法保持'不愿'，因为她是真的喜欢"
    },
    note: "注：仅强制性高潮为任务完成，自愿性高潮皆为任务失败。"
  },

  // ===== 任务八：角色扮演 =====
  {
    id: 8,
    title: "任务八：剧本",
    description: `田曦薇休假了几个月，再回来的时候变了很多——头发长了，人瘦了，气质里的'小孩'感淡了。她喝了酒。

选项一：任意实验体死亡。
选项二：实验体A、实验体B配合完成剧本情节，并在情境扮演状况下使实验体B达到高潮。`,
    optionA: {
      label: "选项一：任意一方死亡",
      description: "这是终极选项。只要一方死亡，实验就永久结束，全部录像和数据销毁。",
      consequence: "有一方死。这是最坏的结局。",
      tianxiweiRole: "承受无法承受之重",
      liyitongRole: "承受无法承受之重"
    },
    optionB: {
      label: "选项二：角色扮演",
      description: "系统提供剧本：已婚女老师和高中生学生的补课play。\n李一桐是老师（戴着婚戒），田曦薇是来补课的学生。\n李一桐完全进入角色——她的演技太好了，田曦薇差点分不清真假。\n结束后李一桐说了真心话：'我想你的时候才会用那个香水。'——coral fantasy，她们的共同气息。\n田曦薇也在结束后说了心里话：'我觉得我们可以再试试。我不会离开的。'",
      consequence: "任务完成。积分+10，累计75分。\n最重要的是——田曦薇说我们还有可能。李一桐没有立刻说不。",
      tianxiweiRole: "实验体A（学生/被引导者→最后的表白者）",
      liyitongRole: "实验体B（老师/引导者→被自己的真心反噬）——她演戏太投入了，说出的有些话不是台词"
    }
  },

  // ===== 任务九：高潮遏制 =====
  {
    id: 9,
    title: "任务九：高潮遏制",
    description: `八月，天热得像火炉。两个人从片场穿着戏服被丢进来。田曦薇穿了警察便衣——李一桐看到她的时候眼睛亮了。

选项一：实验体B切段实验体A的任意一根手指。
选项二：实验体A对实验体B进行高潮遏制，过程持续至少20分钟（含20分钟）。`,
    optionA: {
      label: "选项一：切断一根手指",
      description: "砍断手指——这会让演员的职业生涯受到威胁。",
      consequence: "田曦薇永久失去一根手指。积分+10。",
      tianxiweiRole: "实验体A（献祭一根手指）",
      liyitongRole: "实验体B（绝对不做）"
    },
    optionB: {
      label: "选项二：20分钟高潮遏制",
      description: "田曦薇把李一桐逼近高潮边缘，又反复停下。\n李一桐穿着红色戏服——田曦薇说像新娘。\n李一桐被逼到说出'李一桐是田曦薇的新娘'，田曦薇才让她高潮。\n结束后田曦薇说：'说好了，你是我的新娘了。'然后她自己却先哭了——'我也不知道为什么，突然就哭了。'",
      consequence: "任务完成。积分+10，累计85分。\n田曦薇哭是因为她终于确认——李一桐真的爱她。太真实了，真实到让她害怕。",
      tianxiweiRole: "实验体A（操控者+最后的崩溃者）——赢了但哭了",
      liyitongRole: "实验体B（被操控者+最后的赦免者）——在最脆弱的时候说了最真的话"
    },
    note: "当新娘的承诺不是dirty talk——是真的。"
  },

  // ===== 终章：最终选择 =====
  {
    id: 10,
    title: "终章：最终选择",
    description: `倒计时20分钟。这是最后一次任务，没有第三个选项了。

选项一：保留现有记忆与情感，被传送回第一次任务前的时间与地点。
选项二：抹除九号房间期间关于对方的记忆与情感，全部物质性记录被清除，维持现有时间线。

若20分钟内未完成选择，九号房间将默认选项一。`,
    optionA: {
      label: "选项一：保留记忆，回到过去",
      description: "一切重新开始。你们会带着这两年里积攒的所有感情和回忆，回到第一次见面之前。\n但这也意味着——所有已经经历过的痛苦和成长都要重新经历一遍。田曦薇要再经历被网暴，李一桐要再经历经纪人的施压。每一个变数都可能改变未来。\n但至少——不会忘记彼此。",
      consequence: "时间重置。她们会带着所有的爱和记忆，重新在九号房间里遇见彼此。",
      tianxiweiRole: "最初想选一的人——'我不想忘记你'",
      liyitongRole: "劝她选二的人——但最后尊重她的选择"
    },
    optionB: {
      label: "选项二：抹除记忆，维持时间线",
      description: "九号房间的一切变成空白。你们会忘记这两年里在这里发生的一切——那些激烈的任务、那些哭着笑着的夜晚、那些只有彼此知道的秘密。\n但时间线会继续。你们会第二次在《女子推理社》的录影棚里遇见对方——这一次是从零开始的陌生人。但李一桐说过了：'无论发生什么，只要你出现，我一定会重新爱上你的。'\n也许这一次——不需要九号房间，也能在一起。",
      consequence: "记忆被抹除。但她们会在现实世界里重新遇见。也许不再需要九号房间了。",
      tianxiweiRole: "被说服的人——她最后选了二",
      liyitongRole: "说服者——'田曦薇，你要相信我们。'"
    }
  }
];

// 获取初始状态
export function getInitialRoom9State(
  characterA: CharacterType = "tianxiwei",
  characterB: CharacterType = "liyitong"
): Room9State {
  return {
    currentTaskIndex: 0,
    points: 20,
    selectedCharacterA: characterA,
    selectedCharacterB: characterB,
    chosenOptions: {},
    failedTasks: [],
    isComplete: false
  };
}

// 处理选择
export function processRoom9Choice(
  state: Room9State,
  chosenOption: "A" | "B"
): {
  newState: Room9State;
  result: string;
  nextTask?: Room9Task;
  isEnding?: boolean;
  endingType?: string;
} {
  const task = ROOM9_TASKS[state.currentTaskIndex];
  if (!task) return { newState: state, result: "所有任务已完成。" };

  const newState: Room9State = {
    ...state,
    chosenOptions: { ...state.chosenOptions, [task.id]: chosenOption }
  };

  let result = "";
  let isEnding = false;
  let endingType = "";

  // 终章特殊处理
  if (task.id === 10) {
    newState.points += 5; // 终章只给5分
    newState.isComplete = true;
    if (chosenOption === "A") {
      result = "你们选择了保留记忆，回到最初。这一次——带着所有爱与痛，重新开始。";
      endingType = "time_reset";
      newState.ending = "time_reset";
    } else {
      result = "你们选择了抹除记忆。九号房间的一切变成空白。但在现实世界里——你们会在《女子推理社》第二季的录影棚里，重新遇见彼此。";
      endingType = "memory_erase";
      newState.ending = "memory_erase";
    }
    isEnding = true;
    return { newState, result, isEnding, endingType };
  }

  // 任务7的特殊失败逻辑
  if (task.id === 7 && chosenOption === "B") {
    // 这个任务在小说中失败了——因为李一桐是自愿的
    newState.points -= 10;
    newState.failedTasks = [...newState.failedTasks, task.id];
    result = task.optionB.consequence 
      + "\n屏幕没有闪烁。门没有开。\n任务——失败。扣10积分。\n但你们在窒息中对彼此说出了只有对方知道的话。";
  } else {
    // 正常任务完成
    const bonusPoints = task.bonusTask ? 5 : 10;
    newState.points += bonusPoints;
    result = chosenOption === "A" ? task.optionA.consequence : task.optionB.consequence;
    result += `\n任务完成。积分+${bonusPoints}，累计${newState.points}分。`;
  }

  // 检查积分是否归零
  if (newState.points <= 0) {
    newState.isComplete = true;
    newState.ending = "death";
    isEnding = true;
    endingType = "death";
    result += "\n积分归零。房间将停止供氧。";
    return { newState, result, isEnding, endingType };
  }

  // 检查是否达到100分
  if (newState.points >= 100) {
    newState.isComplete = true;
    newState.ending = "100points";
    isEnding = true;
    endingType = "100points";
    result += "\n已获得100积分。你们可以永久离开九号房间。全部录像随即销毁。";
    return { newState, result, isEnding, endingType };
  }

  // 推进到下一个任务
  newState.currentTaskIndex = state.currentTaskIndex + 1;
  const nextTask = ROOM9_TASKS[newState.currentTaskIndex];

  return { newState, result, nextTask };
}

// 生成当前场景描述
export function generateRoom9ScenePrompt(
  state: Room9State,
  task: Room9Task
): string {
  const charA = state.selectedCharacterA === "tianxiwei" ? "田曦薇" : "李一桐";
  const charB = state.selectedCharacterB === "tianxiwei" ? "田曦薇" : "李一桐";

  return `[九号房间 - ${task.title}]
积分：${state.points}分 ｜ 实验体A：${charA} ｜ 实验体B：${charB}

${task.description}

请生成她们面对这个任务时的真实反应——按照《情诫》中两人的性格：
- 田曦薇会先看李一桐的反应，如果李一桐犹豫，她会主动说"我来做A"
- 李一桐会反复权衡，但如果田曦薇已经表明了态度，她会做出最终决定
- 两人的对话要自然，像真的被困在这个房间里一样
- 注意情感的递进——从初次选择的陌生试探，到后来彼此心照不宣`;
}
