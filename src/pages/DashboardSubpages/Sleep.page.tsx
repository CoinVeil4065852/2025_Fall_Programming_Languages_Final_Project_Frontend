import React, { useState } from 'react';
import { Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import RecordList from '../../components/RecordList/RecordList';
import AddSleepModal from '@/components/Modals/AddSleepModal/AddSleepModal';
import SleepProgressCard from '@/components/InfoCard/SleepProgressCard/SleepProgressCard';
import SleepWeeklyCard from '@/components/InfoCard/SleepWeeklyCard/SleepWeeklyCard';
import { useAppData } from '@/AppDataContext';

type SleepRecord = { id: string; date: string; time?: string; hours: number };

const SleepPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SleepRecord | null>(null);

  const app = useAppData();
  const { sleep, addSleep, updateSleep, deleteSleep } = app;

  const { t } = useTranslation();

  const recordsFromCtx = sleep.map((rr: any) => ({
    id: String(rr.id ?? ''),
    date: rr.date,
    time: rr.datetime ? (rr.datetime.split('T')[1] ?? '').slice(0, 5) : '',
    hours: rr.hours,
  }));

  const avg = recordsFromCtx.length ? (recordsFromCtx.reduce((s, r) => s + r.hours, 0) / recordsFromCtx.length).toFixed(1) : '—';

  return (
    <Group gap="md" justify="start" align="stretch">
      <SleepProgressCard currentHours={Number(avg === '—' ? 0 : avg)} goalHours={8} />
      {error && <Text c="red" size="sm">{error}</Text>}
      <SleepWeeklyCard data={recordsFromCtx.slice(0, 7).map((r) => r.hours)} />

      <RecordList
        title={t('sleep_records')}
        records={recordsFromCtx as any}
        fields={['date', 'time', 'hours']}
        onEdit={(r) => {
          setEditItem({ id: r.id, date: r.date, time: r.time, hours: r.hours });
          setAddOpen(true);
        }}
        onDelete={async (r) => {
          try {
            setError(null);
            if (deleteSleep) await deleteSleep(r.id);
          } catch (err: any) {
            setError(err?.message ?? t('failed_delete_sleep'));
          }
        }}
        style={{ width: '100%' }}
        onAddClick={() => {
          setEditItem(null);
          setAddOpen(true);
        }}
      />
      <AddSleepModal
        opened={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        initialValues={editItem ? { hours: editItem.hours, time: editItem.time ? `${editItem.date}T${editItem.time}` : `${editItem.date}T00:00` } : undefined}
        onAdd={async ({ hours, time }) => {
          try {
            if (editItem) {
              if (updateSleep) await updateSleep(editItem.id, time, Number(hours));
            } else {
              if (addSleep) await addSleep(time, Number(hours));
            }
          } catch (e: any) {
            setError(e?.message ?? (editItem ? t('failed_update_sleep') : t('failed_add_sleep')));
          } finally {
            setAddOpen(false);
            setEditItem(null);
          }
        }}
      />
    </Group>
  );
};

export default SleepPage;
 
