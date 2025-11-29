import React from 'react';
import { Card, Stack, Text, Title } from '@mantine/core';
import type { CardProps } from '@mantine/core';

type InfoCardProps = Omit<CardProps, 'children'> & {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
};

const InfoCard = ({ title, subtitle, icon, children, ...cardProps }: InfoCardProps) => {
    return (
        <Card withBorder shadow="md" radius="md" {...cardProps}>
            <Card.Section p="lg" pb="sm" >

                <Title order={3}>{title}</Title>
            </Card.Section>
            <Card.Section p="xl" pt="sm">
                <Stack gap="xs">
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
}

export default InfoCard;