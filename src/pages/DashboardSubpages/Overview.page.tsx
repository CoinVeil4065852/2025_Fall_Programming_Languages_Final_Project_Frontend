import React, { useEffect, useState } from 'react';
import { Badge, Grid, Group, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import InfoCard from '../../components/InfoCard/InfoCard';
import SleepProgressCard from '../../components/InfoCard/SleepProgressCard/SleepProgressCard';
import WaterProgressCard from '@/components/InfoCard/WaterProgressCard/WaterProgressCard';
import ActivityProgressCard from '@/components/InfoCard/ActivityProgressCard/ActivityProgressCard';
import { getProfile } from '../../services/auth';

const OverviewPage = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) return setProfile(null);
        const p = await getProfile(token);
        setProfile(p || null);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load profile');
        setProfile(null);
      }
    };
    load();
  }, []);

  const computeBmi = (weight?: number, height?: number) => {
    if (!weight || !height) return undefined;
    // if height looks like cm (>3), convert to meters
    const hMeters = height > 3 ? height / 100 : height;
    if (hMeters <= 0) return undefined;
    const bmi = weight / (hMeters * hMeters);
    return Math.round(bmi * 10) / 10;
  };

  const bmi = computeBmi(profile?.weight, profile?.height);

  const { t } = useTranslation();

  const bmiLabel = (v?: number) => {
    if (!v) return { label: '—', color: 'gray' };
    if (v < 18.5) return { label: t('bmi_underweight'), color: 'blue' };
    if (v < 25) return { label: t('bmi_normal'), color: 'green' };
    if (v < 30) return { label: t('bmi_overweight'), color: 'yellow' };
    return { label: t('bmi_obese'), color: 'red' };
  };

  const bmiInfo = bmiLabel(bmi);

  return (
    <Group gap="md" justify="start" align="stretch">
      <InfoCard title={t('user_metrics')}>
        {profile ? (
          <Stack justify="space-between" align="center">
            <Group>
              <Text style={{ fontWeight: 600 }}>{profile.username}</Text>
              <Text size="sm" c="dimmed">
                {profile.gender ? String(profile.gender) : '—'}
              </Text>
              <Stack style={{ marginTop: 8 }} gap={16}>
                <Group>
                  <Text size="xs" c="dimmed">
                    Weight
                  </Text>
                  <Text style={{ fontWeight: 700 }}>
                    {profile.weight ? `${profile.weight} kg` : '—'}
                  </Text>
                </Group>
                <Group>
                  <Text size="xs" c="dimmed">
                    Height
                  </Text>
                  <Text style={{ fontWeight: 700 }}>
                    {profile.height
                      ? `${profile.height > 3 ? `${profile.height} cm` : `${profile.height} m`}`
                      : '—'}
                  </Text>
                </Group>
              </Stack>
            </Group>

            <Group align="center" gap={4}>
              <RingProgress
                size={80}
                thickness={8}
                sections={[
                  { value: Math.min(100, ((bmi ?? 0) / 40) * 100), color: bmiInfo.color as any },
                ]}
              />
              <Group>
                <Text style={{ fontWeight: 700 }}>{bmi ?? '—'}</Text>
                <Badge color={bmiInfo.color as any} variant="light">
                  {bmiInfo.label}
                </Badge>
              </Group>
            </Group>
          </Stack>
        ) : (
          <Text c="dimmed">{t('no_profile_loaded')}{error ? `: ${error}` : ''}</Text>
        )}
      </InfoCard>

      <SleepProgressCard currentHours={7.2} goalHours={8} />
      <WaterProgressCard currentMl={1200} goalMl={2000} />
      <ActivityProgressCard calories={450} caloriesGoal={600} durationMinutes={150} />
      
    </Group>
  );
};

export default OverviewPage;
