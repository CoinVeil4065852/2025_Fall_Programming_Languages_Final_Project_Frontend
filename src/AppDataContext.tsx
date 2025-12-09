import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from './services';
import type { WaterRecord, SleepRecord, ActivityRecord, CustomItem, User } from './services/types';

type AppData = {
  profile: User | null;
  water: WaterRecord[];
  sleep: SleepRecord[];
  activity: ActivityRecord[];
  customCategories: string[];
  customData: Record<string, CustomItem[]>;
  loading: boolean;
  error?: string | null;

  // refreshers
  refreshAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWater: () => Promise<void>;
  refreshSleep: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshCustomCategories: () => Promise<void>;
  refreshCustomData: (category: string) => Promise<void>;

  // water ops
  addWater: (datetime: string, amountMl: number) => Promise<WaterRecord | void>;
  updateWater?: (id: string, datetime: string, amountMl: number) => Promise<void>;
  deleteWater?: (id: string) => Promise<void>;

  // sleep ops
  addSleep: (datetime: string, hours: number) => Promise<SleepRecord | void>;
  updateSleep?: (id: string, datetime: string, hours: number) => Promise<void>;
  deleteSleep?: (id: string) => Promise<void>;

  // activity ops
  addActivity: (datetime: string, minutes: number, intensity: string) => Promise<ActivityRecord | void>;
  updateActivity?: (id: string, datetime: string, minutes: number, intensity: string) => Promise<void>;
  deleteActivity?: (id: string) => Promise<void>;

  // custom
  createCustomCategory?: (categoryName: string) => Promise<void>;
  addCustomItem?: (categoryName: string, datetime: string, note: string) => Promise<CustomItem | void>;
  updateCustomItem?: (categoryName: string, itemId: string, datetime: string, note: string) => Promise<void>;
  deleteCustomItem?: (categoryName: string, itemId: string) => Promise<void>;
};

const AppDataContext = createContext<AppData | undefined>(undefined);

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [water, setWater] = useState<WaterRecord[]>([]);
  const [sleep, setSleep] = useState<SleepRecord[]>([]);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customData, setCustomData] = useState<Record<string, CustomItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = () => (localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '') as string;

  const { t } = useTranslation();

  const refreshProfile = async () => {
    try {
      const t = token();
      if (!t) return setProfile(null);
      const p = await api.getProfile(t);
      setProfile(p || null);
    } catch (e: any) {
      setError(e?.message ?? t('failed_load_profile'));
      setProfile(null);
    }
  };

  const refreshWater = async () => {
    try {
      const t = token();
      if (!t) return setWater([]);
      const recs = await api.getAllWater(t);
      setWater(recs || []);
    } catch (e: any) {
      setError(e?.message ?? t('failed_load_water'));
      setWater([]);
    }
  };

  const refreshSleep = async () => {
    try {
      const t = token();
      if (!t) return setSleep([]);
      const recs = (api.getAllSleep ? await api.getAllSleep(t) : []) as SleepRecord[];
      setSleep(recs || []);
    } catch (e: any) {
      setError(e?.message ?? t('failed_load_sleep'));
      setSleep([]);
    }
  };

  const refreshActivity = async () => {
    try {
      const t = token();
      if (!t) return setActivity([]);
      const recs = await api.getAllActivity(t);
      setActivity(recs || []);
    } catch (e: any) {
      setError(e?.message ?? t('failed_load_activity'));
      setActivity([]);
    }
  };

  const refreshCustomCategories = async () => {
    try {
      const t = token();
      if (!t) return setCustomCategories([]);
      if (!api.getCustomCategories) return setCustomCategories([]);
      const cats = await api.getCustomCategories(t);
      setCustomCategories(cats || []);
    } catch (e: any) {
      setError(e?.message ?? t('failed_load_categories'));
      setCustomCategories([]);
    }
  };

  const refreshCustomData = async (category: string) => {
    try {
      const t = token();
      if (!t) return;
      if (!api.getCustomData) return;
      const data = await api.getCustomData(category, t);
      setCustomData((prev) => ({ ...prev, [category]: data || [] }));
    } catch (e: any) {
      setError(e?.message ?? t('failed_load_custom_data'));
      setCustomData((prev) => ({ ...prev, [category]: [] }));
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([refreshProfile(), refreshWater(), refreshSleep(), refreshActivity(), refreshCustomCategories()]);
    setLoading(false);
  };

  // ops
  const addWater = async (datetime: string, amountMl: number) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      const created = await api.addWater(t, datetime, amountMl);
      await refreshWater();
      return created;
    } catch (e: any) {
      setError(e?.message ?? t('failed_add_water'));
    }
  };

  const updateWater = async (id: string, datetime: string, amountMl: number) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.updateWater) await api.updateWater(t, id, datetime, amountMl);
      await refreshWater();
    } catch (e: any) {
      setError(e?.message ?? t('failed_update_water'));
    }
  };

  const deleteWater = async (id: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.deleteWater) await api.deleteWater(t, id);
      await refreshWater();
    } catch (e: any) {
      setError(e?.message ?? t('failed_delete_water'));
    }
  };

  const addSleep = async (datetime: string, hours: number) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      const created = api.addSleep ? await api.addSleep(t, datetime, hours) : undefined;
      await refreshSleep();
      return created;
    } catch (e: any) {
      setError(e?.message ?? t('failed_add_sleep'));
    }
  };

  const updateSleep = async (id: string, datetime: string, hours: number) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.updateSleep) await api.updateSleep(t, id, datetime, hours);
      await refreshSleep();
    } catch (e: any) {
      setError(e?.message ?? t('failed_update_sleep'));
    }
  };

  const deleteSleep = async (id: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.deleteSleep) await api.deleteSleep(t, id);
      await refreshSleep();
    } catch (e: any) {
      setError(e?.message ?? t('failed_delete_sleep'));
    }
  };

  const addActivity = async (datetime: string, minutes: number, intensity: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      const created = await api.addActivity(t, datetime, minutes, intensity);
      await refreshActivity();
      return created;
    } catch (e: any) {
      setError(e?.message ?? t('failed_add_activity'));
    }
  };

  const updateActivity = async (id: string, datetime: string, minutes: number, intensity: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.updateActivity) await api.updateActivity(t, id, datetime, minutes, intensity);
      await refreshActivity();
    } catch (e: any) {
      setError(e?.message ?? t('failed_update_activity'));
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.deleteActivity) await api.deleteActivity(t, id);
      await refreshActivity();
    } catch (e: any) {
      setError(e?.message ?? t('failed_delete_activity'));
    }
  };

  const createCustomCategory = async (categoryName: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.createCustomCategory) await api.createCustomCategory(categoryName, t);
      await refreshCustomCategories();
    } catch (e: any) {
      setError(e?.message ?? t('failed_create_category'));
    }
  };

  const addCustomItem = async (categoryName: string, datetime: string, note: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.addCustomItem) await api.addCustomItem(t, categoryName, datetime, note);
      await refreshCustomData(categoryName);
    } catch (e: any) {
      setError(e?.message ?? t('failed_add_custom_item'));
    }
  };

  const updateCustomItem = async (categoryName: string, itemId: string, datetime: string, note: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.updateCustomItem) await api.updateCustomItem(t, categoryName, itemId, datetime, note);
      await refreshCustomData(categoryName);
    } catch (e: any) {
      setError(e?.message ?? t('failed_update_custom_item'));
    }
  };

  const deleteCustomItem = async (categoryName: string, itemId: string) => {
    try {
      const t = token();
      if (!t) throw new Error('Not authenticated');
      if (api.deleteCustomItem) await api.deleteCustomItem(t, categoryName, itemId);
      await refreshCustomData(categoryName);
    } catch (e: any) {
      setError(e?.message ?? t('failed_delete_custom_item'));
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        profile,
        water,
        sleep,
        activity,
        customCategories,
        customData,
        loading,
        error,
        refreshAll,
        refreshProfile,
        refreshWater,
        refreshSleep,
        refreshActivity,
        refreshCustomCategories,
        refreshCustomData,
        addWater,
        updateWater,
        deleteWater,
        addSleep,
        updateSleep,
        deleteSleep,
        addActivity,
        updateActivity,
        deleteActivity,
        createCustomCategory,
        addCustomItem,
        updateCustomItem,
        deleteCustomItem,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataContext;
