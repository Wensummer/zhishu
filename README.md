# 智枢 · 全链路智能营销经营策略(前端 demo)

江苏电信 OPC 大赛参赛项目(方向三 · 内部效率提升,核心指标:客户经理人效)。
依托天翼云已备案的国产大模型能力池,做 ToB 为主的「选型 + 营销」智能赋能平台,
帮客户经理把合规模型 API **卖出去、用起来、续下去**,全链路覆盖选型 → 售前 → 服务 → 售后。

与灰色中转站的核心切割:**合规可信** —— 备案模型、渠道纯度、合同锁价、正规发票、7×24 服务、数据不出境。

> 招牌设计:所有「选型推荐」都给**可核验证据链**(评分公式分解 + 各分项数值 + 数据来源与采集时间),
> 做成可复用组件 `EvidenceChainCard`,在简报 / 四问选型 / 横评表多处复用。

---

## 快速开始

```bash
npm install
npm run dev          # 开发模式,http://localhost:3000
# 或(演示/答辩推荐,切换无延迟):
npm run build && npm start
```

> 开发模式下路由按需编译,**首次**访问某页会卡一两秒(带图表的页更明显),属正常现象;
> 生产模式(`build && start`)所有页面预编译,切换是瞬时的。

环境变量见 [`.env.local.example`](.env.local.example)。

## 技术栈

Next.js 14(App Router)· TypeScript · Tailwind CSS · shadcn 风格组件 · Recharts · next-themes(明暗主题)。
全中文界面,响应式(桌面优先),单应用 + 角色切换器演示多视角。

## 演示动线(P0 主线,贯穿同一个客户「云帆智造科技」)

1. **工作台** `/` — 客户/商机列表,点「云帆智造科技」的「查看简报」
2. **通话前简报** `/workbench/briefing/c-1024` — 看「推荐选型」Tab 下的**可核验证据链**(点开看公式与来源),右上「进入通话」
3. **通话中 Copilot** `/workbench/copilot/c-1024` — 点「开始通话」,实时转写 + 意图识别 + 动态弹屏推荐/话术 → 复盘摘要

辅以:右上**角色切换器**(客户经理/管理员/甲方老板/C端)、**主题切换**、右下**答疑 chatbot 浮窗**。

## 页面清单

| 优先级 | 页面 | 路由 |
| --- | --- | --- |
| P0 | 客户经理工作台 | `/` |
| P0 | 通话前智能简报 | `/workbench/briefing/[customerId]` |
| P0 | 通话中实时 Copilot | `/workbench/copilot/[customerId]` |
| P1 | 四问选型向导 | `/wizard` |
| P1 | 模型横评 / 比价 | `/models` |
| P1 | 可用性监控状态页 | `/status` |
| P1 | 管理侧数据大屏 | `/admin` |
| P2 | 平台落地页 | `/landing` |
| P2 | 多面板(老板/个人/C端) | `/panel/{boss,member,user}` |
| P2 | 统一接入 API 控制台 | `/console` |
| P2 | 配置答疑 chatbot | 全局浮窗 |
| P2 | 管理侧配置 | `/admin/{products,pricing,operations,compliance}` |

## 目录结构

```
src/
├── app/                 # 路由与页面(App Router)
├── components/
│   ├── ui/              # shadcn 基础组件
│   ├── evidence/        # ★ EvidenceChainCard 可核验证据链
│   ├── models/          # ★ ModelComparisonTable、比价图
│   ├── status/          # ★ HealthBarometer 晴雨表、公告时间线
│   ├── copilot/         # ★ 实时转写、意图、copilot 客户端
│   ├── workbench/ wizard/ support/ charts/ shared/ layout/
│   └── providers/       # 主题 + 角色 Context
└── lib/
    ├── types/           # 全站数据类型(前后端共享契约)
    ├── demo/            # 演示数据(临时,接后端后移除)
    ├── api/             # ★ 数据访问层(唯一取数入口)
    ├── recommendation/  # 选型评分引擎(产出证据链,多处复用)
    └── roles.ts utils.ts
```

## 数据与接后端

- 全站组件**只从 `lib/api` 取数**,不直接读演示数据。
- 现在 `lib/api` 返回 `lib/demo` 的脱敏假数据;`lib/types` 即前后端共享契约。
- **接后端**:把 `NEXT_PUBLIC_USE_MOCK=false`,实现 `lib/api` 里的 `fetch` 分支即可,
  页面与组件无需改动。后端建议单独项目(Python/FastAPI 或 Dify),前端可加 `app/api` BFF 薄层藏 Key。

## 红线

- 前端不存任何真实 API Key,密钥仅脱敏展示(见 `MaskedField` 与 `/console`)。
- 所有客户名、企业名均为脱敏假数据。
