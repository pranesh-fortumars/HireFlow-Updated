"use client";

import { useState, useEffect } from 'react';
import { Application, User } from './types';
import { db } from './firebase';
import { notificationsCollection, auditLogsCollection, candidatesCollection, usersCollection, getCounterDoc } from './firestore-schema';
import { NotificationMsg, AuditLog } from './types';
import { onSnapshot, setDoc, doc, updateDoc, deleteDoc, runTransaction, query, orderBy } from 'firebase/firestore';
const INITIAL_INTERVIEWERS: User[] = [
  { id: '1', name: 'John Smith', email: 'interviewer@company.com', role: 'INTERVIEWER' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'INTERVIEWER' },
  { id: '3', name: 'David Wilson', email: 'david@company.com', role: 'INTERVIEWER' }
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    candidateName: 'Alice Thompson',
    email: 'alice@example.com',
    phone: '555-0101',
    position: 'Senior Frontend Engineer',
    experience: '6 years',
    skills: ['React', 'Next.js', 'TypeScript'],
    resumeUrl: 'https://example.com/resume1.pdf',
    notes: 'Strong portfolio in SaaS.',
    status: 'Scheduled',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    assignedInterviewerId: '1',
    interviewDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    interviewTime: '10:00',
    interviewMode: 'ONLINE'
  },
  {
    id: 'app-2',
    candidateName: 'Bob Rogers',
    email: 'bob@example.com',
    phone: '555-0102',
    position: 'Product Designer',
    experience: '4 years',
    skills: ['Figma', 'UI/UX', 'Design Systems'],
    resumeUrl: 'https://example.com/resume2.pdf',
    notes: 'Ex-Google designer.',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    assignedInterviewerId: '2',
    interviewDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    interviewTime: '14:30',
    interviewMode: 'ONLINE',
    feedback: {
      technicalRating: 9,
      communicationRating: 8,
      problemSolvingRating: 8,
      recommendation: 'SELECTED',
      comments: 'Excellent visual skills and great personality.',
      submittedAt: new Date(Date.now() - 86400000).toISOString()
    }
  }
];

// Set this to false when you are ready to use real Firestore data
const MOCK_MODE = true;

export function useHireFlowStore() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviewers, setInterviewers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (MOCK_MODE) {
      setApplications(INITIAL_APPLICATIONS);
      setAllUsers(INITIAL_INTERVIEWERS);
      setInterviewers(INITIAL_INTERVIEWERS);
      setNotifications([]);
      setAuditLogs([]);
      setIsInitialized(true);
      return;
    }

    const unsubApps = onSnapshot(query(candidatesCollection, orderBy('createdAt', 'desc')), 
      (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Application));
        if (appsData.length === 0) {
          setApplications(INITIAL_APPLICATIONS);
        } else {
          setApplications(appsData);
        }
      },
      (error) => {
        console.warn("Firestore access denied for Candidates. Falling back to mock data. Please update Firebase Security Rules to test mode.");
        setApplications(INITIAL_APPLICATIONS);
      }
    );

    const unsubUsers = onSnapshot(usersCollection, 
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
        if (usersData.length === 0) {
          setAllUsers(INITIAL_INTERVIEWERS);
          setInterviewers(INITIAL_INTERVIEWERS);
        } else {
          setAllUsers(usersData);
          setInterviewers(usersData.filter(u => u.role === 'INTERVIEWER'));
        }
      },
      (error) => {
        console.warn("Firestore access denied for Users. Falling back to mock data.");
        setAllUsers(INITIAL_INTERVIEWERS);
        setInterviewers(INITIAL_INTERVIEWERS);
      }
    );

    const unsubNotifs = onSnapshot(query(notificationsCollection, orderBy('timestamp', 'desc')), 
      (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as NotificationMsg)));
      },
      (error) => {
        console.warn("Firestore access denied for Notifications.");
        setNotifications([]);
      }
    );

    const unsubAudit = onSnapshot(query(auditLogsCollection, orderBy('date', 'desc'), orderBy('time', 'desc')), 
      (snapshot) => {
        setAuditLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditLog)));
        setIsInitialized(true);
      },
      (error) => {
        console.warn("Firestore access denied for Audit Logs.");
        setAuditLogs([]);
        setIsInitialized(true);
      }
    );

    return () => {
      unsubApps();
      unsubUsers();
      unsubNotifs();
      unsubAudit();
    };
  }, []);

  const addAuditLog = async (log: Omit<AuditLog, 'id'>) => {
    const newDocRef = doc(auditLogsCollection);
    await setDoc(newDocRef, { ...log, id: newDocRef.id });
  };

  const addNotification = async (notif: Omit<NotificationMsg, 'id' | 'read'>) => {
    const newDocRef = doc(notificationsCollection);
    await setDoc(newDocRef, { ...notif, read: false, id: newDocRef.id });
  };

  const markNotificationRead = async (id: string) => {
    await updateDoc(doc(notificationsCollection, id), { read: true });
  };

  const addApplication = async (app: Omit<Application, 'id' | 'createdAt' | 'status' | 'referenceNumber'>, currentUser?: User) => {
    const counterRef = getCounterDoc();
    const newDocRef = doc(candidatesCollection);
    const newAppId = newDocRef.id;

    try {
      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let nextValue = 1;
        if (counterDoc.exists()) {
          nextValue = (counterDoc.data().count || 0) + 1;
        }
        
        const currentYear = new Date().getFullYear();
        const paddedCount = nextValue.toString().padStart(6, '0');
        const referenceNumber = `CAN-${currentYear}-${paddedCount}`;

        const newApp: Partial<Application> = {
          ...app,
          referenceNumber,
          createdAt: new Date().toISOString(),
          status: 'Pending',
        };

        transaction.set(counterRef, { count: nextValue });
        transaction.set(newDocRef, newApp);
      });
      
      if (currentUser) {
        await addAuditLog({
          action: 'Created Candidate Profile',
          user: currentUser.name,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0],
          entityType: 'Candidate',
          entityId: newAppId
        });
      }

      return newAppId;
    } catch (e) {
      console.error("Transaction failed: ", e);
      throw e;
    }
  };

  const updateApplication = async (id: string, updates: Partial<Application>, currentUser?: User) => {
    try {
      const docRef = doc(candidatesCollection, id);
      await updateDoc(docRef, updates);

      if (currentUser && updates.status) {
        await addAuditLog({
          action: `Changed Status to ${updates.status}`,
          user: currentUser.name,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0],
          entityType: 'Candidate',
          entityId: id
        });
      }
    } catch (e) {
      console.error("Error updating application: ", e);
    }
  };

  const deleteApplication = async (id: string, currentUser?: User) => {
    try {
      const docRef = doc(candidatesCollection, id);
      await deleteDoc(docRef);

      if (currentUser) {
        await addAuditLog({
          action: `Deleted Candidate`,
          user: currentUser.name,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0],
          entityType: 'Candidate',
          entityId: id
        });
      }
    } catch (e) {
      console.error("Error deleting application: ", e);
    }
  };

  const scheduleInterview = async (id: string, scheduling: Pick<Application, 'assignedInterviewerId' | 'interviewDate' | 'interviewTime' | 'interviewMode' | 'googleMeetLink'>, currentUser?: User) => {
    await updateApplication(id, {
      ...scheduling,
      status: 'Scheduled'
    }, currentUser);

    if (scheduling.assignedInterviewerId) {
      await addNotification({
        userId: scheduling.assignedInterviewerId,
        message: `You have been scheduled for a new interview on ${scheduling.interviewDate} at ${scheduling.interviewTime}.`,
        timestamp: new Date().toISOString()
      });
    }
  };

  const submitFeedback = async (id: string, feedback: Application['feedback'], currentUser?: User) => {
    await updateApplication(id, {
      feedback,
      status: feedback?.recommendation === 'SELECTED' ? 'Selected 1st Round' : feedback?.recommendation === 'REJECTED' ? 'Rejected' : 'Hold'
    }, currentUser);
  };

  return {
    applications,
    interviewers,
    allUsers,
    notifications,
    auditLogs,
    addApplication,
    updateApplication,
    deleteApplication,
    scheduleInterview,
    submitFeedback,
    addNotification,
    markNotificationRead,
    isInitialized
  };
}
