import { ApiClient, AuthResponse, Credentials, User, WaterRecord, SleepRecord, ActivityRecord, CustomItem } from './types';

const base = import.meta.env.VITE_API_BASE || '';

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    // ignore parse error
  }
  if (!res.ok) {
    const err = (json && json.message) || res.statusText || 'API error';
    throw new Error(err);
  }
  return json;
}

export const remoteApiClient: ApiClient = {
  async login(creds) {
    const body = new URLSearchParams();
    body.set('name', creds.username);
    body.set('password', creds.password);
    const json = await req('/login', { method: 'POST', body });
    // backend returns { status: 'ok', token: '...' }
    const token: string = json?.token;
    if (!token) throw new Error('Login failed: no token returned');
    // fetch profile after login
    const user = await req('/user/profile', { headers: { 'X-Auth-Token': token } });
    return { token, user } as AuthResponse;
  },

  async register(data) {
    const body = new URLSearchParams();
    body.set('name', data.username);
    body.set('password', data.password);
    if (data.age != null) body.set('age', String(data.age));
    if (data.weight != null) body.set('weightKg', String(data.weight));
    if (data.height != null) body.set('heightM', String(data.height));
    const json = await req('/register', { method: 'POST', body });
    // backend returns { status: 'ok', token: '...' }
    const token: string = json?.token;
    if (!token) throw new Error('Register failed: no token returned');
    // fetch profile after register
    const user = await req('/user/profile', { headers: { 'X-Auth-Token': token } });
    return { token, user } as AuthResponse;
  },

  async getProfile(token) {
    const json = await req('/user/profile', { headers: { 'X-Auth-Token': token } });
    return json as User;
  },

  async getBMI(token) {
    const json = await req('/user/bmi', { headers: { 'X-Auth-Token': token } });
    return json.bmi as number;
  },

  async addWater(token, datetime, amountMl) {
    const date = (datetime || '').split('T')[0] || '';
    const body = JSON.stringify({ date, datetime, amountMl });
    const json = await req('/water/add', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token }, body });
    return (json && json.item) as WaterRecord;
  },

  async getAllWater(token) {
    const json = await req('/water/list', { headers: { 'X-Auth-Token': token } });
    return (json.records || []) as WaterRecord[];
  },

  async updateWater(token, id, datetime, amountMl) {
    const date = (datetime || '').split('T')[0] || '';
    const body = JSON.stringify({ date, datetime, amountMl });
    await req(`/water/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'X-Auth-Token': token, 'Content-Type': 'application/json' }, body });
  },

  async deleteWater(token, id) {
    await req(`/water/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Auth-Token': token } });
  },

  async getWeeklyAverageWater(token) {
    const json = await req('/water/weekly', { headers: { 'X-Auth-Token': token } });
    return json.averageMl as number;
  },

  async isWaterEnough(token, goalMl) {
    const json = await req(`/water/weekly?goalMl=${encodeURIComponent(String(goalMl))}`, { headers: { 'X-Auth-Token': token } });
    return !!json.enough;
  },

  async addSleep(token, datetime, hours) {
    const date = (datetime || '').split('T')[0] || '';
    const body = JSON.stringify({ date, datetime, hours });
    const json = await req('/sleep/add', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token }, body });
    return (json && json.item) as SleepRecord;
  },

  async getLastSleepHours(token) {
    const json = await req('/sleep/last', { headers: { 'X-Auth-Token': token } });
    return json.lastHours as number;
  },

  async getAllSleep(token) {
    const json = await req('/sleep/list', { headers: { 'X-Auth-Token': token } });
    return (json.records || []) as SleepRecord[];
  },

  async isSleepEnough(token, minHours) {
    const json = await req(`/sleep/last?minHrs=${encodeURIComponent(String(minHours))}`, { headers: { 'X-Auth-Token': token } });
    return !!json.enough;
  },

  async updateSleep(token, id, datetime, hours) {
    const date = (datetime || '').split('T')[0] || '';
    await req(`/sleep/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'X-Auth-Token': token, 'Content-Type': 'application/json' }, body: JSON.stringify({ date, datetime, hours }) });
  },

  async addActivity(token, datetime, minutes, intensity) {
    const date = (datetime || '').split('T')[0] || '';
    const body = JSON.stringify({ date, datetime, minutes, intensity });
    const json = await req('/activity/add', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token }, body });
    return (json && json.item) as ActivityRecord;
  },

  async getAllActivity(token) {
    const json = await req('/activity/list', { headers: { 'X-Auth-Token': token } });
    return (json.records || []) as ActivityRecord[];
  },

  async updateActivity(token, id, datetime, minutes, intensity) {
    const date = (datetime || '').split('T')[0] || '';
    const body = JSON.stringify({ date, datetime, minutes, intensity });
    await req(`/activity/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'X-Auth-Token': token, 'Content-Type': 'application/json' }, body });
  },

  async deleteActivity(token, id) {
    await req(`/activity/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Auth-Token': token } });
  },

  async sortActivityByDuration(token) {
    await req('/activity/list?sortBy=duration', { headers: { 'X-Auth-Token': token } });
  },
  async getCustomCategories(token?) {
    const json = await req('/custom/category/list', { headers: token ? { 'X-Auth-Token': token } : {} });
    return (json || []) as string[];
  },
  async getCustomData(categoryName, token?) {
    const json = await req(`/custom/data/list?categoryName=${encodeURIComponent(categoryName)}`, { headers: token ? { 'X-Auth-Token': token } : {} });
    return (json || []) as CustomItem[];
  },
  async createCustomCategory(categoryName, token?) {
    await req('/custom/category/create', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Auth-Token': token } : {}) }, body: JSON.stringify({ categoryName }) });
  },
  async addCustomItem(token, categoryName, datetime, note) {
    const body = JSON.stringify({ categoryName, datetime, note });
    const json = await req('/custom/data/add', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Auth-Token': token } : {}) }, body });
    // expect backend to return created item
    return (json && json.item) as CustomItem;
  },
  async updateCustomItem(token, categoryName, itemId, datetime, note) {
    const body = JSON.stringify({ categoryName, datetime, note });
    await req(`/custom/data/${encodeURIComponent(itemId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Auth-Token': token } : {}) }, body });
  },
  async deleteCustomItem(token, categoryName, itemId) {
    await req(`/custom/data/${encodeURIComponent(itemId)}?categoryName=${encodeURIComponent(categoryName)}`, { method: 'DELETE', headers: token ? { 'X-Auth-Token': token } : {} });
  },
};

export default remoteApiClient;
