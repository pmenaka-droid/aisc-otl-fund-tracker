
import { StaffBalance, PLRequest, ApprovalStatus } from './types';

export const INITIAL_STAFF_BALANCES: StaffBalance[] = [
  { email: 'pmenaka@aischennai.org', name: 'Menaka P', department: 'OTL', remainingBalance: 1500.00 },
  { email: 'mstestteacher@aischennai.org', name: 'MS Test Teacher', department: 'Middle School', remainingBalance: 1500.00 },
  { email: 'john.doe@aischennai.org', name: 'John Doe', department: 'Mathematics', remainingBalance: 1200.00 },
  { email: 'jane.smith@aischennai.org', name: 'Jane Smith', department: 'Science', remainingBalance: 850.50 },
  { email: 'alice.jones@aischennai.org', name: 'Alice Jones', department: 'English', remainingBalance: 400.00 },
];

export const INITIAL_REQUESTS: PLRequest[] = [
  {
    id: 'REQ-1001',
    staffEmail: 'jane.smith@aischennai.org',
    staffName: 'Jane Smith',
    facultyRole: 'Teacher',
    schoolSection: ['MS', 'HS'],
    activityTitle: 'International Science Conference 2024',
    description: 'A 3-day conference focused on modern laboratory safety and innovative teaching methods.',
    websiteLink: 'https://scienceconf2024.org',
    provider: 'Science Teachers Association',
    isOnline: 'No, in-person only',
    discussedWithSupervisor: true,
    startDate: '2024-05-10',
    endDate: '2024-05-13',
    totalDays: 4,
    location: 'Singapore',
    submissionDate: '2024-03-15',
    status: ApprovalStatus.PENDING,
    supervisorEmail: 'mstestteacher@aischennai.org',
    registrationFee: 500,
    travelCost: 300,
    accommodationCost: 200,
    visaCost: 50,
    otherCost: 0,
    totalCost: 1050
  }
];

export const OTL_DIRECTOR_EMAIL = 'bjoel@aischennai.org';

export const SUPERVISOR_EMAILS = [
  'mstestteacher@aischennai.org',
  'bjoel@aischennai.org',
  'cgreg@aischennai.org',
  'slynn@aischennai.org',
  'bkelsey@aischennai.org',
  'mjustyna@aischennai.org',
  'pmaria@aischennai.org',
  'agemma@aischennai.org',
  'gchristopher@aischennai.org',
  'kriedwaan@aischennai.org'
];

export const FINANCE_EMAIL = 'finance@aischennai.org';
export const OTL_ASSISTANT_EMAIL = 'assistant.otl@aischennai.org';

export const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScucRB2XOsP8op7PNMNVGbRL3pwnPXJNtvjgSLQc0ZRDBT_xQ/viewform';
export const PD_BALANCE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1nTJ_PYMOE7oB-yWG1D0lfMTkrArb_-pNxtxA6TF1YUI/edit?gid=1113360116#gid=1113360116';
