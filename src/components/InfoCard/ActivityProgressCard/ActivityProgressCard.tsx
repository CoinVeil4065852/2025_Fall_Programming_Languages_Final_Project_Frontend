import { IconClock, IconFlame, IconShoe, IconWalk } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Card, Center, Group, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import InfoCard from '../InfoCard';

const ActivityGauge = ({
  value,
  max,
  size = 180,
  strokeWidth = 16,
  icon,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  icon?: React.ReactNode;
}) => {
  // Added extra padding (-10) to radius to prevent rounded stroke caps from clipping
  const radius = (size - strokeWidth) / 2 - 10;
  const center = size / 2;

  // We want an arc from 135 degrees to 405 degrees (270 degrees total)
  // 0 degrees is 3 o'clock in SVG
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = 270;

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const progressAngle = startAngle + (percentage / 100) * totalAngle;

  // Helper to convert polar to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  // Helper to create the SVG path description string
  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgPath = describeArc(center, center, radius, startAngle, endAngle);
  const progressPath = describeArc(center, center, radius, startAngle, progressAngle);

  // Gradient ID
  const gradId = 'activity-gradient';
  const { t } = useTranslation();

  return (
    <Group>
      <svg width={size} height={size} className="block transform rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fa005c" /> {/* Pinkish Red */}
            <stop offset="100%" stopColor="#ff9100" /> {/* Orange */}
          </linearGradient>
        </defs>

        {/* Track Background */}
        <path
          d={bgPath}
          fill="none"
          stroke="#f1f5f9" // Slate-100
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress Fill (Removed transition classes) */}
        <path
          d={progressPath}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>

      {/* Centered Content */}
      <Stack
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        gap={0}
        m={0}
        align="center"
      >
        {icon}
        <Text size="xl">{value}</Text>
        <Text size="xs">{t('kcal')}</Text>
      </Stack>
    </Group>
  );
};

type Props = {
  calories?: number;
  caloriesGoal?: number;
  steps?: number;
  durationMinutes?: number;
};

const DailyActivityCard: React.FC<Props> = ({
  calories = 450,
  caloriesGoal = 600,
  steps = 5432,
  durationMinutes = 45,
}) => {
  const { t } = useTranslation();
  return (
    <InfoCard title={t('daily_activity')}>
      <Stack justify="center" align="center" gap={6}>
        <ActivityGauge
          value={calories}
          max={caloriesGoal}
          icon={<IconFlame size={24} className="text-rose-500 fill-rose-500" />}
        />

        <Group>
          <Group>
            <ThemeIcon color="teal" size="sm" radius="full">
              <IconShoe size={16} />
            </ThemeIcon>
            <Text fw={700} size="sm">
              {steps}
            </Text>
            <Text size="xs" c="dimmed">
              {t('steps')}
            </Text>
          </Group>
          <Group>
            <ThemeIcon color="blue" size="sm" radius="full">
              <IconClock size={16} />
            </ThemeIcon>
            <Text fw={700} size="sm">
              {durationMinutes}m
            </Text>
            <Text size="xs" c="dimmed">
              {t('duration')}
            </Text>
          </Group>
        </Group>

        <Text size="xs" c="dimmed" className="mt-2 text-center">
          {t('you_hit_percent_of_goal', { percent: Math.round((calories / caloriesGoal) * 100) })}
        </Text>
      </Stack>
    </InfoCard>
  );
};

export default DailyActivityCard;
