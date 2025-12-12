import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput, Stack, TextInput } from '@mantine/core';
import { toLocalDatetimeInput } from '@/utils/datetime';
import BaseAddRecordModal from '../BaseAddRecordModal/BaseAddRecordModal';

type Values = {
  hours: number | '';
  time: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onAdd: (values: { hours: number; time: string }) => Promise<void> | void;
  initialValues?: Values;
  submitLabel?: string;
};

const AddSleepModal: React.FC<Props> = ({ opened, onClose, onAdd, initialValues, submitLabel }) => {
  // Recompute defaults each time the modal opens so the default time is current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaults: Values = useMemo(
    () => ({ hours: 7.5, time: toLocalDatetimeInput(new Date()) }),
    [opened]
  );

  const { t } = useTranslation();

  return (
    <BaseAddRecordModal<Values>
      opened={opened}
      onClose={onClose}
      title={initialValues ? t('edit_sleep') : t('add_sleep')}
      initialValues={initialValues ?? defaults}
      onSubmit={async (values) => {
        const hrs = typeof values.hours === 'number' ? values.hours : Number(values.hours);
        await onAdd({ hours: hrs, time: values.time });
      }}
      submitLabel={submitLabel ?? (initialValues ? t('save') : t('add'))}
    >
      {(form) => (
        <Stack>
          <NumberInput label={t('hours')} min={0} step={0.1} {...form.getInputProps('hours')} />
          <TextInput label={t('time')} type="datetime-local" {...form.getInputProps('time')} />
        </Stack>
      )}
    </BaseAddRecordModal>
  );
};

export default AddSleepModal;
