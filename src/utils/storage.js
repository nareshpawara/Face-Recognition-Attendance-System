/**
 * Utility for handling IndexedDB operations
 */

const DB_NAME = 'AttendanceSystemDB';
const DB_VERSION = 1;
const STORES = {
  USERS: 'users',
  LOGS: 'logs'
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        db.createObjectStore(STORES.USERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.LOGS)) {
        db.createObjectStore(STORES.LOGS, { keyPath: 'timestamp' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storage = {
  // Save user data
  saveUser: async (user) => {
    const db = await openDB();
    const tx = db.transaction(STORES.USERS, 'readwrite');
    const store = tx.objectStore(STORES.USERS);
    await store.put(user);
    return new Promise((resolve) => tx.oncomplete = resolve);
  },

  // Get all registered users
  getUsers: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.USERS, 'readonly');
    const store = tx.objectStore(STORES.USERS);
    const request = store.getAll();
    return new Promise((resolve) => request.onsuccess = () => resolve(request.result));
  },

  // Delete a user
  deleteUser: async (userId) => {
    const db = await openDB();
    const tx = db.transaction(STORES.USERS, 'readwrite');
    const store = tx.objectStore(STORES.USERS);
    await store.delete(userId);
    return new Promise((resolve) => tx.oncomplete = resolve);
  },

  // Save attendance record
  saveAttendance: async (log) => {
    const db = await openDB();
    const tx = db.transaction(STORES.LOGS, 'readwrite');
    const store = tx.objectStore(STORES.LOGS);
    const entry = {
      ...log,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    await store.add(entry);
    return new Promise((resolve) => tx.oncomplete = resolve);
  },

  // Get all attendance logs
  getAttendanceLogs: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.LOGS, 'readonly');
    const store = tx.objectStore(STORES.LOGS);
    const request = store.getAll();
    return new Promise((resolve) => request.onsuccess = () => resolve(request.result));
  },

  // Clear all logs
  clearLogs: async () => {
    const db = await openDB();
    const tx = db.transaction(STORES.LOGS, 'readwrite');
    const store = tx.objectStore(STORES.LOGS);
    await store.clear();
    return new Promise((resolve) => tx.oncomplete = resolve);
  },

  // Check if attendance already marked today
  isAlreadyMarked: async (userId) => {
    const logs = await storage.getAttendanceLogs();
    const today = new Date().toLocaleDateString();
    return logs.some(log => log.userId === userId && log.date === today);
  }
};
