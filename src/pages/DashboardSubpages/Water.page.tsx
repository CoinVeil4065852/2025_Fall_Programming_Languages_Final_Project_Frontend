import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Text } from '@mantine/core';
import { useAppData } from '@/AppDataContext';
import type { WaterRecord } from '@/services/types';
import WaterProgressCard from '@/components/InfoCard/WaterProgressCard/WaterProgressCard';
import WaterWeeklyCard from '@/components/InfoCard/WaterWeeklyCard/WaterWeeklyCard';
import { aggregateByWeekday } from '@/utils/weekly';
import AddWaterModal from '@/components/Modals/AddWaterModal/AddWaterModal';
import RecordList from '../../components/RecordList/RecordList';

type UiWaterRecord = { id: string; date: string; time?: string; amountMl: number };

const WaterPage = () => {
  const app = useAppData();
  const { water, addWater, updateWater, deleteWater } = app;

  const { t } = useTranslation();

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<UiWaterRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uiRecords: UiWaterRecord[] = (water || []).map((rr: WaterRecord) => ({
    id: String(rr.id ?? ''),
    date: rr.datetime ? String(rr.datetime).split('T')[0] : '',
    time: rr.datetime ? (String(rr.datetime).split('T')[1] ?? '') : '',
    amountMl: rr.amountMl ?? 0,
  }));

  const total = uiRecords.reduce((s, r) => s + (r.amountMl || 0), 0);

  const onAdd250Click = async () => {
    try {
      setError(null);
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = now.getFullYear();
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const min = pad(now.getMinutes());
      const datetime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      if (addWater) await addWater(datetime, 250);
        } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg ?? t('failed_add_250ml'));
    }
  };

  return (
    <Group gap="md" justify="start" align="stretch">
      <WaterProgressCard
        currentMl={total}
        goalMl={2000}
        onAddClick={() => setAddOpen(true)}
        onAdd250Click={onAdd250Click}
      />
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <WaterWeeklyCard data={aggregateByWeekday(uiRecords, (r) => (r.date ? `${r.date}T00:00` : ''), (r) => r.amountMl)} />

      <RecordList
        title={t('water_records')}
        records={uiRecords}
        onEdit={(r) => {
          const rec = r as UiWaterRecord;
          setEditItem({ id: rec.id, date: rec.date, time: rec.time, amountMl: rec.amountMl });
          setAddOpen(true);
        }}
        onDelete={async (r) => {
          try {
            setError(null);
            if (deleteWater) await deleteWater(r.id);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg ?? t('failed_delete_record'));
          }
        }}
        style={{ width: '100%' }}
        onAddClick={() => {
          setEditItem(null);
          setAddOpen(true);
        }}
      />

      <AddWaterModal
        opened={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        initialValues={
          editItem
            ? {
                amount: editItem.amountMl,
                time: editItem.time
                  ? `${editItem.date}T${editItem.time}`
                  : `${editItem.date}T00:00`,
              }
            : undefined
        }
        onAdd={async ({ amount, time }) => {
          try {
            setError(null);
            if (editItem) {
              if (updateWater) await updateWater(editItem.id, time, amount);
            } else {
              if (addWater) await addWater(time, amount);
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg ?? t('failed_save_record'));
          } finally {
            setAddOpen(false);
            setEditItem(null);
          }
        }}
      />
    </Group>
  );
};

export default WaterPage;
