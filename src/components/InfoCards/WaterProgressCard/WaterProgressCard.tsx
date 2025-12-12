import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { calcPercentage } from '@/utils/progress';
import InfoCard, { InfoCardProps } from '../InfoCard';

const WaterTankSvg = ({
  percentage,
  width = 150,
  height = 200,
  fillColor = '#3b82f6', // Blue
  emptyColor = '#94a3b87b', // Light Grey
  strokeColor = '#f1f5f9', // Lighter Grey (Slate-400) for ticks
}: {
  percentage: number;
  width?: number;
  height?: number;
  fillColor?: string;
  emptyColor?: string;
  strokeColor?: string;
}) => {
  // Border removed, so stroke width is 0
  const strokeWidth = 0;
  const offset = strokeWidth / 2;
  const borderRadius = 24;

  // Calculate the effective dimensions for the path
  const w = width - offset;
  const h = height - offset;
  const x = offset;
  const y = offset;

  // Ensure percentage is 0-100
  const safePercent = Math.min(100, Math.max(0, percentage));

  // Calculate water height relative to the FULL height of the container area
  const waterHeight = (safePercent / 100) * height;
  const waterY = height - waterHeight; // Top position of the water rect

  // Path Definition: Start at (offset, offset)
  const cupPath = `
    M ${x} ${y} 
    H ${w} 
    V ${h - borderRadius} 
    Q ${w} ${h} ${w - borderRadius} ${h} 
    H ${x + borderRadius} 
    Q ${x} ${h} ${x} ${h - borderRadius} 
    Z
  `;

  // Tick marks
  const ticks = [20, 40, 60, 80];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', margin: '0 auto' }}
    >
      <defs>
        <clipPath id="cup-shape">
          <path d={cupPath} />
        </clipPath>
      </defs>

      <g clipPath="url(#cup-shape)">
        {/* Background (Empty State) */}
        <rect x="0" y="0" width={width} height={height} fill={emptyColor} />

        {/* Water Fill */}
        <rect x="0" y={waterY} width={width} height={waterHeight} fill={fillColor} />
      </g>

      {/* Tick Marks */}
      {ticks.map((t) => {
        const tickY = height - (t / 100) * height;
        return (
          <line
            key={t}
            x1={width - 25 - offset}
            y1={tickY}
            x2={width - offset}
            y2={tickY}
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

type Props = Omit<InfoCardProps, 'children' | 'title'> & {
  currentMl?: number; // water already drank in milliliters
  goalMl?: number; // objective in milliliters
  onAddClick?: () => void;
  onAdd250Click?: () => void;
  add250Loading?: boolean;
  addLoading?: boolean;
};

const WaterProgressCard: React.FC<Props> = ({
  currentMl = 750,
  goalMl = 2000,
  onAddClick,
  onAdd250Click,
  add250Loading = false,
  addLoading = false,
  ...infoCardProps
}) => {
  const safeGoal = Math.max(1, goalMl);
  const percent = calcPercentage(currentMl, safeGoal);
  // displayPercent intentionally removed - percent is used visually via svg
  const remainingMl = Math.max(0, goalMl - currentMl);

  const { t } = useTranslation();

  return (
    <InfoCard title={t('daily_water')} {...infoCardProps}>
      <Group gap="xl" justify="center" align="center">
        <Stack>
          <Title order={4}>
            {currentMl} {t('ml')} / {goalMl} {t('ml')}
          </Title>
          <Text size="md" c="dimmed">
            {remainingMl} {t('ml_remaining')}
          </Text>
          {onAdd250Click ? (
            <Button
              variant="light"
              size="md"
              onClick={onAdd250Click}
              loading={add250Loading}
              color="blue"
            >
              {t('add_250_ml')}
            </Button>
          ) : null}

          {onAddClick ? (
            <Button
              variant="light"
              size="md"
              onClick={onAddClick}
              loading={addLoading}
              color="blue"
            >
              {t('add_water')}
            </Button>
          ) : null}
        </Stack>
        <Box>
          <WaterTankSvg percentage={percent} width={140} height={180} />
        </Box>
      </Group>
    </InfoCard>
  );
};

export default WaterProgressCard;
