import React, { useEffect, useState } from 'react';
import { Grid, Group, Stack } from '@mantine/core';
import InfoCard from '../../components/InfoCard/InfoCard';
import RecordList from '../../components/RecordList/RecordList';
import WaterProgressCard from '@/components/InfoCard/WaterProgressCard/WaterProgressCard';
import WaterWeeklyCard from '@/components/InfoCard/WaterWeeklyCard/WaterWeeklyCard';

type WaterRecord = { id: string; date: string; amount: number };

const WaterPage = () => {
  const [records, setRecords] = useState<WaterRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch('/water/list', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('no backend');
        const data = await res.json();
        setRecords(data || []);
      } catch (err) {
        setRecords([
          { id: '1', date: '2025-11-22', amount: 200 },
          { id: '2', date: '2025-11-23', amount: 900 },
        ]);
      }
    };
    load();
  }, []);

  const total = records.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <Group gap="md" justify="start" align='stretch' >
      <WaterProgressCard currentMl={total} goalMl={2000} />
      <WaterWeeklyCard />
      <RecordList
        title="Water Records"
        records={records as any}
        fields={['date', 'amount']}
        onEdit={(r) => console.log('edit', r)}
        onDelete={(r) => console.log('delete', r)}
      />
    </Group>
  );
}

export default WaterPage;
