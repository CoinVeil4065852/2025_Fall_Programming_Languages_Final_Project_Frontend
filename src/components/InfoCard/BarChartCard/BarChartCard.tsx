import React from 'react';
import InfoCard, { InfoCardProps } from '../InfoCard';
import { Box, Stack, Text } from '@mantine/core';

type Props = Omit<InfoCardProps, 'children' | 'title'> & {
  title: React.ReactNode;
  data?: number[];
  labels?: string[];
  unitLabel?: string;
  chartWidth?: number;
  chartHeight?: number;
  barColor?: string;
  highlightColor?: string;
};

const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BarChartCard: React.FC<Props> = ({
  title,
  data = [0, 0, 0, 0, 0, 0, 0],
  labels,
  unitLabel = '',
  chartWidth = 280,
  chartHeight = 120,
  barColor = '#4dabf7',
  highlightColor = '#1971c2',
  ...infoCardProps
}) => {
  const d = data.slice(0, 7);
  while (d.length < 7) d.push(0);
  const lbs = labels && labels.length >= 7 ? labels.slice(0, 7) : defaultLabels;

  const max = Math.max(1, ...d);
  const padding = { top: 8, bottom: 28, left: 12, right: 12 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  const barGap = 8;
  const barWidth = (innerW - barGap * (7 - 1)) / 7;

  return (
    <InfoCard title={title} {...infoCardProps}>
      <Stack gap="sm">
        <Box>
          <svg width={chartWidth} height={chartHeight} role="img" aria-label={`${title} bar chart`}>
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

            {d.map((val, i) => {
              const h = (val / max) * innerH;
              const x = padding.left + i * (barWidth + barGap);
              const y = padding.top + innerH - h;
              // i indexes Mon..Sun (0..6). Convert Date.getDay() to Monday-first index for comparison.
              const todayIdx = (new Date().getDay() + 6) % 7;
              const isToday = i === todayIdx;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barWidth} height={h} rx={4} fill={isToday ? highlightColor : barColor} />
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(padding.top + innerH - h - 6, padding.top + 8)}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#222"
                  >
                    {val > 0 ? String(val) : ''}
                  </text>
                </g>
              );
            })}

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
          {unitLabel ? `Weekly totals shown in ${unitLabel}` : ''}
        </Text>
      </Stack>
    </InfoCard>
  );
};

export default BarChartCard;
