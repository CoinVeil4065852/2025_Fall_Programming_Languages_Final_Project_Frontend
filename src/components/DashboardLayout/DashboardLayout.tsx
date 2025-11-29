import { useDisclosure } from '@mantine/hooks';
import { Outlet, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { AppShell, Burger, NavLink as MantineNavLink, Group, Text } from '@mantine/core';
import { IconLayoutDashboard, IconDroplet, IconRun, IconBed, IconCategory, IconSunMoon, IconWorld } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getProfile } from '../../services/auth';
import { ActionIcon } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { Menu, Tooltip } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useThemeChoice } from '../../contexts/ThemeContext';


const data = [
    { icon: <IconLayoutDashboard />, labelId: 'overview', descriptionid: 'overview_description', to: '/dashboard/overview' },
    { icon: <IconDroplet />, labelId: 'water', descriptionid: 'water_description', to: '/dashboard/water' },
    { icon: <IconRun />, labelId: 'activity', descriptionid: 'activity_description', to: '/dashboard/activity' },
    { icon: <IconBed />, labelId: 'sleep', descriptionid: 'sleep_description', to: '/dashboard/sleep' },
    { icon: <IconCategory />, labelId: 'custom_category', descriptionid: 'custom_category_description', to: '/dashboard/custom' },
];

const DashboardLayout = () => {
    const { t, i18n } = useTranslation();
    const [opened, { toggle, close }] = useDisclosure(false);
    const navigate = useNavigate();

    const [username, setUsername] = useState<string | null>(null);
    const { setChoice, choice } = useThemeChoice();

    useEffect(() => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) return;
        let mounted = true;
        (async () => {
            try {
                const profile = await getProfile(token);
                if (mounted) setUsername(profile.username ?? null);
            } catch (err) {
                // ignore
                if (mounted) setUsername(null);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);


    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
        >
            <AppShell.Header p="xs">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <div style={{ fontWeight: 700 }}>{t('dashboard')}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              
                        <Menu >
                            <Menu.Target>
                                <Tooltip label={t('language')}>
                                    <ActionIcon variant="default">
                                        <IconWorld />
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={() => { i18n.changeLanguage('en'); }}>
                                    {t('english')}
                                </Menu.Item>
                                <Menu.Item onClick={() => { i18n.changeLanguage('zh-TW'); }}>
                                    {t('chinese')}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>


                        <Menu >
                            <Menu.Target>
                                <Tooltip label={t('theme')}>
                                    <ActionIcon variant="default">
                                        {choice === 'light' ? <IconSun /> : choice === 'dark' ? <IconMoon /> : <IconSunMoon />}
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={() => { setChoice('light'); }} leftSection={<IconSun size={14} />}>
                                    {t('light')}
                                </Menu.Item>
                                <Menu.Item onClick={() => { setChoice('dark'); }} leftSection={<IconMoon size={14} />}>
                                    {t('dark')}
                                </Menu.Item>
                                <Menu.Item onClick={() => { setChoice('system'); }} leftSection={<IconSunMoon size={14} />}>
                                    {t('match_device')}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                </div>
            </AppShell.Header>

            <AppShell.Navbar p="xs">
                <AppShell.Section>
                    {data.map((item) => (
                        <MantineNavLink
                            mb="sm" key={item.labelId} to={item.to}
                            onClick={close}
                            component={RouterNavLink}
                            label={t(item.labelId)}
                            description={t(item.descriptionid)}
                            leftSection={item.icon}
                        />

                    ))}
                </AppShell.Section>

                <AppShell.Section mt="auto">
                    <Group justify='space-between' align='center' pl="xs" pr="xs">

                        <Text size="md"  >
                            {typeof username === 'string' && username ? username : t('username')}
                        </Text>
                        <Tooltip label={t('logout')}>
                            <ActionIcon
                                variant="default"
                                onClick={() => {
                                    // clear both storages and navigate to login
                                    localStorage.removeItem('authToken');
                                    sessionStorage.removeItem('authToken');
                                    navigate('/login');
                                }}
                                aria-label="Logout"
                            >
                                <IconLogout size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}

export default DashboardLayout;
