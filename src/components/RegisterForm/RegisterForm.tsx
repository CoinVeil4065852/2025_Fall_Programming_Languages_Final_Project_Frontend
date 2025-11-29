import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Button, Stack, Title, Text, Center, Box, LoadingOverlay, Anchor, Group, Select, NumberInput, SimpleGrid } from '@mantine/core';
import { NavLink, useNavigate } from 'react-router-dom';
import { register as authRegister } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';

type LoginResult = { token?: string; user?: any };

const RegisterForm = () => {
    type RegisterValues = {
        username: string;
        password: string;
        confirmPassword: string;
        age: number | '';
        weight: number | '';
        height: number | '';
        gender: 'male' | 'female' | 'other' | '';
    };

    const { t } = useTranslation();

    const form = useForm<RegisterValues>({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
            confirmPassword: '',
            age: '',
            weight: '',
            height: '',
            gender: '',
        },

        validate: {
            username: (value: string) => {
                const v = value?.toString().trim();
                if (!v) return t('username_required');
                if (!/^[A-Za-z0-9_]+$/.test(v)) return t('username_invalid_chars');
                return null;
            },
            password: (value: string) => {
                if (!value) return t('password_required');
                const lengthOk = value.length >= 8;
                const hasLower = /[a-z]/.test(value);
                const hasUpper = /[A-Z]/.test(value);
                const hasNumber = /[0-9]/.test(value);
                if (!lengthOk || !hasLower || !hasUpper || !hasNumber) {
                    return t('password_requirements');
                }
                return null;
            },
            confirmPassword: (value: string, values: RegisterValues) => {
                if (!value) return t('confirm_password_required');
                return value === values.password ? null : t('passwords_mismatch');
            },
            age: (value: number | '') => {
                if (value === '' || value === null || value === undefined) return t('age_required');
                const n = Number(value);
                return Number.isFinite(n) ? null : t('age_invalid');
            },
            weight: (value: number | '') => {
                if (value === '' || value === null || value === undefined) return t('weight_required');
                const n = Number(value);
                return Number.isFinite(n) ? null : t('weight_invalid');
            },
            height: (value: number | '') => {
                if (value === '' || value === null || value === undefined) return t('height_required');
                const n = Number(value);
                return Number.isFinite(n) ? null : t('height_invalid');
            },
            gender: (value: string) => {
                const allowed = ['male', 'female', 'other'];
                if (!value) return t('gender_required');
                return allowed.includes(value) ? null : t('gender_invalid');
            },
        },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = form.onSubmit(async (values) => {
        if (loading) return;
        console.log(values)

        const { username, password, age, weight, height, gender } = values;

        setLoading(true);
        try {
            const toNumber = (v: number | '') => (v === '' || v === null || v === undefined) ? undefined : Number(v);
            const result: LoginResult = await authRegister({
                username,
                password,
                age: toNumber(age),
                weight: toNumber(weight),
                height: toNumber(height),
                gender: gender || undefined,
            });

            // Navigate to home after successful registration
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err?.message ?? t('registration_failed'));
        } finally {
            setLoading(false);
        }
    })

    return (
        <Box pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Paper shadow='md' radius="md" p="xl" withBorder style={{ maxWidth: 420, margin: '2rem auto' }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Stack gap="sm">
                        <Center>
                            <Title order={3} >{t('title')}</Title>
                        </Center>

                        <TextInput
                            label={t('username')}
                            placeholder={t('username_placeholder')}
                            key={form.key('username')}
                            {...form.getInputProps('username')}

                            autoComplete="username"
                        />

                        <PasswordInput
                            label={t('password')}
                            placeholder={t('password_placeholder')}
                            key={form.key('password')}
                            {...form.getInputProps('password')}

                            autoComplete="current-password"
                        />

                        <PasswordInput
                            label={t('confirm_password')}
                            placeholder={t('confirm_password_placeholder')}
                            key={form.key('confirmPassword')}
                            {...form.getInputProps('confirmPassword')}

                            autoComplete="new-password"
                        />



                        <SimpleGrid cols={2} spacing="sm">
                            <NumberInput
                                label={t('age')}
                                placeholder={t('age_placeholder')}
                                key={form.key('age')}
                                {...form.getInputProps('age')}
                                min={0}
                            />

                            <Select
                                label={t('gender')}
                                placeholder={t('gender_placeholder')}
                                data={[
                                    { value: 'male', label: t('male') },
                                    { value: 'female', label: t('female') },
                                    { value: 'other', label: t('other') },
                                ]}
                                key={form.key('gender')}
                                {...form.getInputProps('gender')}
                            />

                            <NumberInput
                                label={t('weight')}
                                placeholder={t('weight_placeholder')}
                                key={form.key('weight')}
                                {...form.getInputProps('weight')}
                                min={0}
                            />

                            <NumberInput
                                label={t('height')}
                                placeholder={t('height_placeholder')}
                                key={form.key('height')}
                                {...form.getInputProps('height')}
                                min={0}
                            />
                        </SimpleGrid>


                        {error && (
                            <Text c="red" size="sm" role="alert">
                                {error}
                            </Text>
                        )}

                        <Button type="submit" fullWidth loading={loading} mt="md">
                            {t('register')}
                        </Button>
                        <Group justify='center'>
                            <Text size="sm" c="dimmed" >
                                {t('register_page_login_prompt')}
                            </Text>
                            <Anchor component={NavLink} to="/login" size="sm">
                                {t('login')}
                            </Anchor>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}

export default RegisterForm;


