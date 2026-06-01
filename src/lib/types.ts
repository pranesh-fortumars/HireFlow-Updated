export type UserRole = 'ADMIN' | 'HR' | 'INTERVIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive?: boolean;
}

export type ApplicationStatus = 
  | 'Pending' | 'Scheduled' | 'Appeared' | 'Cancelled' | 'No Response'
  | 'Attended 1st Round' | 'Selected 1st Round' | 'Rejected 1st Round' | 'Waiting For 1st Round Result'
  | 'Scheduled 2nd Round' | 'Attended 2nd Round' | 'Selected 2nd Round' | 'Rejected 2nd Round' | 'Waiting For 2nd Round Result'
  | 'HR Discussion' | 'Document Verification' | 'Background Verification'
  | 'Offer Released' | 'Joined' | 'Rejected' | 'Hold'
  | 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'SELECTED' | 'REJECTED' | 'HOLD'; // keeping legacy ones for safety

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface DocumentVerification {
  aadhar: VerificationStatus;
  education: VerificationStatus;
  employment: VerificationStatus;
  identity: VerificationStatus;
}

export interface CandidateDocuments {
  resumeUrl?: string;
  aadharUrl?: string;
  passportPhotoUrl?: string;
  panCardUrl?: string;
  experienceCertUrl?: string;
  educationCertUrl?: string;
  otherDocsUrl?: string;
}

export interface Application {
  id: string;
  referenceNumber?: string; // CAN-2026-XXXXXX
  candidateName: string;
  dob?: string;
  gender?: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  whatsappSameAsPhone?: boolean;
  
  // Job Details
  position: string;
  experience: string;
  currentCTC?: string;
  expectedCTC?: string;
  noticePeriod?: string;
  currentEmployer?: string;
  source?: string;
  sourceDetails?: string;

  // Education Details
  qualification?: string;
  specialization?: string;
  college?: string;

  // Additional Details
  skills: string[];
  languagesKnown?: string;
  currentLocation?: string;
  notes: string;
  
  // Documents
  documents?: CandidateDocuments;
  resumeUrl: string; // Legacy

  status: ApplicationStatus;
  createdAt: string;
  
  // Interview details
  assignedInterviewerId?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewMode?: 'ONLINE' | 'OFFLINE';
  googleMeetLink?: string;
  
  feedback?: InterviewFeedback;
  verification?: DocumentVerification;
}

export interface InterviewFeedback {
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  domainKnowledgeRating?: number; // New
  recommendation: 'SELECTED' | 'HOLD' | 'REJECTED';
  comments: string;
  submittedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  date: string;
  time: string;
  entityType: string;
  entityId: string;
}

export interface NotificationMsg {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: string;
}
