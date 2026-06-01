import { collection, doc } from 'firebase/firestore';
import { db } from './firebase';

export const COLLECTIONS = {
  USERS: 'users',
  CANDIDATES: 'candidates',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  SYSTEM: 'system' // For counters
};

export const usersCollection = collection(db, COLLECTIONS.USERS);
export const candidatesCollection = collection(db, COLLECTIONS.CANDIDATES);
export const auditLogsCollection = collection(db, COLLECTIONS.AUDIT_LOGS);
export const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);

export const getCounterDoc = () => doc(db, COLLECTIONS.SYSTEM, 'candidate_counter');
