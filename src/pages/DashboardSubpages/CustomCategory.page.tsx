import React, { useEffect, useState } from 'react';
import { Grid, Stack, Select, Button, Group, TextInput } from '@mantine/core';
import RecordList from '../../components/RecordList/RecordList';

type CustomData = { id: string; [k: string]: any };

const CustomCategoryPage = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [records, setRecords] = useState<CustomData[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/custom/category/list');
        if (!res.ok) throw new Error('no backend');
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        setCategories(['Food', 'Medications']);
      }
    }
    load(); 
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!selected) return setRecords([]);
      try {
        const res = await fetch(`/custom/data/list?categoryName=${encodeURIComponent(selected)}`);
        if (!res.ok) throw new Error('no backend');
        const data = await res.json();
        setRecords(data || []);
      } catch (err) {
        setRecords([
          { id: '1', date: '2025-11-22', note: `Example item in ${selected}` },
        ]);
      }
    };
    loadData();
  }, [selected]);

  const createCategory = async () => {
    if (!newCategory) return;
    try {
      await fetch('/custom/category/create', { method: 'POST', body: JSON.stringify({ categoryName: newCategory }), headers: { 'Content-Type': 'application/json' } });
      setCategories((c) => [...c, newCategory]);
      setNewCategory('');
    } catch (err) {
      setCategories((c) => [...c, newCategory]);
      setNewCategory('');
    }
  };

  return (
    <Stack gap="md">
      <h1>Custom Category</h1>
      <Grid>
        <Grid.Col span={6}>
          <Select data={categories} value={selected} onChange={setSelected} placeholder="Select category" searchable />
        </Grid.Col>
        <Grid.Col span={6}>
          <Group>
            <TextInput value={newCategory} onChange={(e) => setNewCategory(e.currentTarget.value)} placeholder="New category name" />
            <Button onClick={createCategory}>Create</Button>
          </Group>
        </Grid.Col>
      </Grid>

      <RecordList title={selected ? `${selected} records` : 'Select a category'} records={records as any} onEdit={(r) => console.log('edit', r)} onDelete={(r) => console.log('delete', r)} />
    </Stack>
  );
}

export default CustomCategoryPage;
