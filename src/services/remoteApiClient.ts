import {
  ActivityRecord,
  ApiClient,
  AuthResponse,
  Category,
  CustomItem,
  SleepRecord,
  User,
  WaterRecord,
} from './types';

const base = import.meta.env.VITE_API_BASE || '';

async function req(path: string, opts: RequestInit = {}) {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    // ignore parse error
  }
  if (!res.ok) {
    const obj = json as Record<string, unknown> | null;
    const errMessage = obj && typeof obj.errorMessage === 'string'
      ? (obj.errorMessage as string)
      : obj && typeof obj.message === 'string'
      ? (obj.message as string)
      : undefined;
    const err = errMessage || res.statusText || 'API error';
    throw new Error(err);
  }
  return json;
}

export const remoteApiClient: ApiClient = {
  async login(creds) {
    const body = JSON.stringify({ name: creds.name, password: creds.password });
    const json = await req('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const obj = json as Record<string, unknown> | null;
    const token: string | undefined =
      obj && typeof obj.token === 'string' ? (obj.token as string) : undefined;
    if (!token) {
      throw new Error('Login failed: no token returned');
    }
    return { token } as AuthResponse;
  },

  async register(data) {
    const payload: Record<string, unknown> = { name: data.name, password: data.password };
    if (data.age != null) {
      payload.age = data.age;
    }
    if (data.weightKg != null) {
      payload.weightKg = data.weightKg;
    }
    if (data.heightM != null) {
      payload.heightM = data.heightM;
    }
    if (data.gender != null) {
      payload.gender = data.gender;
    }
    const json = await req('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const obj = json as Record<string, unknown> | null;
    const token: string | undefined =
      obj && typeof obj.token === 'string' ? (obj.token as string) : undefined;
    if (!token) {
      throw new Error('Register failed: no token returned');
    }
    return { token } as AuthResponse;
  },

  async getProfile(token) {
    const json = await req('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
    return json as User;
  },

  async getBMI(token) {
    const json = await req('/user/bmi', { headers: { Authorization: `Bearer ${token}` } });
    const obj = json as Record<string, unknown> | null;
    const bmi = obj && typeof obj.bmi === 'number' ? (obj.bmi as number) : undefined;
    if (typeof bmi !== 'number') {
      throw new Error('Invalid BMI returned');
    }
    return bmi;
  },

  async addWater(token, datetime, amountMl) {
    const body = JSON.stringify({ datetime, amountMl });
    const json = await req('/waters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body,
    });
    return json as WaterRecord;
  },

  async getAllWater(token) {
    const json = await req('/waters', { headers: { Authorization: `Bearer ${token}` } });
    return (json || []) as WaterRecord[];
  },

  async updateWater(token, id, datetime, amountMl) {
    const body = JSON.stringify({ datetime, amountMl });
    const json = await req(`/waters/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    });
    return json as WaterRecord;
  },

  async deleteWater(token, id) {
    await req(`/waters/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  },

  async addSleep(token, datetime, hours) {
    const body = JSON.stringify({ datetime, hours });
    const json = await req('/sleeps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body,
    });
    return json as SleepRecord;
  },

  async getAllSleep(token) {
    const json = await req('/sleeps', { headers: { Authorization: `Bearer ${token}` } });
    return (json || []) as SleepRecord[];
  },

  async updateSleep(token, id, datetime, hours) {
    const json = await req(`/sleeps/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ datetime, hours }),
    });
    return json as SleepRecord;
  },
  async deleteSleep(token, id) {
    await req(`/sleeps/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  },

  async addActivity(token, datetime, minutes, intensity) {
    const body = JSON.stringify({ datetime, minutes, intensity });
    const json = await req('/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body,
    });
    return json as ActivityRecord;
  },

  async getAllActivity(token) {
    const json = await req('/activities', { headers: { Authorization: `Bearer ${token}` } });
    return (json || []) as ActivityRecord[];
  },

  async updateActivity(token, id, datetime, minutes, intensity) {
    const body = JSON.stringify({ datetime, minutes, intensity });
    const json = await req(`/activities/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    });
    return json as ActivityRecord;
  },

  async deleteActivity(token, id) {
    await req(`/activities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  },

  async sortActivityByDuration(token) {
    await req('/activities?sortBy=duration', { headers: { Authorization: `Bearer ${token}` } });
  },
  async getCustomCategories(_token?) {
    const json = await req('/category/list', {
      headers: _token ? { Authorization: `Bearer ${_token}` } : {},
    });
    return (json || []) as Category[];
  },
  async getCustomData(categoryId, _token?) {
    const json = await req(`/category/${encodeURIComponent(categoryId)}/list`, {
      headers: _token ? { Authorization: `Bearer ${_token}` } : {},
    });
    return (json || []) as CustomItem[];
  },
  async createCustomCategory(categoryName, _token?) {
    const json = await req('/category/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      },
      body: JSON.stringify({ categoryName }),
    });
    return json as Category;
  },
  async addCustomItem(token, categoryId, datetime, note) {
    const body = JSON.stringify({ datetime, note });
    const json = await req(`/category/${encodeURIComponent(categoryId)}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    });
    return json as CustomItem;
  },
  async updateCustomItem(token, categoryId, itemId, datetime, note) {
    const body = JSON.stringify({ datetime, note });
    const json = await req(
      `/category/${encodeURIComponent(categoryId)}/${encodeURIComponent(itemId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      }
    );
    return json as CustomItem;
  },
  async deleteCustomItem(token, categoryId, itemId) {
    await req(`/category/${encodeURIComponent(categoryId)}/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
      headers: token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  },
  async deleteCustomCategory(token, categoryId) {
    await req(`/category/${encodeURIComponent(categoryId)}`, {
      method: 'DELETE',
      headers: token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  },
};

export default remoteApiClient;
