import { useState } from 'react';
import { Paper, TextInput, PasswordInput, Checkbox, Button, Stack, Title, Text, Center, Box, LoadingOverlay, Anchor, Group } from '@mantine/core';
import { NavLink, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';

type LoginResult = { token?: string; user?: any };

const LoginForm = () => {
  const { t } = useTranslation();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
    },

    validate: {
      username: (value) => value.trim() ? null : 'Invalid username',
      password: (value) => value.trim() ? null : 'Invalid password',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = form.onSubmit(async (values) => {
    if (loading) return;
    console.log(values)


    const { username, password, rememberMe: remember } = values;

    setLoading(true);
    try {
      const result: LoginResult = await authLogin({ username, password });
      if (result.token) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('authToken', result.token);
      }
      // Navigate to home after successful login
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
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

            <Checkbox
              label={t('remember_me')}
              key={form.key('rememberMe')}
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />

            {error && (
              <Text c="red" size="sm" role="alert">
                {error}
              </Text>
            )}

            <Button type="submit" fullWidth loading={loading} mt="md">
              {t('login')}
            </Button>
            <Group  justify='center'>
              <Text size="sm" c="dimmed" >
                {t('register_prompt')}
              </Text>
              <Anchor component={NavLink} to="/register" size="sm">
                {t('register')}
              </Anchor>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default LoginForm;


