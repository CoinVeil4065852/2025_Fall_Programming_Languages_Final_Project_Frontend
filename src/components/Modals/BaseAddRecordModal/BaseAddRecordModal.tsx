import React, { useEffect, useRef, useState } from 'react';
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

  // Only update the form values when the modal opens or the incoming
  // initialValues object actually changes its content. We track the
  // last incoming initial values JSON to avoid re-applying values
  // on every render when the child passes a new object with the
  // same content (which would clobber user input).
  const lastInitialJson = useRef<string | null>(null);
  useEffect(() => {
    if (!opened) {
      // Clear the remembered initial values so next open will set them
      lastInitialJson.current = null;
      return;
    }
    if (!initialValues) {
      return;
    }

    try {
      const incomingJson = JSON.stringify(initialValues);
      // If we've already applied this same initial values content,
      // don't reapply it (otherwise user edits would be overwritten).
      if (lastInitialJson.current !== incomingJson) {
        form.setValues(initialValues as T);
        lastInitialJson.current = incomingJson;
      }
    } catch (err) {
      // If values are not serializable, just set values (fallback)
      form.setValues(initialValues as T);
      lastInitialJson.current = null;
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
