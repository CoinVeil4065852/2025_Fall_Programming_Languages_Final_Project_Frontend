import mockApiClient from './mockApiClient';
import remoteApiClient from './remoteApiClient';

// Select which client to use. Default to mock in development unless overridden.
const useMock = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

const api = useMock ? mockApiClient : remoteApiClient;

export default api;
export { mockApiClient, remoteApiClient };
