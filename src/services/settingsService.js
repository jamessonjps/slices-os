import { createId, database, matchesFilter, removeById } from '@/data/database';

export const settingsService = {
  listSettings: async () => {
    return [...database.settings];
  },
  getSetting: async (key) => {
    return database.settings.find((item) => item.key === key) || null;
  },
  filterSettings: async (filter = {}) => {
    return database.settings.filter((item) => matchesFilter(item, filter));
  },
  saveSetting: async (key, value) => {
    let existing = database.settings.find((item) => item.key === key);
    if (existing) {
      existing.value = value;
      return existing;
    }

    const newSetting = {
      id: createId('setting'),
      key,
      value
    };
    database.settings.push(newSetting);
    return newSetting;
  },
  updateSetting: async (id, data) => {
    const setting = database.settings.find((item) => item.id === id);
    if (!setting) return null;
    Object.assign(setting, data);
    return setting;
  },
  createSetting: async (data) => {
    return settingsService.saveSetting(data.key, data.value);
  },
  deleteSetting: async (id) => {
    return removeById(database.settings, id);
  }
};
