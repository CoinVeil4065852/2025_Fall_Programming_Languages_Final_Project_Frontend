import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack } from '@mantine/core';
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
    // Only set form values when the modal opens or initialValues changes
    // Guard against unnecessary updates by comparing the incoming
    // values with the current form values to prevent infinite update loops.
    if (!opened || !initialValues) {
      return;
    }

    try {
      const incoming = JSON.stringify(initialValues);
      const current = JSON.stringify(form.values);
      if (incoming !== current) {
        form.setValues(initialValues as T);
      }
    } catch (err) {
      // If values are not serializable, just set values (fallback)
      form.setValues(initialValues as T);
    }
    // We intentionally avoid adding `form` or `form.values` to the deps
    // array as the `useForm` result is stable and adding it can cause
    // the effect to fire more often than needed. We include `opened`
    // and `initialValues` so updates happen when the modal opens or
    // new initial values are provided.
  }, [initialValues, opened, form]);

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
