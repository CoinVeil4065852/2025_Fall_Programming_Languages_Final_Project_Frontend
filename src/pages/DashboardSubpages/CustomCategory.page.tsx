import React, { useEffect, useState } from 'react';
import { Grid, Stack, Select, Button, Group, TextInput, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import RecordList from '../../components/RecordList/RecordList';
import InfoCard from '../../components/InfoCard/InfoCard';
import AddCustomItemModal from '@/components/Modals/AddCustomItemModal/AddCustomItemModal';
import api from '@/services';

type CustomData = { id: string; [k: string]: any };

const CustomCategoryPage = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [records, setRecords] = useState<CustomData[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomData | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
        if (!api.getCustomCategories) throw new Error(t('endpoint_not_implemented'));
        const list = await api.getCustomCategories(token);
        setCategories(list || []);
      } catch (err: any) {
        setCategories([]);
        setError(err?.message ?? t('failed_load_categories'));
      }
    };
    load(); 
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!selected) return setRecords([]);
      try {
        setError(null);
        const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
        if (!api.getCustomData) throw new Error(t('endpoint_not_implemented'));
        const data = await api.getCustomData(selected, token);
        const normalized = (data || []).map((d: any, i: number) => {
          const base = { id: d.id ?? String(i + 1), ...d } as any;
          if (d.datetime) {
            base.date = String(d.datetime).split('T')[0];
            base.time = String(d.datetime).split('T')[1] ?? '';
          }
          return base;
        });
        setRecords(normalized as CustomData[]);
      } catch (err: any) {
        setRecords([]);
        setError(err?.message ?? t('failed_load_category_data'));
      }
    };
    loadData();
  }, [selected]);

  const createCategory = async () => {
    if (!newCategory) return;
    try {
      setError(null);
      const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
      if (!api.createCustomCategory) throw new Error(t('endpoint_not_implemented'));
      await api.createCustomCategory(newCategory, token);
      setCategories((c) => [...c, newCategory]);
      setNewCategory('');
    } catch (err: any) {
      setError(err?.message ?? t('failed_create_category'));
      setNewCategory('');
    }
  };

  return (
    <Stack gap="md">
      <h1>{t('custom_category')}</h1>
      <Grid>
        <Grid.Col span={6}>
          <Select data={categories} value={selected} onChange={setSelected} placeholder={t('select_category')} searchable />
        </Grid.Col>
        <Grid.Col span={6}>
          <Group>
            <TextInput value={newCategory} onChange={(e) => setNewCategory(e.currentTarget.value)} placeholder={t('new_category_name')} />
            <Button onClick={createCategory}>{t('create')}</Button>
          </Group>
        </Grid.Col>
      </Grid>

      {error && <Text c="red" size="sm">{error}</Text>}

      <Group gap="md" justify="start" align="stretch">
        <InfoCard title={t('category_summary')} subtitle={selected ?? t('no_category_selected')}>
          <Text size="sm">{selected ? `${records.length} ${t('records')}` : t('select_category_to_see_data')}</Text>
        </InfoCard>

        <RecordList
          title={selected ? `${selected} ${t('records')}` : t('select_a_category')}
          records={records as any}
          onEdit={(r) => {
            setEditItem(r);
            setAddOpen(true);
          }}
          onDelete={async (r) => {
          try {
            setError(null);
            const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
            if (token && api.deleteCustomItem && selected) await api.deleteCustomItem(token, selected, r.id);
            // refresh list
            if (selected) {
              const tok = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
              if (tok && api.getCustomData) {
                const data = await api.getCustomData(selected, tok);
                const normalized = (data || []).map((d: any, i: number) => {
                  const base = { id: d.id ?? String(i + 1), ...d } as any;
                  if (d.datetime) {
                    base.date = String(d.datetime).split('T')[0];
                    base.time = String(d.datetime).split('T')[1] ?? '';
                  }
                  return base;
                });
                setRecords(normalized as CustomData[]);
              }
            }
          } catch (err: any) {
            setError(err?.message ?? t('failed_delete_custom_item'));
          }
        }}
        onAddClick={selected ? () => {
          setEditItem(null);
          setAddOpen(true);
        } : undefined}
      />
      </Group>

      <AddCustomItemModal
        opened={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        initialValues={editItem ? { datetime: editItem.datetime, note: editItem.note } : undefined}
        onAdd={async ({ datetime, note }) => {
          try {
            const token = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
            if (!selected) throw new Error('No category selected');
            if (editItem) {
              if (token && api.updateCustomItem) await api.updateCustomItem(token, selected, editItem.id, datetime, note);
            } else {
              if (token && api.addCustomItem) {
                await api.addCustomItem(token, selected, datetime, note);
              }
            }
            // refresh list after mutation
            if (selected) {
              const tok = (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;
              if (tok && api.getCustomData) {
                const data = await api.getCustomData(selected, tok);
                const normalized = (data || []).map((d: any, i: number) => ({ id: d.id ?? String(i + 1), ...d }));
                setRecords(normalized as CustomData[]);
              }
            }
          } catch (err: any) {
            if (!editItem) {
              const rec: CustomData = { id: String(Date.now()), datetime, note } as any;
              setRecords((s) => [rec, ...s]);
            } else {
              setError(err?.message ?? t('failed_update_custom_item'));
            }
          } finally {
            setAddOpen(false);
            setEditItem(null);
          }
        }}
      />
    </Stack>
  );
}

export default CustomCategoryPage;
