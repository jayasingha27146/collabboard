export const storageKeys = {
  authToken: "sgp.auth.token",
  authUser: "sgp.auth.user",
  userPreferences: "sgp.user.preferences",
  recentGroupId: "sgp.groups.recent",
  taskDraft: "sgp.tasks.draft",
};

export function safeRead(key, fallback = null) {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null) {
      return fallback;
    }
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

export function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota and privacy errors in local persistence.
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}
