import { IconClock, IconFlame } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { calcPercentage } from '@/utils/progress';
import { useAppData } from '../../../AppDataContext';
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

  const percentage = calcPercentage(value, max);
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
  durationMinutes?: number;
};

const ActivityProgressCard: React.FC<Props> = ({
  calories,
  caloriesGoal = 600,
  durationMinutes = 45,
}) => {
  const { t } = useTranslation();
  const { profile, activity } = useAppData();

  // MET values by intensity mapping (reasonable defaults)
  const intensityToMET: Record<string, number> = {
    low: 3.0,
    moderate: 5.0,
    medium: 5.0,
    high: 8.0,
  };

  // Compute calories burned from individual activity records if explicit `calories` not provided.
  // Formula used: calories_per_minute = (MET * 3.5 * weight_kg) / 200
  // Total calories = sum(duration_minutes * calories_per_minute) * ageFactor
  // We include a mild age adjustment so that older users slightly burn fewer calories
  const computeCaloriesFromActivities = () => {
    const w = profile?.weightKg ?? 70; // kg
    const age = profile?.age ?? 30;
    // small age factor: +/- up to ~10% between ages 0..100 (clamped)
    const ageFactor = Math.max(0.9, Math.min(1.1, 1 - (age - 30) * 0.003));

    if (!activity || activity.length === 0) {
      return 0;
    }

    let total = 0;
    for (const rec of activity) {
      const met = intensityToMET[rec.intensity] ?? 4.0;
      const mins = rec.minutes ?? 0;
      const kcalPerMin = (met * 3.5 * w) / 200;
      total += mins * kcalPerMin;
    }
    return Math.round(total * ageFactor);
  };

  const computedCalories = computeCaloriesFromActivities();
  const caloriesToShow = typeof calories === 'number' ? calories : computedCalories || 450;

  return (
    <InfoCard title={t('daily_activity')}>
      <Stack justify="center" align="center" gap={6}>
        <ActivityGauge
          value={caloriesToShow}
          max={caloriesGoal}
          icon={<IconFlame size={24} className="text-rose-500 fill-rose-500" />}
        />
        <Group>
          <Group>
            <ThemeIcon size="sm" radius="full" color="orange">
              <IconClock size={16} />
            </ThemeIcon>
            <Text fw={700} size="sm">
              {durationMinutes} {t('minutes')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('duration')}
            </Text>
          </Group>
        </Group>
        <Text size="xs" c="dimmed" className="mt-2 text-center">
          {t('you_hit_percent_of_goal', {
            percent: Math.round(calcPercentage(caloriesToShow, caloriesGoal)),
          })}
        </Text>
      </Stack>
    </InfoCard>
  );
};

export default ActivityProgressCard;
