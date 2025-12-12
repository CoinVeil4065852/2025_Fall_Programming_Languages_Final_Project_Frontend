import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NumberInput, Stack, TextInput } from '@mantine/core';
import { toLocalDatetimeInput } from '@/utils/datetime';
import BaseAddRecordModal from '../BaseAddRecordModal/BaseAddRecordModal';

type Values = {
  amount: number | '';
  time: string; // use datetime-local string
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onAdd: (values: { amount: number; time: string }) => Promise<void> | void;
  initialValues?: Values;
  submitLabel?: string;
};

const AddWaterModal: React.FC<Props> = ({ opened, onClose, onAdd, initialValues, submitLabel }) => {
  // Recompute defaults each time the modal opens so the default time is current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaults: Values = useMemo(
    () => ({ amount: 250, time: toLocalDatetimeInput(new Date()) }),
    [opened]
  );

  const { t } = useTranslation();

  return (
    <BaseAddRecordModal<Values>
      opened={opened}
      onClose={onClose}
      title={initialValues ? t('edit_water') : t('add_water')}
      initialValues={initialValues ?? defaults}
      onSubmit={async (values) => {
        const amt = typeof values.amount === 'number' ? values.amount : Number(values.amount);
        await onAdd({ amount: amt, time: values.time });
      }}
      submitLabel={submitLabel ?? (initialValues ? t('save') : t('add'))}
    >
      {(form) => (
        <Stack>
          <NumberInput label={t('amount_ml')} min={0} {...form.getInputProps('amount')} />

          <TextInput label={t('time')} type="datetime-local" {...form.getInputProps('time')} />
        </Stack>
      )}
    </BaseAddRecordModal>
  );
};

export default AddWaterModal;
