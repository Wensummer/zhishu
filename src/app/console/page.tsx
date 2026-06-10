import { KeyRound, Boxes, FileText, BookOpen, Webhook } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaskedField } from "@/components/shared/masked-field";
import { getModels } from "@/lib/api";

const CODE = `from openai import OpenAI

client = OpenAI(
    api_key="sk-zs-demo-************",      # 你的智枢 One Key
    base_url="https://api.zhishu.example/v1"  # OpenAI 兼容网关
)

resp = client.chat.completions.create(
    model="qwen-max",                  # 模型池任一型号,一个 Key 全调用
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)`;

/** P2-10 统一接入 API 控制台。 */
export default async function ConsolePage() {
  const models = await getModels();
  return (
    <>
      <PageHeader
        title="统一接入 API 控制台"
        description="一个 Key 调用模型池全部模型,OpenAI 兼容封装,客户不用自己对接多家。"
        actions={
          <Badge variant="outline" className="gap-1">
            <Boxes className="h-3.5 w-3.5" />
            {models.length} 个模型 · 全部已备案
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* One Key */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-primary" />
              One Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MaskedField
              masked="sk-zs-demo-••••••••••••••••a1b2"
              revealDemo="sk-zs-demo-9f3c7a21e8b04d6fa1b2"
            />
            <p className="text-xs text-muted-foreground">
              红线:平台前端不存任何真实 Key,此处为脱敏演示值。真实密钥仅在服务端签发与校验。
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm">
                轮换密钥
              </Button>
              <Button variant="outline" size="sm">
                用量与限额
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 兼容说明 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="h-4 w-4 text-primary" />
              OpenAI 兼容
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Base URL</span>
              <code className="font-mono">https://api.zhishu.example/v1</code>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">协议</span>
              <span>OpenAI Chat Completions 兼容</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">切换模型</span>
              <span>仅需改 <code className="font-mono">model</code> 字段</span>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              现有基于 OpenAI SDK 的代码,改 base_url 与 model 即可接入,迁移成本极低。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 接入示例 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            接入示例(Python)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-xs leading-relaxed">
            <code className="font-mono">{CODE}</code>
          </pre>
        </CardContent>
      </Card>

      {/* 文档入口 */}
      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">接入文档与最佳实践</div>
              <p className="text-sm text-muted-foreground">
                鉴权、限流、缓存折扣、流式输出、错误码与重试策略。
              </p>
            </div>
          </div>
          <Button variant="outline">查看接入文档</Button>
        </CardContent>
      </Card>
    </>
  );
}
