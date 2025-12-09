import React, { useEffect, useState } from 'react';
import { Grid, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import ActivityProgressCard from '@/components/InfoCard/ActivityProgressCard/ActivityProgressCard';
import ActivityWeeklyCard from '@/components/InfoCard/ActivityWeeklyCard/ActivityWeeklyCard';
import AddActivityModal from '@/components/Modals/AddActivityModal/AddActivityModal';
import RecordList from '../../components/RecordList/RecordList';
import api from '@/services';

type ActivityRecord = { id: string; date: string; time?: string; minutes: number; intensity?: string };

const ActivityPage = () => {
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ActivityRecord | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setError(null);
        const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
        const recs = token ? await api.getAllActivity(token) : [];
        const ui = recs.map((r: any) => ({
          id: String(r.id ?? ''),
          date: r.date,
          time: r.datetime ? (r.datetime.split('T')[1] ?? '').slice(0, 5) : '',
          minutes: r.minutes ?? r.duration ?? 0,
          intensity: r.intensity,
        }));
        setRecords(ui);
      } catch (err: any) {
        setRecords([]);
        setError(err?.message ?? t('failed_load_activity'));
      }
    };
    loadRecords();
  }, []);

  const totalMinutes = records.reduce((s, r) => s + (r.minutes || 0), 0);

  return (
    <Group gap="md" align="stretch" justify="start">
      <ActivityProgressCard
        calories={Math.round(totalMinutes * 5)}
        caloriesGoal={600}
        steps={0}
        durationMinutes={totalMinutes}
      />
      {error && (
        <Text c="red" size="sm">{error}</Text>
      )}
      <ActivityWeeklyCard data={records.slice(0, 7).map((r) => r.minutes)} />
      <RecordList
        title={t('activity_records')}
        records={records as any}
        fields={['date', 'time', 'minutes', 'intensity']}
        onEdit={(r) => {
          setEditItem({ id: r.id, date: r.date, time: r.time, minutes: r.minutes, intensity: r.intensity });
          setAddOpen(true);
        }}
        onDelete={async (r) => {
          try {
            setError(null);
            const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
            if (token && api.deleteActivity) await api.deleteActivity(token, r.id);
            const t = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
            if (t) {
              const recs = await api.getAllActivity(t);
              setRecords(
                recs.map((rr: any) => ({
                  id: String(rr.id ?? ''),
                  date: rr.date,
                  time: rr.datetime ? (rr.datetime.split('T')[1] ?? '').slice(0, 5) : '',
                  minutes: rr.minutes ?? rr.duration ?? 0,
                  intensity: rr.intensity,
                }))
              );
            }
          } catch (err: any) {
            setError(err?.message ?? t('failed_delete_activity'));
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
        initialValues={editItem ? { duration: editItem.minutes, time: editItem.time ? `${editItem.date}T${editItem.time}` : `${editItem.date}T00:00`, intensity: (editItem.intensity as any) ?? '' } : undefined}
        onAdd={async ({ duration, time, intensity }) => {
          try {
            const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
            const minutes = typeof duration === 'number' ? duration : Number(duration);
            if (editItem) {
              if (token && api.updateActivity) await api.updateActivity(token, editItem.id, time, minutes, intensity || '');
            } else {
              if (token) await api.addActivity(token, time, minutes, intensity || '');
            }
            // refresh list
            const t = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
            if (t) {
              const recs = await api.getAllActivity(t);
              setRecords(
                recs.map((rr: any) => ({
                  id: String(rr.id ?? ''),
                  date: rr.date,
                  time: rr.datetime ? (rr.datetime.split('T')[1] ?? '').slice(0, 5) : '',
                  minutes: rr.minutes ?? rr.duration ?? 0,
                  intensity: rr.intensity,
                }))
              );
            }
          } catch (e) {
            if (!editItem) {
              const rec: ActivityRecord = {
                id: String(Date.now()),
                date: time.split('T')[0],
                time: String(time).split('T')[1] ?? '',
                minutes: typeof duration === 'number' ? duration : Number(duration),
                intensity,
              };
              setRecords((s) => [rec, ...s]);
            } else {
              setError((e as any)?.message ?? t('failed_update_activity'));
            }
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
