import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { ThemeProvider, useThemeChoice } from './contexts/ThemeContext';

const AppInner = () => {
  const { choice } = useThemeChoice();

  const forcedColorScheme: 'light' | 'dark' | undefined = choice === 'system' ? undefined : choice;




  return (
    // pass colorScheme inside the theme object so Mantine applies it correctly
    <MantineProvider
      forceColorScheme={forcedColorScheme}
      theme={theme}
    >
      <Router />
    </MantineProvider>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
