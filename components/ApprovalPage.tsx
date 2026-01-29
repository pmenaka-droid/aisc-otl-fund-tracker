
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText,
  User,
  Sparkles,
  Lock,
  ExternalLink,
  Loader2,
  Clock,
  Briefcase,
  MapPin,
  Building2,
  Info,
  Globe,
  DollarSign
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PLRequest, StaffBalance, ApprovalStatus, UserSession } from '../types';

interface Props {
  requests: PLRequest[];
  balances: StaffBalance[];
  onUpdate: (request: PLRequest) => void;
  currentUser: UserSession | null;
}

const ApprovalPage: React.FC<Props> = ({ requests, balances, onUpdate, currentUser }) => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const request = requests.find(r => r.id === requestId);

  useEffect(() => {
    if (request && (currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'DIRECTOR')) {
      fetchAiVerification();
    }
  }, [request?.id]);

  const fetchAiVerification = async () => {
    if (!request) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Verify the Professional Learning activity titled "${request.activityTitle}".
        Provider: ${request.provider}. Website: ${request.websiteLink}.
        Summary: ${request.description}.
        
        Using Google Search grounding, check if this is a real event/course and if the provider is reputable. 
        Provide a concise 2-sentence summary for the approving officer.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });

      setAiInsight(response.text || "No specific details found.");
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks.filter((c: any) => c.web).map((c: any) => ({
        title: c.web.title || "Source",
        uri: c.web.uri
      }));
      setGroundingLinks(links);
    } catch (error) {
      setAiInsight("Unable to perform real-time verification at this moment.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!request) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-400">REQUEST NOT FOUND</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 mt-4 hover:underline font-bold">Return to Dashboard</button>
      </div>
    );
  }

  const isDirector = currentUser?.role === 'DIRECTOR';
  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  const canDecide = (
    (request.status === ApprovalStatus.PENDING && (isSupervisor || isDirector)) ||
    (request.status === ApprovalStatus.SUPERVISOR_APPROVED && isDirector)
  );

  const currentLevel = request.status === ApprovalStatus.PENDING ? 1 : 2;

  const handleAction = () => {
    if (!decision) return;
    if (decision === 'REJECT' && !comments.trim()) {
      alert("Mandatory: Please provide a reason for rejection.");
      return;
    }

    let nextStatus = request.status;
    let updatedReq = { ...request };

    if (decision === 'REJECT') {
      nextStatus = ApprovalStatus.REJECTED;
    } else {
      nextStatus = request.status === ApprovalStatus.PENDING ? ApprovalStatus.SUPERVISOR_APPROVED : ApprovalStatus.FULLY_APPROVED;
    }

    if (isDirector) updatedReq.otlDirectorComments = comments;
    else updatedReq.supervisorComments = comments;

    updatedReq.status = nextStatus;
    onUpdate(updatedReq);
    
    alert(`Decision registered. A notification email has been dispatched.`);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-black text-xs uppercase tracking-widest">
        <ArrowLeft size={16} /> Back to Hub
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
          <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-tight">
            <FileText className="text-indigo-600" size={18} /> Review Workflow
          </h2>
          <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase">Step {currentLevel} of 2</span>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Applicant Personnel</span>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <User size={14} className="text-indigo-500" /> {request.staffName}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Organizational Unit</span>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Building2 size={14} className="text-indigo-500" /> {request.schoolSection.join(', ')}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">{request.activityTitle}</h3>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Clock size={12} /> {request.totalDays} Days
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Globe size={12} /> {request.isOnline}
              </div>
              {request.location && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <MapPin size={12} /> {request.location}
                </div>
              )}
            </div>
          </div>

          {/* Budget Summary for Reviewer */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <DollarSign size={80} />
             </div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Financial Impact Statement</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Registration</span>
                  <p className="text-xl font-black">${request.registrationFee}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Travel</span>
                  <p className="text-xl font-black">${request.travelCost}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Accommodation</span>
                  <p className="text-xl font-black">${request.accommodationCost}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-indigo-400 uppercase">Total Cost</span>
                  <p className="text-2xl font-black text-indigo-400">${request.totalCost}</p>
                </div>
             </div>
          </div>

          {/* Staff Balance Information */}
          {(() => {
            const staffBalance = balances.find(b => b.email.toLowerCase() === request.staffEmail.toLowerCase());
            const remainingBalance = staffBalance?.remainingBalance || 0;
            const projectedBalance = remainingBalance - request.totalCost;
            const hasSufficientFunds = projectedBalance >= 0;

            return (
              <div className={`rounded-3xl p-8 border-2 ${hasSufficientFunds ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <DollarSign size={16} />
                  Staff Balance Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Current Balance</span>
                    <p className="text-2xl font-black text-slate-900">${remainingBalance.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Request Cost</span>
                    <p className="text-2xl font-black text-indigo-600">-${request.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Projected Balance</span>
                    <p className={`text-2xl font-black ${hasSufficientFunds ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${projectedBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
                {!hasSufficientFunds && (
                  <div className="mt-4 p-3 bg-rose-100 rounded-xl">
                    <p className="text-xs font-bold text-rose-700">
                      ⚠️ Insufficient funds: This request exceeds the staff member's remaining balance by ${Math.abs(projectedBalance).toLocaleString()}
                    </p>
                  </div>
                )}
                {hasSufficientFunds && (
                  <div className="mt-4 p-3 bg-emerald-100 rounded-xl">
                    <p className="text-xs font-bold text-emerald-700">
                      ✅ Sufficient funds: This request can be approved within the staff member's remaining balance
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              <Info size={14} /> Submission Narrative
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
              {request.description}
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
            <Sparkles className="absolute top-2 right-2 text-indigo-200" size={24} />
            <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-3 tracking-widest flex items-center gap-2">
               Google Search Verification
               {isAiLoading && <Loader2 size={12} className="animate-spin" />}
            </h4>
            <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{aiInsight || 'Consulting real-time records...'}"</p>
          </div>

          {request.supervisorComments && (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
              <h4 className="text-[10px] font-black text-amber-700 uppercase mb-2">Stage 1: Supervisor Assessment</h4>
              <p className="text-sm font-bold text-amber-900 italic">"{request.supervisorComments}"</p>
            </div>
          )}
        </div>
      </div>

      {canDecide ? (
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8 space-y-6">
          <h2 className="font-black text-slate-900 text-lg uppercase tracking-tight">Officer Authorization</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setDecision('APPROVE')} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${decision === 'APPROVE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
              <CheckCircle size={32} />
              <span className="font-black text-xs uppercase">Authorized</span>
            </button>
            <button onClick={() => setDecision('REJECT')} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${decision === 'REJECT' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
              <XCircle size={32} />
              <span className="font-black text-xs uppercase">Declined</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Executive Comments</label>
            <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Rationale or feedback for the applicant..." className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold" />
          </div>

          <button onClick={handleAction} disabled={!decision} className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest text-sm transition-all ${decision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : decision === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-300 cursor-not-allowed opacity-50'}`}>
            Register Official Decision
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
           <Lock className="mx-auto text-slate-200 mb-4" size={48} />
           <p className="text-slate-900 font-black uppercase tracking-widest text-sm">Security Level: Review Completed</p>
           <p className="text-xs text-slate-500 mt-2 font-medium italic">This request's lifecycle is finalized.</p>
        </div>
      )}
    </div>
  );
};

export default ApprovalPage;
