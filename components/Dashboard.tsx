
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle,
  ChevronRight,
  UserCircle,
  ShieldCheck,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { PLRequest, ApprovalStatus, UserSession } from '../types';

interface Props {
  requests: PLRequest[];
  currentUser: UserSession | null;
  onReset: () => void;
  onRefresh?: () => void;
  onRefreshBalances?: () => void;
}

const Dashboard: React.FC<Props> = ({ requests, currentUser, onRefresh, onRefreshBalances }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Normalize current user email for robust matching
  const userEmail = currentUser?.email.toLowerCase().trim() || "";

  // Debug logging
  console.log('👤 Current user:', {
    email: currentUser?.email,
    role: currentUser?.role,
    normalizedEmail: userEmail
  });
  
  console.log('📋 All requests loaded:', requests.length);
  requests.forEach((req, index) => {
    console.log(`📄 Request ${index + 1}:`, {
      id: req.id,
      staffName: req.staffName,
      staffEmail: req.staffEmail,
      supervisorEmail: req.supervisorEmail,
      status: req.status
    });
  });

  // Auto-refresh for supervisors and directors every 30 seconds
  useEffect(() => {
    if (currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'DIRECTOR') {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastRefresh(new Date());
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefreshBalances = async () => {
    if (onRefreshBalances) {
      setIsRefreshingBalances(true);
      try {
        await onRefreshBalances();
        alert('✅ Balances refreshed from Google Sheets!');
      } catch (error) {
        alert('❌ Failed to refresh balances from Google Sheets.\n\nPlease check GOOGLE_SHEETS_SETUP.md for setup instructions.\n\nThe system will use fallback balance data.');
      } finally {
        setIsRefreshingBalances(false);
      }
    }
  };

  // 1. My Submissions (Requests the logged-in user created)
  const mySubmissions = requests.filter(req => req.staffEmail.toLowerCase().trim() === userEmail);

  // 2. Action Required (Requests where this user is the supervisor OR director and it is pending their stage)
  const actionRequired = requests.filter(req => {
    const isDesignatedSupervisor = req.supervisorEmail.toLowerCase().trim() === userEmail;
    const isDirector = currentUser?.role === 'DIRECTOR';
    
    // Debug logging
    console.log('🔍 Checking request:', {
      requestId: req.id,
      requestSupervisor: req.supervisorEmail.toLowerCase().trim(),
      currentUserEmail: userEmail.toLowerCase().trim(),
      isDesignatedSupervisor,
      isDirector,
      status: req.status
    });
    
    // Stage 1: Needs Supervisor approval
    if (req.status === ApprovalStatus.PENDING) {
      return isDesignatedSupervisor;
    }
    
    // Stage 2: Supervisor approved, needs Director
    if (req.status === ApprovalStatus.SUPERVISOR_APPROVED) {
      return isDirector;
    }
    
    return false;
  });

  // 3. Oversight (Full list for Finance/Director)
  const isAdmin = currentUser?.role === 'DIRECTOR' || currentUser?.role === 'FINANCE';
  const allRequests = isAdmin ? requests : [];

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.PENDING:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">Pending Supervisor</span>;
      case ApprovalStatus.SUPERVISOR_APPROVED:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">OTL Director</span>;
      case ApprovalStatus.FULLY_APPROVED:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Authorized</span>;
      case ApprovalStatus.REJECTED:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">Declined</span>;
      default:
        return null;
    }
  };

  const RequestTable = ({ data, title, emptyMsg, highlight = false }: { data: PLRequest[], title: string, emptyMsg: string, highlight?: boolean }) => (
    <div className={`bg-white rounded-3xl shadow-sm border ${highlight ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200'} overflow-hidden mb-8 transition-all`}>
      <div className={`p-8 border-b border-slate-100 ${highlight ? 'bg-indigo-600' : 'bg-slate-50/30'} flex justify-between items-center`}>
        <div>
          <h2 className={`text-xl font-black uppercase tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
          <p className={`${highlight ? 'text-indigo-100' : 'text-slate-500'} font-medium text-xs mt-1 uppercase tracking-widest`}>Showing {data.length} records</p>
        </div>
        {highlight && data.length > 0 && (
           <div className="bg-white/20 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/20 animate-pulse">
            <AlertCircle size={14} /> Attention Required
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Submitted</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <FileText size={48} />
                    <p className="font-black text-[10px] uppercase tracking-widest">{emptyMsg}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition group">
                  <td className="px-8 py-6 text-[10px] font-mono font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{req.id}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-slate-900">{req.staffName}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{req.staffEmail}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-sm text-slate-700 font-bold line-clamp-1">{req.activityTitle}</p>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400 text-center">{req.submissionDate}</td>
                  <td className="px-8 py-6">{getStatusBadge(req.status)}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => navigate(`/approve/${req.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 transition-all hover:bg-indigo-600 hover:text-white"
                    >
                      Review <ArrowRight size={14} className="inline ml-1" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-2xl">
              <UserCircle size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Greetings, {currentUser?.name.split(' ')[0]}</h1>
              <p className="text-slate-500 font-medium text-xs mt-0.5 tracking-tight uppercase tracking-widest">OTL Professional Learning Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/new-request')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
            >
              <PlusCircle size={20} /> New Request
            </button>
            
            {(currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'DIRECTOR') && onRefresh && (
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} /> 
                {isRefreshing ? 'Syncing...' : 'Refresh'}
              </button>
            )}
            
            {onRefreshBalances && (
              <button 
                onClick={handleRefreshBalances}
                disabled={isRefreshingBalances}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={isRefreshingBalances ? 'animate-spin' : ''} /> 
                {isRefreshingBalances ? 'Syncing...' : 'Sync Balances'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Sections */}
      {actionRequired.length > 0 && (
        <RequestTable 
          data={actionRequired} 
          title="Authorizations Pending Your Review" 
          emptyMsg="No active reviews found" 
          highlight={true}
        />
      )}

      {isAdmin ? (
        <RequestTable 
          data={allRequests} 
          title="Master Pipeline Oversight" 
          emptyMsg="No requests in system" 
        />
      ) : (
        <RequestTable 
          data={mySubmissions} 
          title="My PL Submission History" 
          emptyMsg="No submissions found" 
        />
      )}

      {/* Protocol Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <ShieldCheck size={80} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Protocol Note</h3>
          <p className="text-lg font-black leading-snug text-slate-200">
            Authorization requires verification from both your direct supervisor and the OTL Director.
          </p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">System Status</h3>
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm">
                <Clock size={20} />
             </div>
             <p className="text-sm font-bold text-slate-600 leading-relaxed">
               Sync Status: Local Storage + Gmail Relay Active. All changes recorded for your @aischennai.org identity.
             </p>
          </div>
          
          {(currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'DIRECTOR') && lastRefresh && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw size={12} />
              Last sync: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
