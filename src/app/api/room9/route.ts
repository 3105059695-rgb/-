// ==========================================
// 九号房间 (ROOM 9) API
// 沉浸式双人互动场景
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { ROOM9_TASKS, getInitialRoom9State, processRoom9Choice, generateRoom9ScenePrompt } from "@/lib/room9";
import { TIANXIWEI_SYSTEM_PROMPT } from "@/lib/prompts/tianxiwei";
import { LIYITONG_SYSTEM_PROMPT } from "@/lib/prompts/liyitong";
import { DUAL_INTERACTION_PROMPT } from "@/lib/prompts/dual";
import { REAL_WORLD_KNOWLEDGE, FANFIC_KNOWLEDGE } from "@/lib/knowledge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      currentTaskIndex = 0,
      points = 20,
      chosenOption,
      failedTasks = [],
      chosenOptions = {},
      characterA = "tianxiwei",
      characterB = "liyitong",
      userMessage,
      userId
    } = body;

    const state = {
      currentTaskIndex,
      points,
      selectedCharacterA: characterA,
      selectedCharacterB: characterB,
      chosenOptions,
      failedTasks,
      isComplete: false
    };

    // 处理不同 action
    switch (action) {
      // 获取当前任务信息
      case "get_task": {
        const task = ROOM9_TASKS[currentTaskIndex];
        if (!task) {
          return NextResponse.json({
            success: false,
            message: "所有任务已完成",
            state
          });
        }
        const scenePrompt = generateRoom9ScenePrompt(state, task);
        return NextResponse.json({
          success: true,
          task,
          scenePrompt,
          state
        });
      }

      // 做出选择
      case "choose": {
        if (!chosenOption || !["A", "B"].includes(chosenOption)) {
          return NextResponse.json({
            success: false,
            message: "请选择选项A或B"
          });
        }

        const task = ROOM9_TASKS[currentTaskIndex];
        if (!task) {
          return NextResponse.json({
            success: false,
            message: "所有任务已完成"
          });
        }

        const {
          newState,
          result,
          nextTask,
          isEnding,
          endingType
        } = processRoom9Choice(state, chosenOption);

        // 生成AI对话——基于任务内容让两个角色互动
        const charAText = characterA === "tianxiwei" ? "田曦薇" : "李一桐";
        const charBText = characterB === "tianxiwei" ? "田曦薇" : "李一桐";

        const chosenOptionData = chosenOption === "A" ? task.optionA : task.optionB;

        const dialoguePrompt = `[九号房间 - ${task.title}]
实验体A：${charAText} ｜ 实验体B：${charBText}
当前积分：${state.points}分
选择结果：${chosenOption === "A" ? "选项一" : "选项二"}

${result}

请生成她们在这个时刻的对话（2-4轮）。每轮包含角色、台词、内心OS（可选）、情绪标签和动作描述。

格式：JSON数组
[
  { "character": "${characterA}", "text": "...", "innerOS": "...", "emotion": "标签", "action": "*动作*" },
  { "character": "${characterB}", "text": "...", "innerOS": "...", "emotion": "标签", "action": "*动作*" }
]

情绪标签可选：开心|害羞|吃醋|不安|内耗|生气|感动|放松|焦虑|幸福|担忧|警觉|心疼|满足|撒娇|温柔|认真|期待|得意|困惑|委屈|骄傲|后悔|急|暖

要求：
1. 对话必须真实反映她们的性格——田曦薇的偏执坦诚，李一桐的理性温柔
2. 如果任务完成，要有释放感；如果任务失败，要有真实的情绪反应
3. 她们对彼此的称呼要遵循《情诫》设定——田曦薇可能叫"一桐姐"或"李一桐"，李一桐可能叫"小田"或"田曦薇"`;

        try {
          const apiKey = process.env.DEEPSEEK_API_KEY;
          if (!apiKey) {
            // 没有API key时返回without对话
            return NextResponse.json({
              success: true,
              result,
              task,
              newState,
              nextTask,
              isEnding,
              endingType,
              dialogues: []
            });
          }

          const fullSystemPrompt = `${TIANXIWEI_SYSTEM_PROMPT}
----------------------------------------
${LIYITONG_SYSTEM_PROMPT}
----------------------------------------
${DUAL_INTERACTION_PROMPT}
----------------------------------------
${REAL_WORLD_KNOWLEDGE}
----------------------------------------
${FANFIC_KNOWLEDGE}
----------------------------------------
[当前模式：九号房间]
你们被困在一个白色的房间里。屏幕上的任务让你们必须做出选择。
在这里，你们不需要扮演——因为除了彼此，没有别人。这里的时间不流动，是你们从世界手中偷来的。
你们可以更坦诚、更直接、更真实。
但记住——离开九号房间之后，你们仍然是艺人，仍然有各自的事业和团队。这份分裂感是你们关系的一部分。`;

          const response = await fetch(
            `${process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1"}/chat/completions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
                messages: [
                  { role: "system", content: fullSystemPrompt },
                  { role: "user", content: dialoguePrompt }
                ],
                temperature: 0.95,
                max_tokens: 2048,
                top_p: 0.95,
                frequency_penalty: 0.3,
                presence_penalty: 0.3,
                response_format: { type: "json_object" }
              })
            }
          );

          if (!response.ok) {
            console.error("DeepSeek API error:", await response.text());
            return NextResponse.json({
              success: true,
              result,
              task,
              newState,
              nextTask,
              isEnding,
              endingType,
              dialogues: []
            });
          }

          const data = await response.json();
          let dialogues = [];
          try {
            const content = data.choices[0].message.content;
            const parsed = JSON.parse(content);
            dialogues = parsed.dialogues || parsed;
            if (!Array.isArray(dialogues)) dialogues = [];
          } catch {
            dialogues = [];
          }

          return NextResponse.json({
            success: true,
            result,
            task,
            newState,
            nextTask,
            isEnding,
            endingType,
            dialogues
          });
        } catch (aiError) {
          console.error("AI generation error:", aiError);
          return NextResponse.json({
            success: true,
            result,
            task,
            newState,
            nextTask,
            isEnding,
            endingType,
            dialogues: []
          });
        }
      }

      // 初始化新游戏
      case "init": {
        const initialState = getInitialRoom9State(characterA, characterB);
        const firstTask = ROOM9_TASKS[0];
        return NextResponse.json({
          success: true,
          state: initialState,
          task: firstTask,
          scenePrompt: generateRoom9ScenePrompt(initialState, firstTask)
        });
      }

      default:
        return NextResponse.json({
          success: false,
          message: `未知的action: ${action}。可选: get_task, choose, init`
        });
    }
  } catch (error) {
    console.error("Room 9 API error:", error);
    return NextResponse.json({
      success: false,
      message: "服务器错误"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "九号房间 API",
    actions: ["init", "get_task", "choose"],
    totalTasks: ROOM9_TASKS.length,
    tasks: ROOM9_TASKS.map(t => ({
      id: t.id,
      title: t.title,
      bonusTask: t.bonusTask || false
    }))
  });
}
