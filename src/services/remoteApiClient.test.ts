import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { remoteApiClient } from './remoteApiClient';

// Minimal fetch mock response
function mockFetchResponse(status = 200, body = '', statusText = '') {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: () => Promise.resolve(body),
  } as unknown as Response);
}

describe('remoteApiClient DELETE requests', () => {
  let oldFetch: any;
  beforeEach(() => {
    oldFetch = global.fetch;
    global.fetch = vi.fn();
  });
  afterEach(() => {
    global.fetch = oldFetch;
    vi.restoreAllMocks();
  });

  it('sends an empty JSON body with deleteWater', async () => {
    (global.fetch as any).mockImplementation(() => mockFetchResponse(200, ''));
    await remoteApiClient!.deleteWater!('token-1', 'abc');
    expect((global.fetch as any).mock.calls.length).toBeGreaterThan(0);
    const [url, opts] = (global.fetch as any).mock.calls[0];
    expect(url).toContain('/waters/abc');
    expect(opts.method).toBe('DELETE');
    expect((opts.headers as any).Authorization).toBe('Bearer token-1');
    expect((opts.headers as any)['Content-Type']).toBe('application/json');
    expect(opts.body).toBe(JSON.stringify({}));
  });

  it('sends an empty JSON body with deleteActivity', async () => {
    (global.fetch as any).mockImplementation(() => mockFetchResponse(200, ''));
    await remoteApiClient!.deleteActivity!('token-2', 'act-1');
    const [, opts] = (global.fetch as any).mock.calls[0];
    expect(opts.method).toBe('DELETE');
    expect((opts.headers as any).Authorization).toBe('Bearer token-2');
    expect((opts.headers as any)['Content-Type']).toBe('application/json');
    expect(opts.body).toBe(JSON.stringify({}));
  });

  it('sends an empty JSON body with deleteCustomItem (token provided)', async () => {
    (global.fetch as any).mockImplementation(() => mockFetchResponse(200, ''));
    await remoteApiClient!.deleteCustomItem!('token-3', 'cat-1', 'item-9');
    const [, opts] = (global.fetch as any).mock.calls[0];
    expect(opts.method).toBe('DELETE');
    expect((opts.headers as any).Authorization).toBe('Bearer token-3');
    expect((opts.headers as any)['Content-Type']).toBe('application/json');
    expect(opts.body).toBe(JSON.stringify({}));
  });

  it('sends an empty JSON body with deleteCustomItem (no token)', async () => {
    (global.fetch as any).mockImplementation(() => mockFetchResponse(200, ''));
    await remoteApiClient!.deleteCustomItem!(undefined as any, 'cat-1', 'item-9');
    const [, opts] = (global.fetch as any).mock.calls[0];
    expect(opts.method).toBe('DELETE');
    expect((opts.headers as any)['Content-Type']).toBe('application/json');
    expect(opts.body).toBe(JSON.stringify({}));
  });

  it('throws API errorMessage when present', async () => {
    (global.fetch as any).mockImplementation(() =>
      mockFetchResponse(400, JSON.stringify({ errorMessage: 'Invalid name or password' }), 'Bad Request')
    );
    await expect(remoteApiClient.login({ name: 'u', password: 'p' })).rejects.toThrow(
      'Invalid name or password'
    );
  });

  it('throws message field when present', async () => {
    (global.fetch as any).mockImplementation(() =>
      mockFetchResponse(400, JSON.stringify({ message: 'Some message' }), 'Bad Request')
    );
    await expect(remoteApiClient.login({ name: 'u', password: 'p' })).rejects.toThrow('Some message');
  });

  it('falls back to statusText if no message fields', async () => {
    (global.fetch as any).mockImplementation(() => mockFetchResponse(500, '', 'Server Error'));
    await expect(remoteApiClient.login({ name: 'u', password: 'p' })).rejects.toThrow('Server Error');
  });
});
