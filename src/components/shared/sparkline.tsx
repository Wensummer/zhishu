interface SparklineProps {
  data: number[];
  /** 折线颜色(CSS 颜色值),默认主色 */
  color?: string;
  height?: number;
  className?: string;
}

/**
 * 轻量 SVG 迷你趋势线(无坐标轴),用于指标卡底部。
 * 纯 SVG 实现,不依赖图表库,渲染开销极小。
 */
export function Sparkline({
  data,
  color = "hsl(var(--primary))",
  height = 40,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const W = 100; // viewBox 宽度(配合 preserveAspectRatio 横向拉伸)
  const H = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = W / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = H - ((v - min) / span) * (H * 0.85) - H * 0.075; // 上下各留 7.5% 边距
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
