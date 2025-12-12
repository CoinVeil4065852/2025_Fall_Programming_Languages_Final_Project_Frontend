import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, TextInput } from '@mantine/core';
import { toLocalDatetimeInput } from '@/utils/datetime';
import BaseAddRecordModal from '../BaseAddRecordModal/BaseAddRecordModal';

type Values = {
  datetime: string;
  note: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onAdd: (values: { datetime: string; note: string }) => Promise<void> | void;
  initialValues?: Values;
  submitLabel?: string;
};

const AddCustomItemModal: React.FC<Props> = ({
  opened,
  onClose,
  onAdd,
  initialValues,
  submitLabel,
}) => {
  // Recompute defaults each time the modal opens so the default time is current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaults: Values = useMemo(() => ({ datetime: toLocalDatetimeInput(new Date()), note: '' }), [opened]);

  const { t } = useTranslation();

  return (
    <BaseAddRecordModal<Values>
      opened={opened}
      onClose={onClose}
      title={initialValues ? t('edit_item') : t('add_item')}
      initialValues={initialValues ?? defaults}
      onSubmit={async (values) => {
        await onAdd({ datetime: values.datetime, note: values.note });
      }}
      submitLabel={submitLabel ?? (initialValues ? t('save') : t('add'))}
    >
      {(form) => (
        <Stack>
          <TextInput label={t('time')} type="datetime-local" {...form.getInputProps('datetime')} />
          <TextInput label={t('note')} {...form.getInputProps('note')} />
        </Stack>
      )}
    </BaseAddRecordModal>
  );
};

export default AddCustomItemModal;
