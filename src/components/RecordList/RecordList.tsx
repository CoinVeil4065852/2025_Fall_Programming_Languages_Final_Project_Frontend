import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Button, Group, Stack, Table, Text } from '@mantine/core';
import InfoCard, { InfoCardProps } from '../InfoCards/InfoCard';

type RecordItem = { id: string; [key: string]: unknown };

type RecordListProps = Omit<InfoCardProps, 'children'> & {
  title?: string;
  records: RecordItem[];
  color?: string;
  onEdit?: (r: RecordItem) => void;
  onDelete?: (r: RecordItem) => void;
  onAddClick?: () => void;
  deleteLoadingId?: string | null;
};

const RecordList = ({
  color,
  title,
  records,
  onEdit,
  onDelete,
  onAddClick,
  deleteLoadingId,
  ...infoCardProps
}: RecordListProps) => {
  const keys: string[] = records[0] ? Object.keys(records[0]).filter((k) => k !== 'id') : [];
  const { t } = useTranslation();

  return (
    <InfoCard
      title={title}
      {...infoCardProps}
      rightHeader={
        onAddClick ? (
          <Button color={color} size="xs" onClick={onAddClick}>
            {t('add')}
          </Button>
        ) : undefined
      }
      childrenPadding={'sm'}
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
                return <Table.Th key={k}>{t(keyForT)}</Table.Th>;
              })}
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {records.map((r) => (
              <Table.Tr key={r.id}>
                {keys.map((k) => {
                  const value: unknown = (r as Record<string, unknown>)[k] ?? '';
                  if (k === 'intensity') {
                    const s = String(value ?? '').toLowerCase();
                    const normalized = s === 'moderate' ? 'medium' : s;
                    const labelKey = `intensity_${normalized}`;
                    const colorMap: Record<string, string> = {
                      low: 'green',
                      medium: 'orange',
                      high: 'red',
                    };
                    const badgeColor = colorMap[s] ?? colorMap[normalized] ?? 'gray';
                    return (
                      <Table.Td key={k}>
                        {s ? (
                          <Badge color={badgeColor} radius="sm" variant="filled">
                            {t(labelKey)}
                          </Badge>
                        ) : (
                          <Text size="sm">{String(value)}</Text>
                        )}
                      </Table.Td>
                    );
                  }
                  return (
                    <Table.Td key={k}>
                      <Text size="sm">{String(value)}</Text>
                    </Table.Td>
                  );
                })}
                <Table.Td>
                  <Group visibleFrom="sm" gap={6} justify="right">
                    {onEdit && (
                      <Button color={color} size="xs" variant="outline" onClick={() => onEdit(r)}>
                        {t('edit')}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => onDelete(r)}
                        loading={deleteLoadingId === r.id}
                        disabled={deleteLoadingId === r.id}
                      >
                        {t('delete')}
                      </Button>
                    )}
                  </Group>
                  <ActionIcon.Group hiddenFrom="sm">
                    {onEdit && (
                      <ActionIcon variant="default" size="lg" onClick={() => onEdit(r)}>
                        <IconPencil size={20} stroke={1.5} />
                      </ActionIcon>
                    )}
                    {onDelete && (
                      <ActionIcon variant="default" size="lg" onClick={() => onDelete(r)}>
                        <IconTrash size={20} stroke={1.5} />
                      </ActionIcon>
                    )}
                  </ActionIcon.Group>
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
