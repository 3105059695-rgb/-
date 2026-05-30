# 桐薇宇宙 - 沉浸式CP互动网站

以田曦薇、李一桐的真实性格与真实互动（尤其是《女子推理社》中的经历）为蓝本，
由 DeepSeek API 驱动的双角色 AI 互动站点。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **后端**: Next.js API Routes → DeepSeek API
- **数据库**: PostgreSQL (Vercel Postgres / 自建) + Pinecone (向量记忆库)
- **部署**: Vercel

## 快速开始

### 1. 环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

| 变量名 | 说明 |
|--------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 (https://platform.deepseek.com) |
| `PINECONE_API_KEY` | Pinecone API 密钥 (https://pinecone.io) |
| `PINECONE_INDEX_NAME` | Pinecone 索引名 (默认 `tongwei-memories`) |
| `POSTGRES_URL` | PostgreSQL 连接地址 |
| `NEXTAUTH_SECRET` | 随机密钥 (用于 JWT) |
| `CRON_SECRET` | 定时任务密钥 (用于 /api/daily-life) |

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
npm run db:migrate
```

### 4. 注入记忆（可选，推荐）

```bash
npm run db:seed-memories
```

这会向 PostgreSQL 和 Pinecone 注入《女子推理社》中二人的真实互动记忆。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 在 Vercel 项目设置中配置环境变量
4. 部署完成后设置 Cron Job：
   - 路径: `/api/daily-life`
   - 频率: 每 30 分钟
   - 添加 Authorization Header: `Bearer <你的CRON_SECRET>`

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # 认证（匿名 + 邮箱登录）
│   │   ├── chat/route.ts          # 对话生成
│   │   ├── daily-life/route.ts   # 离线定时日常
│   │   ├── memories/route.ts     # 记忆查询
│   │   └── private-message/route.ts # 私信
│   ├── globals.css                # 全局样式（奶油色系 + 深色模式）
│   ├── layout.tsx                 # 根布局
│   └── page.tsx                   # 首页
├── components/
│   ├── Layout/Header.tsx          # 顶部导航（含羁绊之书、私信、认证面板）
│   └── Stage/
│       ├── MainStage.tsx         # 主舞台（三栏布局 + 交互控制）
│       ├── TianPanel.tsx         # 田曦薇视角面板
│       ├── LitongPanel.tsx       # 李一桐视角面板
│       ├── DialogueStream.tsx    # 对话流（打字机效果）
│       └── Danmaku.tsx           # 弹幕层
├── lib/
│   ├── db.ts                     # PostgreSQL 操作
│   ├── deepseek.ts               # DeepSeek API 封装（含 System Prompt 组装）
│   ├── memory.ts                 # 记忆整合系统
│   ├── pinecone.ts              # Pinecone 向量记忆库
│   ├── store.ts                  # Zustand 全局状态
│   └── prompts/
│       ├── tianxiwei.ts         # 田曦薇 System Prompt
│       ├── liyitong.ts          # 李一桐 System Prompt
│       └── dual.ts              # 双人交互规则
├── types/index.ts                # TypeScript 类型
scripts/
├── migrate.ts                    # 数据库迁移脚本
└── seed-memories.ts             # 记忆注入脚本
```

## 核心功能

- **偷看模式**: 默认为旁观，每15秒自动推送新的CP日常对话
- **弹幕介入**: 发送弹幕飘过，角色会看到并自然回应
- **推门介入**: 点击按钮进入三人对话模式，直接与角色聊天
- **私信模式**: 单独私信田曦薇或李一桐
- **羁绊之书**: 自动捕捉甜蜜互动生成定格卡片
- **深夜模式**: 晚上自动切换深色主题
- **雨天特效**: 雨天场景自动播放雨滴动画
