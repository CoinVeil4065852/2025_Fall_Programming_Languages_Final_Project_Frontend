import React from 'react';
import { Card, Group, Stack, Text, Title, type CardProps } from '@mantine/core';

export type InfoCardProps = Omit<CardProps, 'children'> & {
  title: React.ReactNode;
  rightHeader?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  childrenPadding?: 'sm' | 'md' | 'lg' | 'xl' | number | string;
};

const InfoCard = ({
  title,
  subtitle,
  icon,
  children,
  rightHeader,
  childrenPadding,
  ...cardProps
}: InfoCardProps) => {
  return (
    <Card withBorder shadow="md" radius="md" {...cardProps} w={{ base: '100%', sm: 'auto' }}>
      <Card.Section p="lg" pb="sm">
        <Group align="center" justify="left">
          <Title order={3}>{title}</Title>
          {rightHeader ? <Group ml="auto">{rightHeader}</Group> : null}
        </Group>
      </Card.Section>
      <Card.Section p={childrenPadding ?? 'xl'} pt="sm" flex={1}>
        <Stack gap="xs" align="center" justify="center" h={'100%'} w={'100%'}>
          {children}
          {subtitle ? (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default InfoCard;
