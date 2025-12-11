import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Group, Text } from '@mantine/core';
import ActivityProgressCard from '@/components/InfoCard/ActivityProgressCard/ActivityProgressCard';
import ActivityWeeklyCard from '@/components/InfoCard/ActivityWeeklyCard/ActivityWeeklyCard';
import { aggregateByWeekday } from '@/utils/weekly';
import AddActivityModal from '@/components/Modals/AddActivityModal/AddActivityModal';
import RecordList from '../../components/RecordList/RecordList';
import { useAppData } from '@/AppDataContext';
import type { ActivityRecord as ApiActivityRecord } from '@/services/types';

type UiActivityRecord = {
  id: string;
  date: string;
  time?: string;
  minutes: number;
  intensity?: string;
};

const ActivityPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<UiActivityRecord | null>(null);

  const { t } = useTranslation();

  const { activity, addActivity, updateActivity, deleteActivity } = useAppData();

  const uiRecords = (activity || []).map((r: ApiActivityRecord) => ({
    id: String(r.id ?? ''),
    date: r.datetime ? String(r.datetime).split('T')[0] : '',
    time: r.datetime ? (String(r.datetime).split('T')[1] ?? '').slice(0, 5) : '',
    minutes: r.minutes ?? 0,
    intensity: r.intensity,
  }));

  const totalMinutes = uiRecords.reduce((s, r) => s + (r.minutes || 0), 0);

  const weeklyActivity = aggregateByWeekday(uiRecords, (r) => (r.date ? `${r.date}T00:00` : ''), (r) => r.minutes);

  return (
    <Group gap="md" align="stretch" justify="start">
      <ActivityProgressCard
        calories={Math.round(totalMinutes * 5)}
        caloriesGoal={600}
        steps={0}
        durationMinutes={totalMinutes}
      />
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <ActivityWeeklyCard data={weeklyActivity} />
      <RecordList
        title={t('activity_records')}
        records={uiRecords}
        onEdit={(r) => {
          const rec = r as UiActivityRecord;
          setEditItem({
            id: rec.id,
            date: rec.date,
            time: rec.time,
            minutes: rec.minutes,
            intensity: rec.intensity,
          });
          setAddOpen(true);
        }}
        onDelete={async (r) => {
          try {
            setError(null);
            if (deleteActivity) await deleteActivity(r.id);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg ?? t('failed_delete_activity'));
          }
        }}
        style={{ width: '100%' }}
        onAddClick={() => {
          setEditItem(null);
          setAddOpen(true);
        }}
      />

      <AddActivityModal
        opened={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        initialValues={
          editItem
            ? {
                duration: editItem.minutes,
                time: editItem.time ? `${editItem.date}T${editItem.time}` : `${editItem.date}T00:00`,
                intensity: (editItem.intensity as 'low' | 'moderate' | 'high' | '') ?? '',
              }
            : undefined
        }
        onAdd={async ({ duration, time, intensity }) => {
          try {
            const minutes = typeof duration === 'number' ? duration : Number(duration);
            if (editItem) {
              if (updateActivity) await updateActivity(editItem.id, time, minutes, intensity || '');
            } else {
              if (addActivity) await addActivity(time, minutes, intensity || '');
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg ?? t(editItem ? 'failed_update_activity' : 'failed_add_activity'));
          } finally {
            setAddOpen(false);
            setEditItem(null);
          }
        }}
      />
    </Group>
  );
};

export default ActivityPage;
