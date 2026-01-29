
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Settings, 
  Grid, 
  Star, 
  Trash2, 
  Archive, 
  Mail, 
  MailOpen, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  ArrowLeft,
  RefreshCw,
  Plus,
  Clock,
  Send,
  FileText
} from 'lucide-react';
import { Notification, UserSession } from '../types';

interface Props {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: UserSession | null;
  onAutoLogin: (email: string) => void;
}

const InboxView: React.FC<Props> = ({ notifications, setNotifications, currentUser, onAutoLogin }) => {
  const navigate = useNavigate();
  const [viewingNotif, setViewingNotif] = React.useState<Notification | null>(null);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (viewingNotif?.id === id) setViewingNotif(null);
  };

  const filteredNotifs = currentUser 
    ? notifications.filter(n => {
        const userEmail = currentUser.email.toLowerCase();
        return n.recipient.toLowerCase() === userEmail || 
               n.cc?.some(ccEmail => ccEmail.toLowerCase() === userEmail);
      })
    : notifications;

  const handleNotifClick = (notif: Notification) => {
    markAsRead(notif.id);
    setViewingNotif(notif);
  };

  const handleAction = (notif: Notification) => {
    onAutoLogin(notif.recipient);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f6f8fc]">
      {/* Gmail Header */}
      <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-[#dadce0]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-[#f1f3f4] rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="Gmail" className="w-6 h-6" />
            <span className="text-xl font-medium text-[#5f6368]">Gmail</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6368]" size={20} />
            <input 
              type="text" 
              placeholder="Search mail"
              className="w-full bg-[#f1f3f4] border-none rounded-lg py-3 pl-12 pr-4 focus:bg-white focus:shadow-md outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition text-[#5f6368]"><RefreshCw size={20} /></button>
          <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition text-[#5f6368]"><Settings size={20} /></button>
          <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition text-[#5f6368]"><Grid size={20} /></button>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs ml-2">
            {currentUser?.name.charAt(0)}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 p-3 flex flex-col gap-2 bg-[#f6f8fc]">
          <button className="flex items-center gap-3 bg-[#c2e7ff] text-[#001d35] px-6 py-4 rounded-2xl shadow-sm hover:shadow-md transition font-medium mb-4">
            <Plus size={24} /> Compose
          </button>
          
          <div className="space-y-0.5">
            {[
              { icon: Mail, label: 'Inbox', active: true, count: filteredNotifs.filter(n => !n.isRead).length },
              { icon: Star, label: 'Starred' },
              { icon: Clock, label: 'Snoozed' },
              { icon: Send, label: 'Sent' },
              { icon: FileText, label: 'Drafts' },
            ].map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-full transition text-sm ${item.active ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'hover:bg-[#f1f3f4] text-[#202124]'}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.count ? <span className="text-xs">{item.count}</span> : null}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-tl-2xl overflow-hidden shadow-sm flex flex-col">
          {viewingNotif ? (
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-between border-b border-[#f1f3f4]">
                <div className="flex items-center gap-4">
                  <button onClick={() => setViewingNotif(null)} className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><ArrowLeft size={18} /></button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><Archive size={18} /></button>
                  <button onClick={() => deleteNotif(viewingNotif.id)} className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><Trash2 size={18} /></button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><Mail size={18} /></button>
                </div>
                <div className="flex items-center gap-2 text-[#5f6368]">
                  <span className="text-xs">1 of 1</span>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><ChevronLeft size={18} /></button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><ChevronRight size={18} /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-3xl mx-auto space-y-8">
                  <h2 className="text-2xl font-normal text-[#202124]">{viewingNotif.subject}</h2>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {viewingNotif.sender.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{viewingNotif.sender}</span>
                          <span className="text-xs text-[#5f6368]">&lt;noreply@aischennai.org&gt;</span>
                        </div>
                        <div className="text-xs text-[#5f6368]">to me</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#5f6368]">{viewingNotif.timeLabel}</div>
                  </div>

                  <div className="text-sm text-[#202124] whitespace-pre-wrap leading-relaxed">
                    {viewingNotif.body}
                  </div>

                  {viewingNotif.link && (
                    <div className="pt-6 border-t border-[#f1f3f4]">
                      <button 
                        onClick={() => handleAction(viewingNotif)}
                        className="bg-[#1a73e8] hover:bg-[#1b66c9] text-white px-8 py-3 rounded-lg font-medium transition shadow-sm"
                      >
                        Review PL Request
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 pt-10">
                    <button className="flex items-center gap-2 border border-[#dadce0] px-6 py-2 rounded-full text-sm font-medium hover:bg-[#f8f9fa] transition">
                      Reply
                    </button>
                    <button className="flex items-center gap-2 border border-[#dadce0] px-6 py-2 rounded-full text-sm font-medium hover:bg-[#f8f9fa] transition">
                      Forward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-[#f1f3f4] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="p-2"><input type="checkbox" className="w-4 h-4 rounded border-[#dadce0]" /></div>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded transition"><MoreVertical size={16} /></button>
                  <button className="p-2 hover:bg-[#f1f3f4] rounded transition"><RefreshCw size={16} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredNotifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#5f6368]">
                    <div className="bg-[#f1f3f4] p-10 rounded-full mb-4">
                      <Mail size={48} className="opacity-20" />
                    </div>
                    <p className="font-medium">Your primary tab is empty.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f1f3f4]">
                    {filteredNotifs.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`flex items-center px-4 py-2 gap-4 cursor-pointer hover:shadow-md transition-shadow group ${n.isRead ? 'bg-[#f6f8fc]' : 'bg-white'}`}
                      >
                        <input type="checkbox" className="w-4 h-4 rounded border-[#dadce0]" onClick={(e) => e.stopPropagation()} />
                        <Star size={18} className="text-[#dadce0] hover:text-[#fbbc05] transition" />
                        
                        <div className={`w-40 text-sm truncate ${!n.isRead ? 'font-bold text-[#202124]' : 'text-[#5f6368]'}`}>
                          {n.sender}
                        </div>
                        
                        <div className="flex-1 flex items-baseline gap-2 overflow-hidden">
                          <span className={`text-sm truncate ${!n.isRead ? 'font-bold' : 'text-[#202124]'}`}>{n.subject}</span>
                          <span className="text-sm text-[#5f6368] truncate">- {n.snippet}</span>
                        </div>

                        <div className={`text-xs w-20 text-right ${!n.isRead ? 'font-bold text-[#202124]' : 'text-[#5f6368]'}`}>
                          {n.timeLabel}
                        </div>

                        <div className="hidden group-hover:flex items-center gap-2 absolute right-24 bg-white/90 backdrop-blur px-2 py-1 rounded-lg">
                          <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><Archive size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} className="p-2 hover:bg-[#f1f3f4] rounded-full transition"><Trash2 size={16} /></button>
                          <button className="p-2 hover:bg-[#f1f3f4] rounded-full transition">{n.isRead ? <Mail size={16} /> : <MailOpen size={16} />}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default InboxView;
