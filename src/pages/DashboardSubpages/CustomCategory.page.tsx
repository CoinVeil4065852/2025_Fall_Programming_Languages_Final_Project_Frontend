import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useAppData } from '@/AppDataContext';
import AddCustomItemModal from '@/components/Modals/AddCustomItemModal/AddCustomItemModal';
import { CustomItem, Category } from '@/services/types';
import RecordList from '../../components/RecordList/RecordList';

type UiCustomRecord = { id: string; date: string; time: string; note: string };

const CustomCategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelected] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomItem | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const { t } = useTranslation();
  const {
    customCategories,
    customData,
    refreshCustomData,
    createCustomCategory,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
  } = useAppData();

  useEffect(() => {
    setCategories(customCategories ?? []);
    // set default selection to first category when none selected
    if (
      (!selectedCategory || selectedCategory === null) &&
      customCategories &&
      customCategories.length > 0
    ) {
      setSelected(customCategories[0].id);
    }
  }, [customCategories]);

  const uiRecords: UiCustomRecord[] = (customData?.[selectedCategory ?? ''] ?? []).map((item) => ({
    id: String(item.id ?? ''),
    date: item.datetime ? String(item.datetime).split('T')[0] : '',
    time: item.datetime ? (String(item.datetime).split('T')[1] ?? '') : '',
    note: item.note,
  }));

  const createCategory = async () => {
    if (!newCategory) return;
    try {
      setError(null);
      if (!createCustomCategory) throw new Error(t('endpoint_not_implemented'));
      await createCustomCategory(newCategory);
      setNewCategory('');
      showNotification({ title: t('create'), message: `${newCategory} created`, color: 'green' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg ?? t('failed_create_category'));
      showNotification({ title: t('failed_create_category'), message: msg, color: 'red' });
      setNewCategory('');
    }
  };

  return (
    <Stack gap="md">
      <h1>{t('custom_category')}</h1>
      <Grid>
        <Grid.Col span={6}>
          <Select
            data={categories.map((c) => ({ value: c.id, label: c.categoryName }))}
            value={selectedCategory}
            onChange={setSelected}
            placeholder={t('select_category')}
            searchable
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Group>
            <TextInput
              value={newCategory}
              onChange={(e) => setNewCategory(e.currentTarget.value)}
              placeholder={t('new_category_name')}
            />
            <Button onClick={createCategory}>{t('create')}</Button>
          </Group>
        </Grid.Col>
      </Grid>

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      {/** derive which fields to show and explicitly hide `datetime` for custom categories */}
      <RecordList
        style={{ width: '100%' }}
            title={selectedCategory ? `${categories.find((c) => c.id === selectedCategory)?.categoryName ?? ''} ${t('records')}` : t('select_a_category')}
        records={uiRecords}
        deleteLoadingId={deleteLoadingId}
          onEdit={(r) => {
          setEditItem(
            customData[selectedCategory ?? ''].find(
              (item) => String(item.id) === r.id
            ) as CustomItem
          );
          setAddOpen(true);
        }}
            onDelete={async (r) => {
          try {
            setError(null);
                setDeleteLoadingId(r.id);
                if (selectedCategory && deleteCustomItem) {
                      await deleteCustomItem(selectedCategory, r.id);
                      await refreshCustomData?.(selectedCategory);
                      showNotification({ title: t('delete'), message: 'Deleted', color: 'green' });
                }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg ?? t('failed_delete_custom_item'));
                showNotification({ title: t('failed_delete_custom_item'), message: msg, color: 'red' });
          }
              finally {
                setDeleteLoadingId(null);
              }
        }}
        onAddClick={
          selectedCategory
            ? () => {
                setEditItem(null);
                setAddOpen(true);
              }
            : undefined
        }
      />

      <AddCustomItemModal
        opened={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        initialValues={editItem ? { datetime: editItem.datetime, note: editItem.note } : undefined}
          onAdd={async ({ datetime, note }) => {
          try {
            if (!selectedCategory) throw new Error(t('no_category_selected'));
            if (editItem) {
              if (updateCustomItem) {
                  await updateCustomItem(selectedCategory, editItem.id, datetime, note);
                  await refreshCustomData?.(selectedCategory);
                  showNotification({ title: t('edit_item'), message: t('edit_item') + ' saved', color: 'green' });
              }
            } else {
              if (addCustomItem) {
                  await addCustomItem(selectedCategory, datetime, note);
                  await refreshCustomData?.(selectedCategory);
                  showNotification({ title: t('add_item'), message: t('add_item') + ' created', color: 'green' });
              }
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (editItem) setError(msg ?? t('failed_update_custom_item'));
            showNotification({ title: t(editItem ? 'failed_update_custom_item' : 'failed_add_custom_item'), message: msg, color: 'red' });
          } finally {
            setAddOpen(false);
            setEditItem(null);
          }
        }}
      />
    </Stack>
  );
};

export default CustomCategoryPage;
