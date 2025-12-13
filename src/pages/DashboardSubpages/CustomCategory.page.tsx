import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useAppData } from '@/AppDataContext';
import { AddCustomItemModal } from '@/components/Modals';
import { Category, CustomItem } from '@/services/types';
import RecordList from '../../components/RecordList/RecordList';

type UiCustomRecord = { id: string; date: string; time: string; note: string };

const CustomCategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelected] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomItem | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  const { t } = useTranslation();
  const {
    customCategories,
    customData,
    refreshCustomData,
    createCustomCategory,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
    deleteCustomCategory,
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
  }, [customCategories, selectedCategory]);

  // refresh data when a category is selected (including initial mount)
  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
    // refresh data for the selected category when it changes or when component mounts
    refreshCustomData?.(selectedCategory);
  }, [selectedCategory]);

  const uiRecords: UiCustomRecord[] = (customData?.[selectedCategory ?? ''] ?? []).map((item) => ({
    id: String(item.id ?? ''),
    date: item.datetime ? String(item.datetime).split('T')[0] : '',
    time: item.datetime ? (String(item.datetime).split('T')[1] ?? '') : '',
    note: item.note,
  }));

  const createCategory = async () => {
    if (!newCategory) {
      return;
    }
    try {
      setError(null);
      setCreateLoading(true);
      if (!createCustomCategory) {
        throw new Error(t('endpoint_not_implemented'));
      }
      const created = await createCustomCategory(newCategory);
      // if created, select the new category and initialize its list
      if (created?.id) {
        setSelected(created.id);
        await refreshCustomData?.(created.id);
      }
      setNewCategory('');
      showNotification({
        title: t('create'),
        message: t('category_created', { name: newCategory }),
        color: 'green',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg ?? t('failed_create_category'));
      showNotification({ title: t('failed_create_category'), message: msg, color: 'red' });
      setNewCategory('');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) {
      return;
    }
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      t('confirm_delete_category') ?? 'Delete this category and all its items?'
    );
    if (!ok) {
      return;
    }
    try {
      setError(null);
      setDeleteCategoryLoading(true);
      if (deleteCustomCategory) {
        await deleteCustomCategory(selectedCategory);
      }
      // after deletion, clear selection; the effect watching customCategories will pick a default
      setSelected(null);
      showNotification({
        title: t('delete'),
        message: t('category_deleted', {
          name: categories.find((c) => c.id === selectedCategory)?.categoryName ?? '',
        }),
        color: 'green',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg ?? t('failed_delete_custom_category'));
      showNotification({ title: t('failed_delete_custom_category'), message: msg, color: 'red' });
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Stack>
        <Group>
          <TextInput
            flex={1}
            maw={300}
            value={newCategory}
            onChange={(e) => setNewCategory(e.currentTarget.value)}
            placeholder={t('new_category_name')}
          />
          <Button
            onClick={createCategory}
            loading={createLoading}
            disabled={createLoading || !newCategory}
          >
            {t('create')}
          </Button>
          {selectedCategory && (
            <Button
              color="red"
              onClick={handleDeleteCategory}
              loading={deleteCategoryLoading}
              disabled={deleteCategoryLoading}
            >
              {t('delete')}
            </Button>
          )}
        </Group>
        <Group>
          <Select
            data={categories.map((c) => ({ value: c.id, label: c.categoryName }))}
            value={selectedCategory}
            onChange={setSelected}
            placeholder={t('select_category')}
            searchable
          />
        </Group>
      </Stack>

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      {/** derive which fields to show and explicitly hide `datetime` for custom categories */}
      <RecordList
        style={{ width: '100%' }}
        title={
          selectedCategory
            ? t('records_for', {
                name: categories.find((c) => c.id === selectedCategory)?.categoryName ?? '',
              })
            : t('select_a_category')
        }
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
              showNotification({
                title: t('delete'),
                message: t('deleted', { thing: t('records') }),
                color: 'green',
              });
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg ?? t('failed_delete_custom_item'));
            showNotification({ title: t('failed_delete_custom_item'), message: msg, color: 'red' });
          } finally {
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
            if (!selectedCategory) {
              throw new Error(t('no_category_selected'));
            }
            if (editItem) {
              if (updateCustomItem) {
                await updateCustomItem(selectedCategory, editItem.id, datetime, note);
                await refreshCustomData?.(selectedCategory);
                showNotification({
                  title: t('edit_item'),
                  message: t('saved', { thing: t('edit_item') }),
                  color: 'green',
                });
              }
            } else if (addCustomItem) {
              await addCustomItem(selectedCategory, datetime, note);
              await refreshCustomData?.(selectedCategory);
              showNotification({
                title: t('add_item'),
                message: t('created', { thing: t('add_item') }),
                color: 'green',
              });
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (editItem) {
              setError(msg ?? t('failed_update_custom_item'));
            }
            showNotification({
              title: t(editItem ? 'failed_update_custom_item' : 'failed_add_custom_item'),
              message: msg,
              color: 'red',
            });
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
