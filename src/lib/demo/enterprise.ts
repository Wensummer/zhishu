/**
 * 演示用企查查企业画像数据(临时)。
 * Phase 后期由后端从企查查 MCP 获取真实数据替换。
 */
import type { EnterpriseInfo } from "@/lib/types";

/** c-1024 · 云帆智造科技 — 制造业,续约阶段 */
const ENTERPRISE_C1024: EnterpriseInfo = {
  profile: {
    name: "云帆智造科技",
    creditCode: "91320115MA25XXXXXX",
    legalPerson: "张建国",
    registeredCapital: "5000万元人民币",
    establishDate: "2015-03-12",
    businessStatus: "存续",
    address: "江苏省南京市江宁区智能制造产业园A区8号",
    businessScope: "智能制造技术研发;工业互联网平台建设;AI质检系统开发;自动化设备生产与销售;计算机软硬件技术开发、技术咨询、技术转让",
    contactPerson: "周经理",
    contactPhone: "138****5523",
  },
  personnel: [
    { name: "张建国", title: "董事长兼总经理" },
    { name: "李华", title: "技术总监" },
    { name: "周晓", title: "采购经理" },
    { name: "王芳", title: "财务负责人" },
  ],
  shareholders: [
    { name: "张建国", ratio: "55%", amount: "2750万元" },
    { name: "南京智造产业投资基金", ratio: "25%", amount: "1250万元" },
    { name: "李华", ratio: "12%", amount: "600万元" },
    { name: "员工持股平台", ratio: "8%", amount: "400万元" },
  ],
  controller: { name: "张建国", ratio: "55%", path: "直接持股55%" },
  branches: [
    { name: "云帆智造(苏州)科技有限公司", ratio: "100%", amount: "1000万元", businessStatus: "存续" },
    { name: "云帆智造(深圳)研发中心", ratio: "100%", amount: "500万元", businessStatus: "存续" },
    { name: "南京云帆工业互联网有限公司", ratio: "60%", amount: "300万元", businessStatus: "存续" },
  ],
  honors: [
    { name: "国家高新技术企业", issuer: "科学技术部", date: "2023-10" },
    { name: "江苏省专精特新中小企业", issuer: "江苏省工信厅", date: "2024-06" },
    { name: "ISO 9001质量管理体系认证", issuer: "SGS", date: "2024-03" },
    { name: "江苏省智能制造示范车间", issuer: "江苏省工信厅", date: "2025-01" },
  ],
  funding: [
    { round: "天使轮", amount: "2000万元", date: "2020-08", investors: "深创投" },
    { round: "A轮", amount: "8000万元", date: "2022-05", investors: "达晨创投、真格基金" },
    { round: "B轮", amount: "2亿元", date: "2026-03", investors: "红杉中国" },
  ],
  risks: [
    { type: "裁判文书", title: "买卖合同纠纷(原告)", date: "2025-09-15", amount: "42万元", department: "南京市江宁区人民法院", detail: "与供应商就设备货款纠纷,已庭外和解撤诉" },
    { type: "行政处罚", title: "消防设施未定期检测", date: "2025-06-20", amount: "1.5万元", department: "江宁区消防救援大队", detail: "罚款1.5万元,已整改" },
  ],
  news: [
    { title: "云帆智造AI质检系统获2026年度江苏省工业互联网示范项目", url: "#", date: "2026-05-28", sentiment: "positive", summary: "云帆智造自主研发的AI质检系统入选省级示范项目,将在全省制造业推广。" },
    { title: "云帆智造完成B轮融资 估值超20亿元", url: "#", date: "2026-03-15", sentiment: "positive", summary: "本轮融资由红杉中国领投,资金将用于AI大模型在工业场景的深度落地。" },
    { title: "云帆智造与南京理工大学共建智能制造联合实验室", url: "#", date: "2025-12-08", sentiment: "positive", summary: "校企合作聚焦工业视觉检测与AI质检算法研究。" },
  ],
  ipr: [
    { type: "patent", name: "基于深度学习的工业缺陷检测方法及系统", regNo: "CN202510XXXXXX.X", status: "授权", applyDate: "2025-06-15" },
    { type: "patent", name: "多模态数据融合的产品质量评估装置", regNo: "CN202510XXXXXX.Y", status: "实审", applyDate: "2026-01-20" },
    { type: "trademark", name: "云帆智造 YUNFAN", regNo: "第9类", status: "注册", applyDate: "2024-08-01" },
    { type: "copyright", name: "云帆AI质检管理平台 V3.0", regNo: "软著2025XXXXXX", status: "登记", applyDate: "2025-09-10" },
  ],
  bids: [
    { title: "江苏省制造业数字化转型公共服务平台建设项目", publishDate: "2026-04-10", amount: "680万元", buyer: "江苏省工业和信息化厅" },
    { title: "南京经开区智慧工厂AI质检系统采购项目", publishDate: "2025-11-20", amount: "245万元", buyer: "南京经济技术开发区管委会" },
  ],
};

/** c-1031 · 锦书文化传媒 — 内容/营销,升级阶段 */
const ENTERPRISE_C1031: EnterpriseInfo = {
  profile: {
    name: "锦书文化传媒",
    creditCode: "91310115MA1KXXXXXX",
    legalPerson: "林锦",
    registeredCapital: "1000万元人民币",
    establishDate: "2019-07-22",
    businessStatus: "存续",
    address: "上海市浦东新区张江高科技园区博云路58号",
    businessScope: "文化艺术交流策划;数字内容制作;新媒体运营;广告设计、制作、代理、发布;影视策划;技术进出口",
    contactPerson: "林总",
    contactPhone: "139****2108",
  },
  personnel: [
    { name: "林锦", title: "CEO" },
    { name: "陈思", title: "COO" },
    { name: "张巍", title: "技术总监" },
  ],
  shareholders: [
    { name: "林锦", ratio: "70%", amount: "700万元" },
    { name: "上海文化产业发展基金", ratio: "20%", amount: "200万元" },
    { name: "陈思", ratio: "10%", amount: "100万元" },
  ],
  controller: { name: "林锦", ratio: "70%", path: "直接持股70%" },
  branches: [
    { name: "锦书文化(北京)分公司", ratio: "100%", amount: "—", businessStatus: "存续" },
    { name: "锦书文化(杭州)内容制作中心", ratio: "100%", amount: "200万元", businessStatus: "存续" },
  ],
  honors: [
    { name: "上海市文化企业十佳", issuer: "上海市委宣传部", date: "2026-05" },
    { name: "国家高新技术企业", issuer: "科学技术部", date: "2024-12" },
    { name: "ISO 27001信息安全管理体系认证", issuer: "SGS", date: "2025-06" },
  ],
  funding: [
    { round: "种子轮", amount: "500万元", date: "2019-10", investors: "个人投资者" },
    { round: "Pre-A轮", amount: "2000万元", date: "2021-07", investors: "紫竹创投" },
  ],
  risks: [
    { type: "经营异常", title: "通过登记的住所无法联系", date: "2023-04-10", department: "浦东新区市场监督管理局", detail: "已变更登记地址后移出异常名录" },
  ],
  news: [
    { title: "锦书文化获2026年「上海文化企业十佳」称号", url: "#", date: "2026-05-10", sentiment: "positive", summary: "锦书文化凭借AIGC内容生产效率优势,入选上海市文化企业十佳。" },
    { title: "锦书文化AIGC内容平台上线,日产10万条营销文案", url: "#", date: "2026-02-18", sentiment: "positive", summary: "基于大模型的内容生成平台正式上线,客户内容生产效率提升3倍。" },
  ],
  ipr: [
    { type: "trademark", name: "锦书 JINSHU", regNo: "第35类", status: "注册", applyDate: "2020-03-15" },
    { type: "trademark", name: "锦书 JINSHU", regNo: "第41类", status: "注册", applyDate: "2020-03-15" },
    { type: "copyright", name: "锦书AIGC内容管理系统 V2.0", regNo: "软著2025XXXXXX", status: "登记", applyDate: "2025-11-05" },
  ],
  bids: [
    { title: "上海城市形象数字化传播内容制作项目", publishDate: "2026-01-15", amount: "180万元", buyer: "上海市委宣传部" },
  ],
};

/** c-1042 · 恒生金服数科 — 金融科技,扩容阶段 */
const ENTERPRISE_C1042: EnterpriseInfo = {
  profile: {
    name: "恒生金服数科",
    creditCode: "91330100MA2XXXXXX",
    legalPerson: "陈国栋",
    registeredCapital: "2亿元人民币",
    establishDate: "2017-01-08",
    businessStatus: "存续",
    address: "浙江省杭州市滨江区网商路599号",
    businessScope: "金融科技领域技术开发;数据处理与存储服务;计算机系统集成;人工智能应用软件开发;企业征信服务;信息安全技术开发",
    contactPerson: "吴总监",
    contactPhone: "136****8801",
  },
  personnel: [
    { name: "陈国栋", title: "董事长" },
    { name: "徐明", title: "总经理" },
    { name: "吴涛", title: "技术总监" },
    { name: "刘敏", title: "合规总监" },
    { name: "郑红", title: "财务总监" },
  ],
  shareholders: [
    { name: "恒生电子股份有限公司", ratio: "60%", amount: "1.2亿元" },
    { name: "杭州金投集团", ratio: "20%", amount: "4000万元" },
    { name: "核心管理团队", ratio: "15%", amount: "3000万元" },
    { name: "其他股东", ratio: "5%", amount: "1000万元" },
  ],
  controller: { name: "恒生电子股份有限公司", ratio: "60%", path: "通过恒生电子间接控制" },
  branches: [
    { name: "恒生金服(上海)科技有限公司", ratio: "100%", amount: "5000万元", businessStatus: "存续" },
    { name: "恒生金服(北京)研发分公司", ratio: "100%", amount: "—", businessStatus: "存续" },
    { name: "恒生金服(深圳)子公司", ratio: "100%", amount: "3000万元", businessStatus: "存续" },
    { name: "杭州恒金信息技术有限公司", ratio: "51%", amount: "510万元", businessStatus: "存续" },
  ],
  honors: [
    { name: "国家高新技术企业", issuer: "科学技术部", date: "2020-12" },
    { name: "ISO 27001信息安全管理体系认证", issuer: "SGS", date: "2026-04" },
    { name: "CMMI L3软件能力成熟度认证", issuer: "CMMI Institute", date: "2024-08" },
    { name: "浙江省高新技术企业研究开发中心", issuer: "浙江省科技厅", date: "2024-12" },
    { name: "金融科技创新十佳案例", issuer: "中国金融科技峰会", date: "2025-11" },
  ],
  funding: [
    { round: "天使轮", amount: "5000万元", date: "2017-06", investors: "恒生电子、杭州金投" },
    { round: "A轮", amount: "2亿元", date: "2019-03", investors: "国开金融、浙商创投" },
  ],
  risks: [],
  news: [
    { title: "恒生金服数科获ISO 27001信息安全管理体系认证", url: "#", date: "2026-04-22", sentiment: "positive", summary: "通过国际信息安全管理体系认证,数据安全能力达到国际标准。" },
    { title: "恒生金服数科与多家银行达成智能风控合作", url: "#", date: "2026-03-01", sentiment: "positive", summary: "与招商银行、浦发银行签署智能风控系统合作协议。" },
    { title: "浙江省金融科技协会授予恒生金服年度创新奖", url: "#", date: "2025-11-15", sentiment: "positive", summary: "恒生金服数科在金融大模型应用领域的创新成果获行业认可。" },
  ],
  ipr: [
    { type: "patent", name: "基于联邦学习的跨机构风控建模方法", regNo: "CN202410XXXXXX.X", status: "授权", applyDate: "2024-08-20" },
    { type: "patent", name: "金融知识图谱构建方法与系统", regNo: "CN202510XXXXXX.Z", status: "实审", applyDate: "2025-03-10" },
    { type: "trademark", name: "恒金风控", regNo: "第36类", status: "注册", applyDate: "2023-06-01" },
    { type: "trademark", name: "恒金数智", regNo: "第9类", status: "注册", applyDate: "2024-01-15" },
    { type: "copyright", name: "恒生金服智能风控平台 V4.0", regNo: "软著2024XXXXXX", status: "登记", applyDate: "2024-12-01" },
    { type: "copyright", name: "恒生金服合规审计系统 V2.0", regNo: "软著2025XXXXXX", status: "登记", applyDate: "2025-07-20" },
  ],
  bids: [
    { title: "招商银行智能风控系统二期建设项目", publishDate: "2026-03-10", amount: "1200万元", buyer: "招商银行股份有限公司" },
    { title: "浙江省金融综合服务平台风险预警模块采购", publishDate: "2025-10-15", amount: "560万元", buyer: "浙江省地方金融监督管理局" },
    { title: "浦发银行反欺诈模型升级项目", publishDate: "2025-08-01", amount: "850万元", buyer: "上海浦东发展银行" },
  ],
};

/** c-1055 · 蓝橙教育 — 在线教育,沉默阶段 */
const ENTERPRISE_C1055: EnterpriseInfo = {
  profile: {
    name: "蓝橙教育",
    creditCode: "91320105MA1MXXXXXX",
    legalPerson: "陈蓝",
    registeredCapital: "500万元人民币",
    establishDate: "2020-09-01",
    businessStatus: "存续",
    address: "江苏省南京市鼓楼区汉中门大街88号",
    businessScope: "在线教育技术开发;教育软件销售;教育咨询服务;互联网信息服务;音视频制作与发行",
    contactPerson: "陈老师",
    contactPhone: "158****3421",
  },
  personnel: [
    { name: "陈蓝", title: "创始人兼CEO" },
    { name: "孙蓓", title: "运营总监" },
    { name: "赵刚", title: "技术负责人" },
  ],
  shareholders: [
    { name: "陈蓝", ratio: "80%", amount: "400万元" },
    { name: "孙蓓", ratio: "15%", amount: "75万元" },
    { name: "赵刚", ratio: "5%", amount: "25万元" },
  ],
  controller: { name: "陈蓝", ratio: "80%", path: "直接持股80%" },
  branches: [],
  honors: [
    { name: "江苏省科技型中小企业", issuer: "江苏省科技厅", date: "2023-05" },
    { name: "南京市创新型中小企业", issuer: "南京市工信局", date: "2024-03" },
  ],
  funding: [
    { round: "种子轮", amount: "300万元", date: "2020-10", investors: "个人投资者" },
  ],
  risks: [
    { type: "经营异常", title: "未按期公示年度报告", date: "2025-07-01", department: "江苏省市场监督管理局", detail: "已补报并移出异常名录" },
    { type: "裁判文书", title: "教育培训合同纠纷(被告)", date: "2025-04-20", amount: "8万元", department: "南京市鼓楼区人民法院", detail: "用户退费纠纷,经调解达成退费协议" },
  ],
  news: [
    { title: "「双减」政策持续影响,在线教育行业进入存量竞争", url: "#", date: "2026-05-06", sentiment: "negative", summary: "行业整体收缩,蓝橙教育也在调整业务线,关停了部分学科辅导板块。" },
    { title: "蓝橙教育转型素质教育,推出AI编程课程", url: "#", date: "2025-10-20", sentiment: "positive", summary: "积极响应政策导向,新上线AI编程与机器人教育课程,探索素质教育新方向。" },
  ],
  ipr: [
    { type: "trademark", name: "蓝橙 LANCHE", regNo: "第41类", status: "注册", applyDate: "2021-05-10" },
    { type: "copyright", name: "蓝橙在线课堂系统 V3.0", regNo: "软著2023XXXXXX", status: "登记", applyDate: "2023-08-15" },
    { type: "copyright", name: "蓝橙AI编程教学平台 V1.0", regNo: "软著2025XXXXXX", status: "登记", applyDate: "2025-11-20" },
  ],
  bids: [],
};

/** c-2003 · 途新出行 — 出行/物流,新客 */
const ENTERPRISE_C2003: EnterpriseInfo = {
  profile: {
    name: "途新出行",
    creditCode: "91310112MA1GXXXXXX",
    legalPerson: "赵新",
    registeredCapital: "3000万元人民币",
    establishDate: "2022-04-18",
    businessStatus: "存续",
    address: "上海市闵行区紫竹科学园区紫星路588号",
    businessScope: "网络预约出租汽车经营服务;智能出行平台开发;车载智能终端研发;大数据分析应用;人工智能技术开发",
    contactPerson: "赵经理",
    contactPhone: "177****6699",
  },
  personnel: [
    { name: "赵新", title: "创始人兼CEO" },
    { name: "王磊", title: "CTO" },
    { name: "张悦", title: "运营VP" },
  ],
  shareholders: [
    { name: "赵新", ratio: "60%", amount: "1800万元" },
    { name: "顺为资本", ratio: "25%", amount: "750万元" },
    { name: "核心团队期权池", ratio: "15%", amount: "450万元" },
  ],
  controller: { name: "赵新", ratio: "60%", path: "直接持股60%" },
  branches: [
    { name: "途新出行(杭州)技术研发中心", ratio: "100%", amount: "500万元", businessStatus: "存续" },
  ],
  honors: [
    { name: "上海市科技型中小企业", issuer: "上海市科委", date: "2024-07" },
  ],
  funding: [
    { round: "天使轮", amount: "3000万元", date: "2026-01", investors: "顺为资本" },
  ],
  risks: [],
  news: [
    { title: "途新出行获网约车全国运营牌照", url: "#", date: "2026-05-20", sentiment: "positive", summary: "途新出行获得交通运输部颁发的全国网约车运营资质,业务版图即将扩张。" },
    { title: "途新出行完成天使轮融资3000万元", url: "#", date: "2026-01-10", sentiment: "positive", summary: "由顺为资本领投,资金用于智能调度系统和AI客服平台建设。" },
    { title: "途新出行与高德地图达成战略合作", url: "#", date: "2025-11-05", sentiment: "positive", summary: "双方将在路线规划、实时路况和智能推荐方面展开深度合作。" },
  ],
  ipr: [
    { type: "patent", name: "基于供需预测的网约车智能调度方法", regNo: "CN202510XXXXXX.W", status: "实审", applyDate: "2025-09-15" },
    { type: "trademark", name: "途新出行 TUXING", regNo: "第39类", status: "注册", applyDate: "2024-06-01" },
    { type: "copyright", name: "途新出行调度管理平台 V2.0", regNo: "软著2025XXXXXX", status: "登记", applyDate: "2025-06-30" },
  ],
  bids: [
    { title: "上海市闵行区智慧出行综合服务平台采购", publishDate: "2026-03-01", amount: "320万元", buyer: "上海市闵行区交通委员会" },
  ],
};

const ENTERPRISE_MAP: Record<string, EnterpriseInfo> = {
  "c-1024": ENTERPRISE_C1024,
  "c-1031": ENTERPRISE_C1031,
  "c-1042": ENTERPRISE_C1042,
  "c-1055": ENTERPRISE_C1055,
  "c-2003": ENTERPRISE_C2003,
};

/** 取某客户的企业画像;未命中回退 c-1024。 */
export function getEnterpriseInfo(customerId: string): EnterpriseInfo {
  return ENTERPRISE_MAP[customerId] ?? ENTERPRISE_C1024;
}
