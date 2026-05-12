import { fakeSettings } from '@/mocks/fakeSettings';

const settings = [...fakeSettings];

export const settingsService = {
  listSettings: async () => {
    return [...settings];
  },
  getSetting: async (key) => {
    return settings.find((item) => item.key === key) || null;
  },
  saveSetting: async (key, value) => {
    let existing = settings.find((item) => item.key === key);
    if (existing) {
      existing.value = value;
      return existing;
    }

    const newSetting = {
      id: `setting-${Date.now()}`,
      key,
      value
    };
    settings.push(newSetting);
    return newSetting;
  }
};
