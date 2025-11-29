import React, { useEffect, useState } from 'react';
import { Grid, Stack } from '@mantine/core';
import InfoCard from '../../components/InfoCard/InfoCard';
import RecordList from '../../components/RecordList/RecordList';

type SleepRecord = { id: string; date: string; sleepHours: number };

const SleepPage = () => {
  const [records, setRecords] = useState<SleepRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch('/sleep/list', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('no backend');
        const data = await res.json();
        setRecords(data || []);
      } catch (err) {
        setRecords([
          { id: '1', date: '2025-11-21', sleepHours: 7.5 },
          { id: '2', date: '2025-11-22', sleepHours: 6 },
        ]);
      }
    };
    load();
  }, []);

  const avg = records.length ? (records.reduce((s, r) => s + r.sleepHours, 0) / records.length).toFixed(1) : '—';

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={4}>
          <InfoCard title="Avg Sleep" subtitle="Average" icon={<span>😴</span>} />
        </Grid.Col>
        <Grid.Col span={4}>
          <InfoCard title="Records"  subtitle="Total" icon={<span>🛌</span>} />
        </Grid.Col>
      </Grid>

      <RecordList
        title="Sleep Records"
        records={records as any}
        fields={['date', 'sleepHours']}
        onEdit={(r) => console.log('edit', r)}
        onDelete={(r) => console.log('delete', r)}
      />
    </Stack>
  );
}

export default SleepPage;
