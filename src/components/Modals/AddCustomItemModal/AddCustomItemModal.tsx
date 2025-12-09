                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import React from 'react';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import { Stack, TextInput } from '@mantine/core';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import { useTranslation } from 'react-i18next';
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

const toLocalDatetimeInput = (date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const AddCustomItemModal: React.FC<Props> = ({ opened, onClose, onAdd, initialValues, submitLabel }) => {
  const defaults: Values = {
    datetime: toLocalDatetimeInput(new Date()),
    note: '',
  };

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
