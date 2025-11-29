import React, { useEffect, useState } from 'react';
import { Grid, Stack } from '@mantine/core';
import InfoCard from '../../components/InfoCard/InfoCard';
import RecordList from '../../components/RecordList/RecordList';

type ActivityRecord = { id: string; date: string; duration: number; intensity: string };

const ActivityPage = () => {
  const [records, setRecords] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    // Try to fetch from backend; if it fails, use sample data
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch('/activity/list', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('no backend');
        const data = await res.json();
        setRecords(data || []);
      } catch (err) {
        setRecords([
          { id: '1', date: '2025-11-20', duration: 45, intensity: 'medium' },
          { id: '2', date: '2025-11-22', duration: 30, intensity: 'low' },
        ]);
      }
    };
    load();
  }, []);

  const totalSessions = records.length;
  const totalDuration = records.reduce((s, r) => s + (r.duration || 0), 0);

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={4}>
          <InfoCard title="Sessions"subtitle="Total sessions" icon={<span>🏃</span>} />
        </Grid.Col>
        <Grid.Col span={4}>
          <InfoCard title="Total minutes"subtitle="All time" icon={<span>⏱️</span>} />
        </Grid.Col>
      </Grid>

      <RecordList
        title="Activity Records"
        records={records as any}
        fields={['date', 'duration', 'intensity']}
        onEdit={(r) => console.log('edit', r)}
        onDelete={(r) => console.log('delete', r)}
      />
    </Stack>
  );
};

export default ActivityPage;
