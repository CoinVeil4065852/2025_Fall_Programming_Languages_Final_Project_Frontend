import React, { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';

type BaseAddRecordModalProps<T> = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  initialValues?: T;
  onSubmit: (values: T) => Promise<void> | void;
  children: (form: ReturnType<typeof useForm<any>>) => React.ReactNode;
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={resolvedTitle}
      centered
      withOverlay
      closeOnClickOutside
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack>
          <fieldset disabled={isSubmitting} style={{ border: 'none', margin: 0, padding: 0 }}>
            {children(form)}
          </fieldset>
          <Group ml="auto" mt="md">
            <Button type="submit" loading={isSubmitting}>
              {resolvedSubmit}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default BaseAddRecordModal;
