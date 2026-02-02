
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  PlusCircle, 
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Mail,
  Loader2
} from 'lucide-react';
import { 
  INITIAL_STAFF_BALANCES, 
  INITIAL_REQUESTS, 
  OTL_DIRECTOR_EMAIL, 
  FINANCE_EMAIL, 
  OTL_ASSISTANT_EMAIL, 
  SUPERVISOR_EMAILS 
} from './constants';
import { PLRequest, StaffBalance, ApprovalStatus, UserSession } from './types';
import RequestForm from './components/RequestForm';
import Dashboard from './components/Dashboard';
import ApprovalPage from './components/ApprovalPage';
import Login from './components/Login';

const App: React.FC = () => {
  const STORAGE_KEY_REQS = 'aisc_otl_requests_gmail_v1';
  const STORAGE_KEY_BALANCES = 'aisc_otl_balances_gmail_v1';
  const STORAGE_KEY_USER = 'aisc_otl_user_session_gmail';

  // API base URL - now uses Netlify Functions
  const API_BASE = '/api';

  const [requests, setRequests] = useState<PLRequest[]>(INITIAL_REQUESTS);
  const [balances, setBalances] = useState<StaffBalance[]>(INITIAL_STAFF_BALANCES);

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [isSendingMail, setIsSendingMail] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const [requestsRes, balancesRes] = await Promise.all([
        fetch(`${API_BASE}/requests`),
        fetch(`${API_BASE}/balances`)
      ]);
      
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
        localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(requestsData));
      }
      
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json();
        setBalances(balancesData);
        localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(balancesData));
        console.log('✅ Balances synced from Google Sheets:', balancesData);
      }
    } catch (error) {
      console.error('Failed to fetch data from API:', error);
      // Fallback to localStorage if API fails
      const savedRequests = localStorage.getItem(STORAGE_KEY_REQS);
      const savedBalances = localStorage.getItem(STORAGE_KEY_BALANCES);
      if (savedRequests) setRequests(JSON.parse(savedRequests));
      if (savedBalances) setBalances(JSON.parse(savedBalances));
    }
  };

  // Refresh function to sync data from API
  const refreshData = () => {
    fetchData();
  };

  // Refresh balances specifically from Google Sheets
  const refreshBalances = async () => {
    try {
      const response = await fetch(`${API_BASE}/balances`);
      if (response.ok) {
        const data = await response.json();
        setBalances(data);
        localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(data));
        console.log('✅ Balances refreshed from Google Sheets:', data);
      } else {
        throw new Error('Failed to refresh balances');
      }
    } catch (error) {
      console.error('Error refreshing balances:', error);
      throw error;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(balances));
  }, [balances]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  const handleLogin = (userData: { email: string; name: string; accessToken: string }) => {
    const email = userData.email.toLowerCase().trim();
    let role: UserSession['role'] = 'STAFF';
    
    if (email === OTL_DIRECTOR_EMAIL.toLowerCase().trim()) role = 'DIRECTOR';
    else if (email === FINANCE_EMAIL.toLowerCase().trim() || email === OTL_ASSISTANT_EMAIL.toLowerCase().trim()) role = 'FINANCE';
    else if (SUPERVISOR_EMAILS.some(e => e.toLowerCase().trim() === email)) role = 'SUPERVISOR';

    setCurrentUser({ email, name: userData.name, role, accessToken: userData.accessToken });
  };

  /**
   * Encodes a message to Base64URL for the Gmail API
   */
  const encodeEmail = (to: string, subject: string, message: string) => {
    const appUrl = window.location.origin + window.location.pathname;
    const str = [
      `Content-Type: text/plain; charset="UTF-8"\n`,
      `MIME-Version: 1.0\n`,
      `Content-Transfer-Encoding: 7bit\n`,
      `to: ${to}\n`,
      `subject: ${subject}\n\n`,
      `${message}\n\n`,
      `Access the OTL Portal: ${appUrl}`
    ].join('');

    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  /**
   * Sends an email silently using the Gmail REST API
   */
  const sendEmailViaGmailAPI = async (to: string, subject: string, body: string) => {
    console.log("🔍 Email Debug - Attempting to send to:", to);
    console.log("🔍 Email Debug - Current user:", currentUser?.email);
    console.log("🔍 Email Debug - Has access token:", !!currentUser?.accessToken);
    
    if (!currentUser?.accessToken) {
      console.warn("❌ Cannot send email: No access token available.");
      // Show user-friendly error with setup instructions
      alert("⚠️ Gmail access token missing!\n\nPlease:\n1. Click 'Update Connection Settings'\n2. Enter your Google OAuth Client ID\n3. Re-login with Gmail\n\nCheck GMAIL_SETUP.md for detailed instructions.");
      return;
    }

    setIsSendingMail(true);
    try {
      const raw = encodeEmail(to, subject, body);
      console.log("🔍 Email Debug - Sending to Gmail API...");
      
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gmail API Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }
      console.log(`✅ Email successfully sent to ${to}`);
    } catch (err) {
      console.error("❌ Failed to send automated email:", err);
      alert(`❌ Email failed: ${err.message}\n\nPlease check your Gmail OAuth setup.`);
    } finally {
      setIsSendingMail(false);
    }
  };

  const addRequest = async (newRequest: PLRequest) => {
    // Save to API first
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRequest)
      });
      
      if (response.ok) {
        const savedRequest = await response.json();
        const updatedRequests = [savedRequest, ...requests];
        setRequests(updatedRequests);
        localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(updatedRequests));
      } else {
        throw new Error('Failed to save request to API');
      }
    } catch (error) {
      console.error('Failed to save to API, using localStorage only:', error);
      // Fallback to localStorage only
      const updatedRequests = [newRequest, ...requests];
      setRequests(updatedRequests);
      localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(updatedRequests));
    }
    
    // Auto-Notify Supervisor
    await sendEmailViaGmailAPI(
      newRequest.supervisorEmail, 
      `[ACTION REQUIRED] New PL Request: ${newRequest.staffName}`, 
      `Dear Supervisor,\n\n${newRequest.staffName} has submitted a new Professional Learning request for "${newRequest.activityTitle}".\n\nPlease review and provide authorization via the OTL Portal.`
    );

    alert("Request submitted! An automated notification has been sent to your supervisor.");
  };

  const updateRequest = async (updatedRequest: PLRequest) => {
    // Save to API first
    try {
      const response = await fetch(`${API_BASE}/requests/${updatedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRequest)
      });
      
      if (response.ok) {
        const savedRequest = await response.json();
        const newRequests = requests.map(req => req.id === savedRequest.id ? savedRequest : req);
        setRequests(newRequests);
        localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(newRequests));
      } else {
        throw new Error('Failed to update request in API');
      }
    } catch (error) {
      console.error('Failed to update API, using localStorage only:', error);
      // Fallback to localStorage only
      const newRequests = requests.map(req => req.id === updatedRequest.id ? updatedRequest : req);
      setRequests(newRequests);
      localStorage.setItem(STORAGE_KEY_REQS, JSON.stringify(newRequests));
    }

    // Context-Aware Notifications
    if (updatedRequest.status === ApprovalStatus.SUPERVISOR_APPROVED) {
      // Stage 1 Done -> Notify Director
      await sendEmailViaGmailAPI(
        OTL_DIRECTOR_EMAIL,
        `[FINAL REVIEW] PL Request Approved by Supervisor: ${updatedRequest.staffName}`,
        `The supervisor has authorized ${updatedRequest.staffName}'s request for "${updatedRequest.activityTitle}".\n\nFinal review is now pending your decision.`
      );
    } else if (updatedRequest.status === ApprovalStatus.FULLY_APPROVED) {
      // Stage 2 Done -> Notify Faculty & Finance
      await sendEmailViaGmailAPI(
        updatedRequest.staffEmail,
        `[SUCCESS] PL Request Fully Authorized!`,
        `Congratulations ${updatedRequest.staffName},\n\nYour request for "${updatedRequest.activityTitle}" has been fully authorized by the OTL Director.\n\nYou may proceed with the next steps as per school policy.`
      );
      // Notify Finance
      await sendEmailViaGmailAPI(
        FINANCE_EMAIL,
        `[RECORD] New Approved PL Activity: ${updatedRequest.staffName}`,
        `Professional Learning Activity "${updatedRequest.activityTitle}" for ${updatedRequest.staffName} has received final authorization.`
      );
    } else if (updatedRequest.status === ApprovalStatus.REJECTED) {
      // Rejected -> Notify Faculty
      await sendEmailViaGmailAPI(
        updatedRequest.staffEmail,
        `[UPDATE] PL Request Decision: Declined`,
        `Dear ${updatedRequest.staffName},\n\nYour request for "${updatedRequest.activityTitle}" has been reviewed and declined.\n\nComments: ${updatedRequest.supervisorComments || updatedRequest.otlDirectorComments || 'No comments provided.'}`
      );
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        {isSendingMail && (
          <div className="fixed top-20 right-8 z-[200] bg-white border border-indigo-100 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-right-4">
            <Loader2 className="animate-spin text-indigo-600" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Syncing Gmail...</span>
          </div>
        )}

        <nav className="bg-[#4338ca] text-white shadow-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-lg font-black tracking-tight uppercase">AISC OTL Portal</span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/" className="text-xs font-black uppercase tracking-widest hover:bg-white/10 px-4 py-2 rounded-xl transition flex items-center gap-2">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <div className="h-8 w-px bg-white/10 mx-2"></div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest">{currentUser.name}</span>
                  <span className="text-[9px] font-bold text-indigo-200 uppercase">{currentUser.role}</span>
                </div>
                <button onClick={() => setCurrentUser(null)} className="p-2 hover:bg-rose-500/20 rounded-xl transition group">
                  <LogOut size={18} className="group-hover:text-rose-400" />
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard requests={requests} currentUser={currentUser} onReset={() => { localStorage.clear(); window.location.reload(); }} onRefresh={refreshData} onRefreshBalances={refreshBalances} />} />
            <Route path="/new-request" element={<RequestForm balances={balances} onSubmit={addRequest} currentUser={currentUser} />} />
            <Route path="/approve/:requestId" element={<ApprovalPage requests={requests} balances={balances} onUpdate={updateRequest} currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 px-8 flex justify-between items-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© AISC Office of Teaching & Learning</p>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GMAIL API v1 ACTIVE</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
