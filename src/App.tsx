import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { Router } from './Router';
import { AppDataProvider } from './AppDataContext';


const App = () => {
  return (
    <MantineProvider theme={theme}>
      <AppDataProvider>
        <Router />
      </AppDataProvider>
    </MantineProvider>
  );
};

export default App;
