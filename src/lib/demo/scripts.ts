/**
 * 阶段化话术数据 —— 按客户商机阶段区分。
 *
 * 每个阶段 3 条话术（开场/卖点/异议应对），内容贴合该阶段客户特征。
 * 话术内容含 {contact} 模板变量供后端注入客户称呼。
 */

import type { TalkScript } from "@/lib/types";

/** renew 阶段：续约客户 — 主推锁价+合规，化解比价异议 */
export const RENEW_SCRIPTS: TalkScript[] = [
  {
    id: "renew-s-opening",
    scene: "opening",
    title: "续约切入",
    content:
      "{contact}您好，这季度贵司调用量涨了约 40%，稳定性一直保持在 99.8%。续约前我把用量和选型给您过一遍，顺便锁个价，避免后面调价影响预算。",
  },
  {
    id: "renew-s-sellingPoint",
    scene: "sellingPoint",
    title: "合规 + 锁价",
    content:
      "我们是天翼云备案直连、渠道纯度可出证明，合同锁价 + 调价提前公示，发票对公正规 —— 这几点是中转站给不了的，贵司做预算和审计都省心。",
  },
  {
    id: "renew-s-objection",
    scene: "objection",
    title: "价格异议",
    objection: "市面上有更便宜的中转",
    content:
      "便宜的多是逆向渠道、随时可能跳价或跑路，日志里还可能掺别的模型。我们贵在确定性：锁价、SLA、7×24 和数据不出境。需要的话我把证据链摊给您看每一分数据的来源。",
  },
];

/** upgrade 阶段：用量上涨客户 — 主推升级解锁能力，化解增量成本顾虑 */
export const UPGRADE_SCRIPTS: TalkScript[] = [
  {
    id: "upgrade-s-opening",
    scene: "opening",
    title: "用量升级诊断",
    content:
      "{contact}您好，这几个月贵司调用量增长明显，当前套餐的配额可能快不够用了。我帮您看看是不是升级到更高规格更划算，避免超量后单价反而更贵。",
  },
  {
    id: "upgrade-s-sellingPoint",
    scene: "sellingPoint",
    title: "高规格解锁能力",
    content:
      "升级后不仅能获得更大并发配额，还能解锁高级能力——更低首 token 延迟、更高上下文窗口、优先调度权。这些对您业务体验的提升是立竿见影的，而且综合下来单位成本反而更低。",
  },
  {
    id: "upgrade-s-objection",
    scene: "objection",
    title: "升级成本顾虑",
    objection: "升级后成本更高了",
    content:
      "短期看月费确实上浮了，但按当前增速，下季度您很可能就会触发现有限额，届时的超量费用比升级费高出 30% 以上。升级相当于提前锁一个更低的单价，跑得越多省得越多。",
  },
];

/** expand 阶段：多部门扩容客户 — 主推独立配额+统一管控，化解管理顾虑 */
export const EXPAND_SCRIPTS: TalkScript[] = [
  {
    id: "expand-s-opening",
    scene: "opening",
    title: "多部门扩容方案",
    content:
      "{contact}您好，我们看到贵司多个部门都在使用模型能力，当前共享额度可能不够分。我帮您设计一个多部门独立配额 + 统一管控的方案，每个部门用多少、花多少一目了然。",
  },
  {
    id: "expand-s-sellingPoint",
    scene: "sellingPoint",
    title: "独立配额 + 统一管控",
    content:
      "我们可以按部门设置独立额度、独立预算、独立调用链监控，但统一走您的企业账户结算。各部门互不影响，您随时能看到全盘的用量大盘和成本分布，审计对账一次过。",
  },
  {
    id: "expand-s-objection",
    scene: "objection",
    title: "跨部门管理复杂度",
    objection: "跨部门协调太麻烦，业务部门不好配合",
    content:
      "理解您的顾虑，我们有一键模板方案：您确定总预算和各部门占比后，我们帮配好独立密钥和监控看板。每个部门拿到开箱即用的密钥，不用他们额外配合，您在后管平台就能看到全貌。",
  },
];

/** silent 阶段：沉默预警客户 — 主推轻量方案重新激活，化解预算不足 */
export const SILENT_SCRIPTS: TalkScript[] = [
  {
    id: "silent-s-opening",
    scene: "opening",
    title: "用量下滑诊断",
    content:
      "{contact}您好，看到贵司近两个月用量有所下滑，想跟您了解一下是不是当前的方案不太匹配了。我们可以一起看看问题出在哪，调整个更适合的方案。",
  },
  {
    id: "silent-s-sellingPoint",
    scene: "sellingPoint",
    title: "轻量套餐 + 按量灵活",
    content:
      "如果包年包月的压力太大，可以切到按量付费，用多少付多少，没有硬性最低消费。另外我们还有轻量入门套餐，月费不到原来一半，核心能力保留，等业务恢复再升回去也方便。",
  },
  {
    id: "silent-s-objection",
    scene: "objection",
    title: "预算不足",
    objection: "预算砍了，暂时不需要了",
    content:
      "完全理解，预算收紧时我们都经历过。要不这样——我帮您开一个最低成本的保号方案，月付几十块保留账号和数据配置，这样等预算恢复时可以直接复用，不用重新对接。总比到时候重新接入省事得多。",
  },
];

/** newLead 阶段：新客线索 — 主推建立信任+POC试用，化解供应商锁定 */
export const NEWLEAD_SCRIPTS: TalkScript[] = [
  {
    id: "newlead-s-opening",
    scene: "opening",
    title: "行业切入建立信任",
    content:
      "{contact}您好，我是天翼云的客户经理。了解到贵司在{industry}领域有 AI 能力需求，我们刚帮同行业的几家企业做了落地。方便的话我介绍一下我们能做什么、和市面上的方案有什么不同。",
  },
  {
    id: "newlead-s-sellingPoint",
    scene: "sellingPoint",
    title: "零风险试用 + POC 支持",
    content:
      "我们为前期客户提供零风险的试用方案——首月充值金额全额抵扣次月费用，效果不满意可以退费。另外我们还提供免费 POC 环境，您可以先把真实场景跑一遍，看到效果再做决定。",
  },
  {
    id: "newlead-s-objection",
    scene: "objection",
    title: "已有供应商",
    objection: "我们已经在用别家的了",
    content:
      "理解，切换供应商确实要慎重。不过我们和别家最大的区别是：天翼云是直连备案模型，渠道纯度可出证明、可开正规增值税发票、数据不出境。您可以先拿一个非核心业务过来 POC，不用任何承诺，跑完对比一下延迟和稳定性，数据说话。",
  },
];

/** 阶段 → 话术列表映射 */
export const STAGE_SCRIPTS: Record<string, TalkScript[]> = {
  renew: RENEW_SCRIPTS,
  upgrade: UPGRADE_SCRIPTS,
  expand: EXPAND_SCRIPTS,
  silent: SILENT_SCRIPTS,
  newLead: NEWLEAD_SCRIPTS,
};
