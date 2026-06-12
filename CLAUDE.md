# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

**智枢** — 江苏电信 OPC 大赛参赛项目(方向三:内部效率提升)。核心定位:依托天翼云已备案国产大模型能力池,做 ToB 为主的「选型 + 营销」智能赋能平台,帮电信客户经理把合规模型 API 卖出去、用起来、续下去。

本仓库为**前端**(Next.js 14),后端在 `zhishu--backend/`(Python FastAPI)。两个仓库同属一个项目,**共享 TypeScript ↔ Pydantic 契约**,改字段必须两边同步。

## 启动开发

```bash
# 前端(zhishu)
npm install
npx next dev -p 3000

# 后端(zhishu--backend)
python -m uvicorn app.main:app --reload --port 8000

# 根路径启动(本目录是 workspace root)
# 前端 src/ 目录下有 app/ components/ lib/
```

**联调**:改 `.env.local` 将 `NEXT_PUBLIC_USE_MOCK=false`、`NEXT_PUBLIC_API_BASE=http://localhost:8000`,前端代码零改动。

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Recharts
- 全中文界面,响应式(桌面优先),支持明暗主题

## 目录结构

```
src/
├── app/                        # App Router 页面
│   ├── admin/                  # 管理大屏(compliance/operations/pricing/products/system-models)
│   ├── console/                # 控制台
│   ├── landing/                # 落地页
│   ├── models/                 # 模型池/横评
│   ├── panel/                  # 角色面板(boss/member/user)
│   ├── status/                 # 可用性公告
│   ├── wizard/                 # 选型向导
│   └── workbench/              # 客户经理工作台
│       ├── briefing/[customerId]/  # 通话前简报
│       └── copilot/[customerId]/   # 实时 copilot
├── components/
│   ├── admin/                  # 管理端组件
│   ├── charts/                 # Recharts 图表
│   ├── copilot/                # 通话 copilot 组件
│   ├── evidence/               # ★ 证据链系列(产品差异化主线)
│   │   ├── evidence-chain-card.tsx
│   │   └── recommendation-insight-card.tsx
│   ├── layout/                 # 应用外壳(角色切换器、导航等)
│   ├── models/                 # 模型横评组件
│   ├── providers/              # React Context(角色、主题)
│   ├── shared/                 # 通用组件(stat-card, sparkline, masked-field)
│   ├── ui/                     # shadcn/ui 基础组件
│   ├── wizard/                 # 选型向导组件
│   └── workbench/              # 工作台组件
├── lib/
│   ├── api/index.ts            # ★ 数据访问层(唯一取数入口,受 NEXT_PUBLIC_USE_MOCK 控制)
│   ├── types/index.ts          # ★ 类型契约(前后端共享)
│   ├── demo/                   # Mock 数据(接后端后逐一淘汰)
│   │   ├── announcements.ts, billing.ts, briefings.ts
│   │   ├── customers.ts, metrics.ts, models.ts
│   │   ├── scripts.ts, sessions.ts, system-models.ts
│   ├── recommendation/         # 选型评分引擎
│   │   ├── score.ts            #   综合分 = 能力分 × 可用率 × 成本系数
│   │   └── confidence.ts       #   置信度计算
│   ├── dify/                   # Dify 知识库集成(占位)
│   ├── roles.ts                # 角色定义
│   └── utils.ts                # 工具函数
```

## 核心架构约定

### 数据流

```
组件 → lib/api/index.ts(接缝层) → mock(lib/demo/) 或 后端(HTTP)
```

- **所有组件只通过 `lib/api/index.ts` 取数**,不直接读 demo 文件
- 开关 `NEXT_PUBLIC_USE_MOCK` 控制 mock/后端切换,组件零改动
- 后端路由**挂在根、无 `/api` 前缀**,CORS 默认放行 `localhost:3000`

### 招牌主线:证据链

选型推荐不黑盒打分,必须给可展开的证据链:
```
综合分 = 能力分 × 可用率 × 成本系数
每个分项(EvidenceFactor)都带 source(数据来源) + collectedAt(采集时间)
```
组件 `EvidenceChainCard` 多处复用,保障 UI 清晰可信。

### 角色系统

单应用 + 角色切换器:客户经理 / 管理员 / 甲方老板 / C端用户,同一布局演示多视角。角色上下文在 `providers/role-context.tsx`。

## 红线

- 前端不存任何真实 API Key,密钥字段只脱敏展示
- 所有客户名、企业名用脱敏假数据
- 后端 `response_model_exclude_none=True` 不输出 null(对齐 TS `field?`)

## 工作方式

- 小步推进:优先保证可点可看的演示效果,不一次性堆大量代码
- P0 动线:客户经理工作台 → 通话前简报 → 实时 copilot,数据贯穿同一个客户
- 所有推荐结果不是终点,展开证据链才是

## 后端对应

后端在 `zhishu--backend/` 目录,技术栈 Python 3.12 + FastAPI + Pydantic v2。

**命名坑**:模型名用中文全称如 `"通义千问-Max"` 而非 `"qwen-max"`。`CopilotScript.recommendations/.scripts` 是 `dict`(id 为 key),不是数组。
