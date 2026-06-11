"use client";

import * as React from "react";

import type { TalkScript } from "@/lib/types";
import type { KnowledgeEvidenceRecord } from "@/lib/dify/types";
import { TalkScriptCard } from "@/components/workbench/talk-script-card";

/** 简报页话术 Tab:加载知识库证据并渲染。 */
export function BriefingScriptsClient({
  scripts,
  customerName,
}: {
  scripts: TalkScript[];
  customerName: string;
}) {
  const [evidenceMap, setEvidenceMap] = React.useState<
    Map<string, KnowledgeEvidenceRecord[]>
  >(new Map());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchEvidence() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch("/api/script-evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scripts: scripts.map((s) => ({
              id: s.id,
              scene: s.scene,
              title: s.title,
              content: s.content,
              objection: s.objection,
            })),
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = (await res.json()) as {
          results: Array<{
            scriptId: string;
            records: KnowledgeEvidenceRecord[];
          }>;
        };

        if (!cancelled) {
          const map = new Map<string, KnowledgeEvidenceRecord[]>();
          for (const result of data.results) {
            map.set(result.scriptId, result.records);
          }
          setEvidenceMap(map);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvidence();
    return () => {
      cancelled = true;
    };
  }, [scripts]);

  if (error) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {scripts.map((s) => (
          <TalkScriptCard key={s.id} script={s} />
        ))}
        <p className="col-span-full text-center text-xs text-muted-foreground">
          知识库暂不可用，话术已加载
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {scripts.map((s) => {
        const records = evidenceMap.get(s.id);

        return (
          <TalkScriptCard
            key={s.id}
            script={s}
            evidence={records}
            loading={loading}
          />
        );
      })}
    </div>
  );
}
