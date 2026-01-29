
import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Settings, 
  Key, 
  Copy, 
  Check, 
  ExternalLink,
  Info,
  Mail
} from 'lucide-react';

interface Props {
  onLogin: (userData: { email: string; name: string; accessToken: string }) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clientId, setClientId] = useState(() => localStorage.getItem('google_sso_client_id') || '');

  const currentOrigin = window.location.origin;

  const handleAuth = () => {
    if (!clientId) {
      setIsConfiguring(true);
      return;
    }

    setIsLoading(true);

    try {
      // Use the Identity Services token client to get both user info and API access
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.send',
        callback: async (response: any) => {
          if (response.error) {
            setError("Authorization failed. Please ensure you have enabled the Gmail API in your Google Cloud Console.");
            setIsLoading(false);
            return;
          }

          // Fetch user info using the token
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }).then(res => res.json());

          onLogin({
            email: userInfo.email,
            name: userInfo.name,
            accessToken: response.access_token
          });
        },
      });

      client.requestAccessToken();
    } catch (err) {
      setError("OAuth initialization failed. Check your Client ID.");
      setIsLoading(false);
    }
  };

  const saveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.includes('.apps.googleusercontent.com')) {
      alert("Please enter a valid Google Client ID");
      return;
    }
    localStorage.setItem('google_sso_client_id', clientId);
    setIsConfiguring(false);
    window.location.reload(); 
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-[#dadce0] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white mb-6 shadow-lg shadow-indigo-100">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-[#202124] tracking-tight">OTL Authorization</h1>
          <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[10px]">Gmail API Integrated System</p>
        </div>

        {isConfiguring ? (
          <form onSubmit={saveConfig} className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">1. Authorized JS Origin</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 group">
                  <code className="text-[10px] font-mono text-indigo-600 font-bold break-all overflow-hidden">{currentOrigin}</code>
                  <button type="button" onClick={copyToClipboard} className="shrink-0 p-2 hover:bg-white rounded-lg transition-colors text-slate-400">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">2. Google OAuth Client ID</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
              <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-indigo-800 leading-relaxed">
                Ensure <b>Gmail API</b> is enabled in your Google Project. You will need to re-verify the "Send Email" scope on login.
              </p>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition">Save & Continue</button>
              <button type="button" onClick={() => setIsConfiguring(false)} className="px-4 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[100px]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Negotiating Scopes...</p>
              </div>
            ) : (
              <div className="space-y-6 w-full">
                <button 
                  onClick={handleAuth}
                  className="w-full bg-white border border-[#dadce0] text-[#3c4043] py-4 rounded-full font-bold text-sm shadow-sm flex items-center justify-center gap-4 hover:bg-[#f8f9fa] transition-all active:scale-[0.98]"
                >
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsuite_512dp.png" className="w-6 h-6" alt="G Suite" />
                  Sign in with AISC Gmail
                </button>
                <div className="h-px bg-slate-100 w-full max-w-[200px] mx-auto"></div>
                <button onClick={() => setIsConfiguring(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition mx-auto">
                   <Settings size={14} /> Update Connection Settings
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3 animate-in fade-in">
            <AlertCircle className="text-rose-500 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-rose-800 text-left">{error}</p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Authorized Personnel Only. <br/>
            SSO Session requires <span className="font-bold text-slate-600">Gmail Send</span> permission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
