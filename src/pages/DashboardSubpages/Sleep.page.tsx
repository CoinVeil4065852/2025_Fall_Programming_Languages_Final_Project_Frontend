import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Text } from '@mantine/core';
import { useAppData } from '@/AppDataContext';
import type { SleepRecord as ApiSleepRecord } from '@/services/types';
import SleepProgressCard from '@/components/InfoCard/SleepProgressCard/SleepProgressCard';
import SleepWeeklyCard from '@/components/InfoCard/SleepWeeklyCard/SleepWeeklyCard';
import { aggregateByWeekday } from '@/utils/weekly';
import AddSleepModal from '@/components/Modals/AddSleepModal/AddSleepModal';
import RecordList from '../../components/RecordList/RecordList';

type UiSleepRecord = { id: string; date: string; time?: string; hours: number };

const SleepPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<UiSleepRecord | null>(null);

  const app = useAppData();
  const { sleep, addSleep, updateSleep, deleteSleep } = app;

  const { t } = useTranslation();

  const recordsFromCtx = (sleep || []).map((rr: ApiSleepRecord) => ({
    id: String(rr.id ?? ''),
    date: rr.datetime ? String(rr.datetime).split('T')[0] : '',
    time: rr.datetime ? (String(rr.datetime).split('T')[1] ?? '').slice(0, 5) : '',
    hours: rr.hours,
  }));

  const avg = recordsFromCtx.length
    ? (recordsFromCtx.reduce((s, r) => s + r.hours, 0) / recordsFromCtx.length).toFixed(1)
    : '—';

  return (
    <Group gap="md" justify="start" align="stretch">
      <SleepProgressCard currentHours={Number(avg === '—' ? 0 : avg)} goalHours={8} />
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <SleepWeeklyCard data={aggregateByWeekday(recordsFromCtx, (r) => (r.date ? `${r.date}T00:00` : ''), (r) => r.hours)} />

      <RecordList
        title={t('sleep_records')}
        records={recordsFromCtx}
        onEdit={(r) => {
          const rec = r as UiSleepRecord;
          setEditItem({ id: rec.id, date: rec.date, time: rec.time, hours: rec.hours });
          setAddOpen(true);
        }}
        onDelete={async (r) => {
          try {
            setError(null);
            if (deleteSleep) await deleteSleep(r.id);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg ?? t('failed_delete_sleep'));
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
        initialValues={
          editItem
            ? {
                hours: editItem.hours,
                time: editItem.time
                  ? `${editItem.date}T${editItem.time}`
                  : `${editItem.date}T00:00`,
              }
            : undefined
        }
        onAdd={async ({ hours, time }) => {
          try {
            if (editItem) {
              if (updateSleep) await updateSleep(editItem.id, time, Number(hours));
            } else {
              if (addSleep) await addSleep(time, Number(hours));
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg ?? (editItem ? t('failed_update_sleep') : t('failed_add_sleep')));
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
