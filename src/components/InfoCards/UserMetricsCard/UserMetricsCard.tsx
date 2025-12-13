import React from 'react';
import { IconActivity, IconRuler, IconScale, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Badge,
  Center,
  Divider,
  Group,
  MantineColor,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { InfoCard } from '@/components/InfoCards';
import type { User } from '@/services/types';

type Props = {
  profile?: User | null;
  error?: string | null;
  bmi?: number | undefined;
};

const UserMetricsCard: React.FC<Props> = ({ profile, error, bmi: apiBmi }) => {
  const { t } = useTranslation();

  // Use the server-provided BMI only (no local calculation)
  const bmi = apiBmi;

  const bmiLabel = (v?: number) => {
    if (!v) {
      return { label: '—', color: 'gray' };
    }
    if (v < 18.5) {
      return { label: t('bmi_underweight'), color: 'blue' };
    }
    if (v < 25) {
      return { label: t('bmi_normal'), color: 'green' };
    }
    if (v < 30) {
      return { label: t('bmi_overweight'), color: 'yellow' };
    }
    return { label: t('bmi_obese'), color: 'red' };
  };

  const bmiInfo = bmiLabel(bmi);

  return (
    <InfoCard title={t('user_metrics')}>
      {profile ? (
        <Stack gap="lg">
          {/* 1. User Header Section */}
          <Group align="center">
            <Avatar size="lg" radius="xl" variant="filled" color="myColor">
              {profile?.name?.[0]?.toUpperCase() ?? <IconUser size={24} />}
            </Avatar>

            <div style={{ flex: 1 }}>
              <Text fw={700} size="lg" lh={1.2}>
                {profile?.name ?? '—'}
              </Text>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mt={2}>
                {profile?.gender ? t(profile.gender) : '—'}
              </Text>
            </div>

            {/* Optional: Status Badge in top right */}
            {bmi && (
              <Badge variant="light" color={bmiInfo.color as MantineColor} size="lg">
                {bmiInfo.label}
              </Badge>
            )}
          </Group>

          <Divider />

          {/* 2. Metrics Grid Section */}
          <SimpleGrid cols={3} spacing="xs" verticalSpacing="xs">
            {/* Weight */}
            <Stack gap={4} align="center">
              <ThemeIcon variant="light" color="gray" radius="xl" size="md">
                <IconScale size={18} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" mt={4}>
                {t('weight')}
              </Text>
              <Text fw={700} size="lg">
                {profile?.weightKg ? profile.weightKg : '—'}{' '}
                <Text span size="sm" c="dimmed" fw={400}>
                  {t('kg')}
                </Text>
              </Text>
            </Stack>

            {/* Height */}
            <Stack gap={4} align="center">
              <ThemeIcon variant="light" color="gray" radius="xl" size="md">
                <IconRuler size={18} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" mt={4}>
                {t('height')}
              </Text>
              <Text fw={700} size="lg">
                {profile?.heightM
                  ? profile.heightM >= 1
                    ? Math.round(profile.heightM * 100)
                    : profile.heightM
                  : '—'}
                <Text span size="sm" c="dimmed" fw={400}>
                  {profile?.heightM ? (profile.heightM >= 1 ? t('cm') : t('m')) : ''}
                </Text>
              </Text>
            </Stack>

            {/* BMI Value */}
            <Stack gap={4} align="center">
              <ThemeIcon
                variant="light"
                color={bmiInfo.color as MantineColor}
                radius="xl"
                size="md"
              >
                <IconActivity size={18} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" mt={4}>
                {t('bmi')}
              </Text>
              <Text fw={700} size="lg" c={bmiInfo.color as MantineColor}>
                {typeof bmi === 'number' ? bmi.toFixed(1) : '—'}
              </Text>
            </Stack>
          </SimpleGrid>
        </Stack>
      ) : (
        <Center py="xl">
          <Text c="dimmed" size="sm">
            {t('no_profile_loaded')}
            {error ? `: ${error}` : ''}
          </Text>
        </Center>
      )}
    </InfoCard>
  );
};

export default UserMetricsCard;
