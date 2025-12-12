import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  parseThemeColor,
  rem,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import InfoCard, { InfoCardProps } from '../InfoCard';

type Props = Omit<InfoCardProps, 'children' | 'title'> & {
  title: React.ReactNode;
  data?: number[];
  labels?: string[];
  unitLabel?: string;
  chartHeight?: number;
  /** Pass a specific color key from your theme (e.g. 'blue', 'orange') */
  color?: string;
};

const defaultLabels = (t: (s: string) => string) => [
  t('weekday_short_mon'),
  t('weekday_short_tue'),
  t('weekday_short_wed'),
  t('weekday_short_thu'),
  t('weekday_short_fri'),
  t('weekday_short_sat'),
  t('weekday_short_sun'),
];

const BarChartCard: React.FC<Props> = ({
  title,
  data = [0, 0, 0, 0, 0, 0, 0],
  labels,
  unitLabel = '',
  chartHeight = 140, // Slightly increased for breathing room
  color = 'blue',
  ...infoCardProps
}) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Normalize Data
  const d = data.slice(0, 7);
  while (d.length < 7) {
    d.push(0);
  }

  const lbs = labels && labels.length >= 7 ? labels.slice(0, 7) : defaultLabels(t);

  // Layout Constants
  // We use a fixed internal coordinate system for the SVG math,
  // but the SVG itself will scale to 100% width via CSS.
  const internalWidth = 300;
  const padding = { top: 20, bottom: 30, left: 10, right: 10 };
  const innerW = internalWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;
  const barGap = 12;
  const barWidth = (innerW - barGap * (7 - 1)) / 7;

  const max = Math.max(1, ...d);

  // Dynamic Colors based on Theme
  const isDark = colorScheme === 'dark';
  const gridColor = isDark ? theme.colors.dark[4] : theme.colors.gray[2];
  const textColor = isDark ? theme.colors.dark[1] : theme.colors.gray[6];
  const labelColor = isDark ? theme.colors.dark[2] : theme.colors.gray[5];

  // Resolve the primary color (allows passing 'blue', 'orange', etc.)
  const parsedColor = parseThemeColor({ color, theme });
  // We use index 8 for dark mode highlight (brighter) and 6 for light mode
  const highlightFill = parsedColor.value;
  // We make the non-highlight bars slightly transparent or a lighter shade
  const barFill = parsedColor.isThemeColor
    ? theme.colors[parsedColor.color][isDark ? 8 : 2]
    : parsedColor.value; // Fallback if not a theme color

  // Identify Today (Monday=0 ... Sunday=6)
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <InfoCard title={title} {...infoCardProps}>
      <Stack gap="xs" align="stretch" justify="">
        <Box
          w="100%"
          style={{
            height: rem(chartHeight),
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox={`0 0 ${internalWidth} ${chartHeight}`}
            preserveAspectRatio="none" // Allows stretching width-wise
            width="100%"
            height="100%"
            role="img"
            aria-label={t('bar_chart_for', { title: String(title) })}
            style={{ overflow: 'visible' }}
          >
            {/* Grid Lines */}
            {[0, 0.33, 0.66, 1].map((tick) => {
              const yPos = padding.top + innerH * (1 - tick);
              return (
                <line
                  key={tick}
                  x1={padding.left}
                  x2={internalWidth - padding.right}
                  y1={yPos}
                  y2={yPos}
                  stroke={gridColor}
                  strokeWidth={1}
                  strokeDasharray={tick === 0 ? undefined : '3 3'} // Dashed lines for inner grid
                  opacity={0.6}
                />
              );
            })}

            {/* Bars */}
            {d.map((val, i) => {
              const h = (val / max) * innerH;
              const x = padding.left + i * (barWidth + barGap);
              const y = padding.top + innerH - h;
              const isToday = i === todayIdx;

              // Use primary color for today, lighter shade for others
              const fill = isToday ? highlightFill : barFill;

              return (
                <g key={i} className="bar-group">
                  {/* The Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(h, 4)} // Ensure 0 values have a tiny visible bar or min-height
                    rx={4}
                    fill={fill}
                    style={{
                      transition: 'fill-opacity 0.2s',
                      cursor: 'default',
                    }}
                  />

                  {/* Value Label (only if > 0) */}
                  {val > 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={700}
                      fill={textColor}
                      fontFamily={theme.fontFamily}
                    >
                      {val}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axis Labels */}
            {lbs.map((lab, i) => {
              const x = padding.left + i * (barWidth + barGap) + barWidth / 2;
              const y = chartHeight - 5;
              const isToday = i === todayIdx;

              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={isToday ? 600 : 400}
                  fill={isToday ? textColor : labelColor}
                  fontFamily={theme.fontFamily}
                >
                  {lab}
                </text>
              );
            })}
          </svg>
        </Box>

        {unitLabel && (
          <Text size="xs" c="dimmed" style={{ alignSelf: 'flex-end' }}>
            {t('weekly_totals_shown_in', { unit: unitLabel })}
          </Text>
        )}
      </Stack>
    </InfoCard>
  );
};

export default BarChartCard;
