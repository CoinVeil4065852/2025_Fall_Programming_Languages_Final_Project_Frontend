import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Progress, Stack, Text } from '@mantine/core';
import { calcPercentage } from '@/utils/progress';
import InfoCard, { InfoCardProps } from '../InfoCard';

type Props = Omit<InfoCardProps, 'children' | 'title'> & {
  currentHours?: number;
  goalHours?: number;
  onAddClick?: () => void;
};

const SleepProgressCard: React.FC<Props> = ({
  currentHours = 6.5,
  goalHours = 8,
  onAddClick,
  ...infoCardProps
}) => {
  const safeGoal = Math.max(0.1, goalHours);
  const percent = calcPercentage(currentHours, safeGoal);
  const remaining = Math.max(0, goalHours - currentHours);

  const { t } = useTranslation();

  return (
    <InfoCard title={t('daily_sleep')} {...infoCardProps}>
      <Stack justify="center" align="center" gap="md">
        <Stack>
          <Group>
            <Text size="sm" c="dimmed">
              {t('last_7_days_average')}
            </Text>
            <Group>
              <Text fw={700}>
                {currentHours.toFixed(1)} {t('hrs')}
              </Text>
            </Group>
          </Group>
        </Stack>
        <Stack align="stretch" style={{ width: '100%' }}>
          <Progress value={percent} size="xl" radius="xl" color="grape" />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              0
            </Text>
            <Text size="xs" c="dimmed">
              {goalHours} {t('hrs')}
            </Text>
          </Group>
        </Stack>
        <Text size="xs" c="dimmed">
          {remaining > 0 ? `${remaining.toFixed(1)} ${t('hrs_to_goal')}` : t('goal_reached')}
        </Text>
      </Stack>
      {onAddClick ? (
        <Button variant="light" size="sm" mt="md" onClick={onAddClick}>
          {t('add_sleep')}
        </Button>
      ) : null}
    </InfoCard>
  );
};

export default SleepProgressCard;
