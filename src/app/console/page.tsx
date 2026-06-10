import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-10 统一接入 API 控制台。 */
export default function ConsolePage() {
  return (
    <>
      <PageHeader
        title="统一接入 API 控制台"
        description="一个 Key 调用模型池全部模型,OpenAI 兼容封装。"
      />
      <Placeholder
        priority="P2"
        points={[
          "One Key(密钥仅脱敏展示,前端不存真实 Key)",
          "OpenAI-compatible 接入说明",
          "接入文档入口",
        ]}
      />
    </>
  );
}
