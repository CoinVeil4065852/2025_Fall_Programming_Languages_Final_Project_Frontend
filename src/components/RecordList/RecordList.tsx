import { Button, Group, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import InfoCard, { InfoCardProps } from '../InfoCard/InfoCard';

type RecordItem = { id: string; [key: string]: any };

type RecordListProps = Omit<InfoCardProps, 'children'> & {
  title?: string;
  records: RecordItem[];
  fields?: string[]; // keys to show in order
  onEdit?: (r: RecordItem) => void;
  onDelete?: (r: RecordItem) => void;
  onAddClick?: () => void;
};

const RecordList = ({
  title,
  records,
  fields,
  onEdit,
  onDelete,
  onAddClick,
  ...infoCardProps
}: RecordListProps) => {
  const keys = fields ?? (records[0] ? Object.keys(records[0]).filter((k) => k !== 'id') : []);

  const { t } = useTranslation();

  return (
    <InfoCard
      title={title}
      {...infoCardProps}
      rightHeader={
        onAddClick ? (
          <Button size="xs" onClick={onAddClick}>
            {t('add')}
          </Button>
        ) : undefined
      }
    >
      {records.length === 0 ? (
        <Stack align="center" gap="xs" mt="md">
          <Text c="dimmed">{t('no_records_yet')}</Text>
        </Stack>
      ) : (
      
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {keys.map((k) => {
                  const map: Record<string, string> = {
                    date: 'date',
                    time: 'time',
                    amountMl: 'amount_ml',
                    amount: 'amount_ml',
                    hours: 'hours',
                    minutes: 'minutes',
                    intensity: 'intensity',
                  };
                  const keyForT = map[k] ?? k;
                  return (
                    <Table.Th key={k}>{t(keyForT)}</Table.Th>
                  );
                })}
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {records.map((r) => (
                <Table.Tr key={r.id}>
                  {keys.map((k) => {
                    let value: any = r[k];
                    // If the record contains a ISO datetime, derive date/time for display
                    if ((k === 'date' || k === 'time') && r.datetime) {
                      try {
                        const iso = String(r.datetime);
                        const [d, t] = iso.split('T');
                        if (k === 'date') value = d ?? '';
                        else value = (t || '').slice(0, 5); // HH:MM
                      } catch (e) {
                        // fallback to existing field
                        value = r[k] ?? '';
                      }
                    }
                    return (
                      <Table.Td key={k}>
                        <Text size="sm">{String(value ?? '')}</Text>
                      </Table.Td>
                    );
                  })}
                  <Table.Td>
                    <Group gap={6} justify="right">
                      {onEdit ? (
                        <Button size="xs" variant="outline" onClick={() => onEdit(r)}>
                          {t('edit')}
                        </Button>
                      ) : null}
                      {onDelete ? (
                        <Button size="xs" color="red" onClick={() => onDelete(r)}>
                          {t('delete')}
                        </Button>
                      ) : null}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
       
      )}
    </InfoCard>
  );
};

export default RecordList;
