import { ApiClient, AuthResponse, Credentials, User, WaterRecord, SleepRecord, ActivityRecord, CustomItem } from './types';

// Simple in-memory mock implementing the ApiClient interface.
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

type InternalUser = User & { password?: string };

const db: {
  users: InternalUser[];
  water: Record<string, Array<WaterRecord>>;
  sleep: Record<string, Array<SleepRecord>>;
  activity: Record<string, Array<ActivityRecord>>;
  customCategories?: string[];
  customData?: Record<string, Array<CustomItem>>;
} = {
  users: [
    { id: '1', username: 'alice', age: 30, weight: 60, height: 165, gender: 'F', password: 'password' },
    { id: '2', username: 'bob', age: 28, weight: 75, height: 180, gender: 'M', password: 'password' },
  ],
  water: {},
  sleep: {},
  activity: {},
  customCategories: ['Food', 'Medications'],
  customData: {
    Food: [],
    Medications: [],
  },
};

let nextId = 3;
let nextRecId = 1;

function tokenFor(userId: string) {
  return `fake-token-${userId}`;
}

function userIdFromToken(token: string) {
  if (!token.startsWith('fake-token-')) return null;
  return token.replace('fake-token-', '');
}

export const mockApiClient: ApiClient = {
  async login(creds: Credentials) {
    await delay(300 + Math.random() * 200);
    const user = db.users.find((u) => u.username === creds.username);
    if (!user || creds.password !== 'password') {
      throw new Error('Invalid username or password (mock)');
    }
    return { token: tokenFor(user.id), user: { ...user } } as AuthResponse;
  },

  async register(data) {
    await delay(400 + Math.random() * 300);
    if (!data.username || !data.password) throw new Error('Missing username or password');
    if (db.users.find((u) => u.username === data.username)) throw new Error('Username taken (mock)');
    const newUser: InternalUser = {
      id: String(nextId++),
      username: data.username,
      age: data.age,
      weight: data.weight,
      height: data.height,
      gender: data.gender,
      password: data.password,
    };
    db.users.push(newUser);
    return { token: tokenFor(newUser.id), user: { ...newUser } } as AuthResponse;
  },

  async getProfile(token) {
    await delay(150);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    const user = db.users.find((u) => u.id === uid);
    if (!user) throw new Error('User not found (mock)');
    return { ...user } as User;
  },

  async getBMI(token) {
    await delay(100);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    const user = db.users.find((u) => u.id === uid);
    if (!user || !user.weight || !user.height) throw new Error('User data incomplete (mock)');
    // height in cm in mock data; convert to meters if > 10
    const heightM = user.height > 10 ? user.height / 100 : user.height;
    const bmi = user.weight / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  },

  async addWater(token, datetime, amountMl) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.water[uid] = db.water[uid] || [];
    const date = (datetime || '').split('T')[0] || '';
    const rec: WaterRecord = { id: String(nextRecId++), date, datetime, amountMl } as any;
    db.water[uid].push(rec);
    return rec;
  },

  async getAllWater(token) {
    await delay(100);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    return (db.water[uid] || []).slice();
  },

  async getWeeklyAverageWater(token) {
    await delay(120);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    const recs = db.water[uid] || [];
    if (!recs.length) return 0;
    // naive average over all records as a stand-in for weekly average
    const total = recs.reduce((s, r) => s + r.amountMl, 0);
    return Math.round((total / recs.length) * 10) / 10;
  },

  async updateWater(token, id, datetime, amountMl) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.water[uid] = db.water[uid] || [];
    const idx = db.water[uid].findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Record not found (mock)');
    const date = (datetime || '').split('T')[0] || '';
    db.water[uid][idx] = { id, date, datetime, amountMl } as any;
  },

  async deleteWater(token, id) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.water[uid] = (db.water[uid] || []).filter((r) => r.id !== id);
  },

  async isWaterEnough(token, goalMl) {
    const avg = await this.getWeeklyAverageWater(token);
    return avg >= goalMl;
  },

  async addSleep(token, datetime, hours) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.sleep[uid] = db.sleep[uid] || [];
    const date = (datetime || '').split('T')[0] || '';
    const rec: SleepRecord = { id: String(nextRecId++), date, datetime, hours } as any;
    db.sleep[uid].push(rec);
    return rec;
  },
  async getLastSleepHours(token) {
    await delay(100);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    const recs = db.sleep[uid] || [];
    if (!recs.length) return 0;
    const last = recs[recs.length - 1];
    return last.hours;
  },

  async getAllSleep(token) {
    await delay(100);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    return (db.sleep[uid] || []).slice();
  },

  async updateSleep(token, id, datetime, hours) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.sleep[uid] = db.sleep[uid] || [];
    const idx = db.sleep[uid].findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Sleep record not found (mock)');
    const date = (datetime || '').split('T')[0] || '';
    db.sleep[uid][idx] = { id, date, datetime, hours } as any;
  },

  async deleteSleep(token, id) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.sleep[uid] = (db.sleep[uid] || []).filter((r) => r.id !== id);
  },

  async isSleepEnough(token, minHours) {
    const last = await this.getLastSleepHours(token);
    return last >= minHours;
  },

  async addActivity(token, datetime, minutes, intensity) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.activity[uid] = db.activity[uid] || [];
    const date = (datetime || '').split('T')[0] || '';
    const rec: ActivityRecord = { id: String(nextRecId++), date, datetime, minutes, intensity } as any;
    db.activity[uid].push(rec);
    return rec;
  },

  async getAllActivity(token) {
    await delay(120);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    return (db.activity[uid] || []).slice();
  },

  async updateActivity(token, id, datetime, minutes, intensity) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.activity[uid] = db.activity[uid] || [];
    const idx = db.activity[uid].findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Activity record not found (mock)');
    const date = (datetime || '').split('T')[0] || '';
    db.activity[uid][idx] = { id, date, datetime, minutes, intensity } as any;
  },

  async deleteActivity(token, id) {
    await delay(80);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.activity[uid] = (db.activity[uid] || []).filter((r) => r.id !== id);
  },

  async sortActivityByDuration(token) {
    await delay(60);
    const uid = userIdFromToken(token);
    if (!uid) throw new Error('Invalid token (mock)');
    db.activity[uid] = (db.activity[uid] || []).sort((a, b) => b.minutes - a.minutes);
  },
  async getCustomCategories(token?) {
    await delay(80);
    return db.customCategories ? db.customCategories.slice() : [];
  },
  async getCustomData(categoryName, token?) {
    await delay(100);
    const list = (db.customData && db.customData[categoryName]) || [];
    return list.slice();
  },
  async createCustomCategory(categoryName, token?) {
    await delay(80);
    db.customCategories = db.customCategories || [];
    if (!db.customCategories.includes(categoryName)) db.customCategories.push(categoryName);
    db.customData = db.customData || {};
    db.customData[categoryName] = db.customData[categoryName] || [];
  },
  async addCustomItem(token, categoryName, datetime, note) {
    await delay(80);
    db.customData = db.customData || {};
    db.customData[categoryName] = db.customData[categoryName] || [];
    const item: CustomItem = { id: String(nextRecId++), datetime, note };
    db.customData[categoryName].push(item);
    return item;
  },
  async updateCustomItem(token, categoryName, itemId, datetime, note) {
    await delay(80);
    db.customData = db.customData || {};
    db.customData[categoryName] = db.customData[categoryName] || [];
    const idx = db.customData[categoryName].findIndex((it) => it.id === itemId);
    if (idx === -1) throw new Error('Custom item not found (mock)');
    db.customData[categoryName][idx] = { id: itemId, datetime, note };
  },
  async deleteCustomItem(token, categoryName, itemId) {
    await delay(80);
    db.customData = db.customData || {};
    db.customData[categoryName] = (db.customData[categoryName] || []).filter((it) => it.id !== itemId);
  },
};

export default mockApiClient;
