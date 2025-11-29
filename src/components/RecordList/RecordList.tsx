import React from 'react';
import { Table, Group, Button, Text, ScrollArea, Stack } from '@mantine/core';

type RecordItem = { id: string; [key: string]: any };

type Props = {
  title?: string;
  records: RecordItem[];
  fields?: string[]; // keys to show in order
  onEdit?: (r: RecordItem) => void;
  onDelete?: (r: RecordItem) => void;
};

const RecordList = ({ title, records, fields, onEdit, onDelete }: Props) => {
  const keys = fields ?? (records[0] ? Object.keys(records[0]).filter((k) => k !== 'id') : []);

  return (
    <div style={{ width: '100%' }}>
      {title ? <Text fw={700} mb="xs">{title}</Text> : null}
      <ScrollArea style={{ height: 360 }}>
        <Table verticalSpacing="sm" highlightOnHover>
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k}>{k}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                {keys.map((k) => (
                  <td key={k}>
                    <Text size="sm">{String(r[k] ?? '')}</Text>
                  </td>
                ))}
                <td>
                  <Group gap={6} justify="right">
                    {onEdit ? (
                      <Button size="xs" variant="outline" onClick={() => onEdit(r)}>
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button size="xs" color="red" onClick={() => onDelete(r)}>
                        Delete
                      </Button>
                    ) : null}
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
      {records.length === 0 ? (
        <Stack align="center" gap="xs" mt="md">
          <Text color="dimmed">No records yet.</Text>
        </Stack>
      ) : null}
    </div>
  );
}

export default RecordList;
