export type Credentials = { username: string; password: string };

export type User = {
  id: string;
  username: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
};

export type AuthResponse = { token: string; user: User };

export type WaterRecord = { id: string; date: string; datetime?: string; amountMl: number };
export type SleepRecord = { id: string; date: string; datetime?: string; hours: number };
export type ActivityRecord = { id: string; date: string; datetime?: string; minutes: number; intensity: string };
export type CustomItem = { id: string; datetime: string; note: string };

export interface ApiClient {
  // Auth
  login(creds: Credentials): Promise<AuthResponse>;
  register(data: { username: string; password: string; age?: number; weight?: number; height?: number; gender?: string }): Promise<AuthResponse>;
  getProfile(token: string): Promise<User>;

  // BMI
  getBMI(token: string): Promise<number>;

  // Water
  addWater(token: string, datetime: string, amountMl: number): Promise<WaterRecord>;
  getAllWater(token: string): Promise<WaterRecord[]>;
  updateWater?(token: string, id: string, datetime: string, amountMl: number): Promise<void>;
  deleteWater?(token: string, id: string): Promise<void>;
  getWeeklyAverageWater(token: string): Promise<number>;
  isWaterEnough(token: string, goalMl: number): Promise<boolean>;

  // Sleep
  addSleep(token: string, datetime: string, hours: number): Promise<SleepRecord>;
  getLastSleepHours(token: string): Promise<number>;
  getAllSleep?(token: string): Promise<SleepRecord[]>;
  updateSleep?(token: string, id: string, datetime: string, hours: number): Promise<void>;
  deleteSleep?(token: string, id: string): Promise<void>;
  isSleepEnough(token: string, minHours: number): Promise<boolean>;

  // Activity
  addActivity(token: string, datetime: string, minutes: number, intensity: string): Promise<ActivityRecord>;
  getAllActivity(token: string): Promise<ActivityRecord[]>;
  updateActivity?(token: string, id: string, datetime: string, minutes: number, intensity: string): Promise<void>;
  deleteActivity?(token: string, id: string): Promise<void>;
  sortActivityByDuration(token: string): Promise<void>;
  // Custom categories / data (optional)
  getCustomCategories?(token?: string): Promise<string[]>;
  getCustomData?(categoryName: string, token?: string): Promise<CustomItem[]>;
  createCustomCategory?(categoryName: string, token?: string): Promise<void>;
  addCustomItem?(token: string, categoryName: string, datetime: string, note: string): Promise<CustomItem>;
  updateCustomItem?(token: string, categoryName: string, itemId: string, datetime: string, note: string): Promise<void>;
  deleteCustomItem?(token: string, categoryName: string, itemId: string): Promise<void>;
}

export default null as unknown as ApiClient;
