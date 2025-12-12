# Health Tracker

> This is a final project for the course DBME 2008 程式語言 at NTU

Health Tracker Dashboard is a demo front-end app for monitoring activity, sleep and water intake. It is built with React, Vite and Mantine and includes a dashboard, charts, localization, and authentication flows for a complete user experience.

## Build

- `npm run dev` to start the dev server
- `npm run build` to build production static files

## Backend

### Server

[Health Backend](https://github.com/viviennnne/health_backend#) is the official backend for this project, go to the page to see more.

### Configuration

This project comes with a mock api, which is enable by default. To use a real backend, create an `.env` file in the project root folder with content:

```txt
VITE_USE_MOCK_API=false
VITE_API_BASE=<url_to_api>
```
