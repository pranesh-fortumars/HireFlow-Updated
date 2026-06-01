import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHvYE6nPZZ3HOddfdyBmJUU7y8PscbFw4",
  authDomain: "studio-5255428477-c7c74.firebaseapp.com",
  projectId: "studio-5255428477-c7c74",
  storageBucket: "studio-5255428477-c7c74.firebasestorage.app",
  messagingSenderId: "293281064463",
  appId: "1:293281064463:web:17988811857b84fa46657a"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const INITIAL_INTERVIEWERS = [
  { id: '1', name: 'John Smith', email: 'interviewer@company.com', role: 'INTERVIEWER' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'INTERVIEWER' },
  { id: '3', name: 'David Wilson', email: 'david@company.com', role: 'INTERVIEWER' }
];

const INITIAL_APPLICATIONS = [
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
    status: 'Pending',
    createdAt: new Date().toISOString(),
    referenceNumber: 'CAN-2024-000001'
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
    referenceNumber: 'CAN-2024-000002',
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

async function seedDatabase() {
  console.log("Starting Firebase seeding process...");

  try {
    // Seed Users
    console.log("Seeding Users Collection...");
    for (const user of INITIAL_INTERVIEWERS) {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, user);
      console.log(`  Created User: ${user.name}`);
    }

    // Seed Candidates
    console.log("Seeding Candidates Collection...");
    for (const app of INITIAL_APPLICATIONS) {
      const appRef = doc(db, 'candidates', app.id);
      await setDoc(appRef, app);
      console.log(`  Created Candidate: ${app.candidateName}`);
    }

    // Initialize Counters
    console.log("Initializing Counters Collection...");
    const counterRef = doc(db, 'counters', 'applications');
    await setDoc(counterRef, { count: 2 });
    console.log("  Counter set to 2");

    console.log("\n✅ Database seeding complete! All collections created.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ SEEDING FAILED! Error details:");
    console.error(error);
    console.log("\nIf you are seeing an INTERNAL ASSERTION FAILED error, it means you have not clicked 'Create Database' in the Firebase Console's Firestore section yet!");
    process.exit(1);
  }
}

seedDatabase();
