import React, { useEffect } from 'react';
import { Button, Group, Modal, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';

type BaseAddRecordModalProps<T> = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  initialValues?: T;
  onSubmit: (values: T) => Promise<void> | void;
  children: (form: ReturnType<typeof useForm>) => React.ReactNode;
  submitLabel?: string;
};

function BaseAddRecordModal<T extends Record<string, any>>({
  opened,
  onClose,
  title,
  initialValues,
  onSubmit,
  children,
  submitLabel,
}: BaseAddRecordModalProps<T>) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('add');
  const resolvedSubmit = submitLabel ?? t('save');
  const form = useForm<T>({
    initialValues: (initialValues ?? ({} as T)) as T,
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (initialValues) {
      form.setValues(initialValues as T);
    }
  }, [initialValues, opened]);

  const handleSubmit = form.onSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={resolvedTitle}
      centered
      withOverlay
      closeOnClickOutside={true}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack>
          {children(form as any)}
          <Group ml="auto" mt="md">
            <Button type="submit">{resolvedSubmit}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default BaseAddRecordModal;
