import React from 'react';
import { NumberInput, Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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

function toLocalDatetimeInput(date = new Date()) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

const AddSleepModal: React.FC<Props> = ({ opened, onClose, onAdd, initialValues, submitLabel }) => {
  const defaults: Values = {
    hours: 7.5,
    time: toLocalDatetimeInput(new Date()),
  };

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
