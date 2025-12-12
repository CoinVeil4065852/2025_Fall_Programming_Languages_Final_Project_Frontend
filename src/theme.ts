import { createTheme, MantineColorsTuple, NavLink } from '@mantine/core';

const myColor: MantineColorsTuple = [
  '#e4fefb',
  '#d5f7f4',
  '#aeece6',
  '#84e2d8',
  '#62d9cd',
  '#4bd3c5',
  '#3cd1c2',
  '#2ab7a9',
  '#18a497',
  '#008f83',
];

export const theme = createTheme({
  components: {
    NavLink: NavLink.extend({
      styles: {
        root: { borderRadius: 'var(--mantine-radius-md)' },
      },
    }),
  },
  colors: {
    myColor,
  },
  primaryColor: 'myColor',
});
