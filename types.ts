
export enum ApprovalStatus {
  PENDING = 'PENDING',
  SUPERVISOR_APPROVED = 'SUPERVISOR_APPROVED',
  REJECTED = 'REJECTED',
  FULLY_APPROVED = 'FULLY_APPROVED'
}

export interface StaffBalance {
  email: string;
  name: string;
  department: string;
  remainingBalance: number;
}

export interface PLRequest {
  id: string;
  staffEmail: string;
  staffName: string;
  // Faculty Information
  facultyRole: string;
  schoolSection: string[];
  // PL Details
  activityTitle: string;
  description: string;
  websiteLink: string;
  provider: string;
  isOnline: string;
  discussedWithSupervisor: boolean;
  // Logistics
  startDate: string;
  endDate: string;
  totalDays: number;
  location: string;
  submissionDate: string;
  status: ApprovalStatus;
  supervisorEmail: string;
  supervisorComments?: string;
  otlDirectorComments?: string;
  // Budget Details
  registrationFee: number;
  travelCost: number;
  accommodationCost: number;
  visaCost: number;
  otherCost: number;
  totalCost: number;
}

export interface UserSession {
  email: string;
  role: 'STAFF' | 'SUPERVISOR' | 'DIRECTOR' | 'FINANCE';
  name: string;
  accessToken?: string; // Added for Gmail API
}

export interface Notification {
  id: string;
  sender: string;
  recipient: string;
  cc?: string[];
  subject: string;
  body: string;
  snippet: string;
  timestamp: string;
  timeLabel: string;
  link?: string;
  isRead: boolean;
  isStarred: boolean;
}
