import React from 'react';
import { Box, Stack, Text } from '@mantine/core';
import InfoCard from '../InfoCard';

type Props = {
  data?: number[]; // 7 numbers, one per day
  labels?: string[]; // optional labels for each day
  className?: string;
};

const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WaterWeeklyCard: React.FC<Props> = ({ data = [1200, 800, 1500, 600, 900, 2000, 1750], labels, className }) => {
  const d = data.slice(0, 7);
  while (d.length < 7) d.push(0);
  const lbs = labels && labels.length >= 7 ? labels.slice(0, 7) : defaultLabels;

  const max = Math.max(1, ...d);
  const chartWidth = 280;
  const chartHeight = 120;
  const padding = { top: 8, bottom: 28, left: 12, right: 12 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  const barGap = 8;
  const barWidth = (innerW - barGap * (7 - 1)) / 7;

  return (
    <InfoCard title="Weekly water" className={className}>
      <Stack gap="sm">
        <Box>
          <svg width={chartWidth} height={chartHeight} role="img" aria-label="Weekly water bar chart">
            {/* background grid lines */}
            {[0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={padding.top + innerH * (1 - t)}
                y2={padding.top + innerH * (1 - t)}
                stroke="#e9eef8"
                strokeWidth={1}
              />
            ))}

            {/* bars */}
            {d.map((val, i) => {
              const h = (val / max) * innerH;
              const x = padding.left + i * (barWidth + barGap);
              const y = padding.top + innerH - h;
              const isTop = i === new Date().getDay() - 1; // best-effort highlight today (Mon=0)
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barWidth} height={h} rx={4} fill={isTop ? '#1971c2' : '#4dabf7'} />
                  {/* value label */}
                  <text x={x + barWidth / 2} y={Math.max(padding.top + innerH - h - 6, padding.top + 8)} textAnchor="middle" fontSize={10} fill="#222">
                    {val > 0 ? String(val) : ''}
                  </text>
                </g>
              );
            })}

            {/* labels */}
            {lbs.map((lab, i) => {
              const x = padding.left + i * (barWidth + barGap) + barWidth / 2;
              const y = chartHeight - 8;
              return (
                <text key={i} x={x} y={y} textAnchor="middle" fontSize={11} fill="#666">
                  {lab}
                </text>
              );
            })}
          </svg>
        </Box>

        <Text size="sm" c="dimmed">
          Weekly totals shown in milliliters
        </Text>
      </Stack>
    </InfoCard>
  );
};

export default WaterWeeklyCard;
