import { createId, database, matchesFilter, removeById, sortRecords } from '@/data/database';

export const staffService = {
  listProfiles: async (sortString = 'name') => {
    return sortRecords(database.staffProfiles, sortString);
  },
  filterProfiles: async (filter = {}) => {
    return database.staffProfiles.filter((profile) => matchesFilter(profile, filter));
  },
  createProfile: async (data) => {
    const profile = {
      id: createId('staff'),
      system_role: 'user',
      ...data
    };
    database.staffProfiles.unshift(profile);
    if (!database.users.some((user) => user.email === profile.user_email)) {
      database.users.push({
        id: createId('user'),
        name: profile.name,
        full_name: profile.name,
        email: profile.user_email,
        role: profile.system_role
      });
    }
    return profile;
  },
  updateProfile: async (id, data) => {
    const profile = database.staffProfiles.find((item) => item.id === id);
    if (!profile) return null;
    Object.assign(profile, data);

    const user = database.users.find((item) => item.email === profile.user_email);
    if (user) {
      user.name = profile.name;
      user.full_name = profile.name;
      user.role = profile.system_role;
    }

    return profile;
  },
  deleteProfile: async (id) => {
    const profile = removeById(database.staffProfiles, id);
    if (profile) {
      const user = database.users.find((item) => item.email === profile.user_email);
      if (user) removeById(database.users, user.id);
    }
    return profile;
  },
  listUsers: async () => {
    return [...database.users];
  },
  inviteUser: async (email, role = 'user') => {
    let user = database.users.find((item) => item.email === email);
    if (!user) {
      user = {
        id: createId('user'),
        name: email,
        full_name: email,
        email,
        role
      };
      database.users.push(user);
    }
    return user;
  }
};
