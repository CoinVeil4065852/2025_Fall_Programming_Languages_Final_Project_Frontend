import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppDataProvider } from './AppDataContext';
import { Router } from './Router';
import { theme } from './theme';

const App = () => {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AppDataProvider>
        <Router />
      </AppDataProvider>
    </MantineProvider>
  );
};

export default App;
