
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Send, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Briefcase,
  UserCircle,
  Link as LinkIcon,
  FileText,
  DollarSign,
  TrendingDown,
  Wallet,
  Monitor,
  Globe
} from 'lucide-react';
import { PLRequest, StaffBalance, ApprovalStatus, UserSession } from '../types';
import { SUPERVISOR_EMAILS } from '../constants';

interface Props {
  balances: StaffBalance[];
  onSubmit: (request: PLRequest) => void;
  currentUser: UserSession | null;
}

const RequestForm: React.FC<Props> = ({ balances, onSubmit, currentUser }) => {
  const navigate = useNavigate();
  
  // Refined supervisor label logic for clarity
  const supervisorList = SUPERVISOR_EMAILS.map(email => {
    let name = email.split('@')[0];
    if (name === 'mstestteacher') return { email: email.toLowerCase(), label: 'Ms Test Teacher' };
    if (name === 'bjoel') return { email: email.toLowerCase(), label: 'Joel B' };
    // Default formatting: Capitalize first letter
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    return { email: email.toLowerCase(), label: formatted };
  });

  const userBalanceObj = balances.find(b => b.email.toLowerCase() === currentUser?.email.toLowerCase());
  const currentBalance = userBalanceObj ? userBalanceObj.remainingBalance : 0;

  const [formData, setFormData] = useState({
    facultyRole: '',
    otherFacultyRole: '',
    schoolSection: [] as string[],
    activityTitle: '',
    description: '',
    websiteLink: '',
    provider: '',
    isOnline: '', // This was missing from the UI
    otherIsOnline: '',
    discussedWithSupervisor: '',
    startDate: '',
    endDate: '',
    location: '',
    supervisorEmail: supervisorList[0].email,
    // Budget Fields
    registrationFee: 0,
    travelCost: 0,
    accommodationCost: 0,
    visaCost: 0,
    otherCost: 0
  });

  const [totalDays, setTotalDays] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sum = 
      Number(formData.registrationFee || 0) + 
      Number(formData.travelCost || 0) + 
      Number(formData.accommodationCost || 0) + 
      Number(formData.visaCost || 0) + 
      Number(formData.otherCost || 0);
    setTotalCost(sum);
  }, [formData.registrationFee, formData.travelCost, formData.accommodationCost, formData.visaCost, formData.otherCost]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(isNaN(diffDays) ? 0 : diffDays);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const currentSections = [...formData.schoolSection];
      if (checkbox.checked) {
        currentSections.push(value);
      } else {
        const index = currentSections.indexOf(value);
        if (index > -1) currentSections.splice(index, 1);
      }
      setFormData(prev => ({ ...prev, schoolSection: currentSections }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const role = formData.facultyRole === 'Other' ? formData.otherFacultyRole : formData.facultyRole;
    const onlineStatus = formData.isOnline === 'Other' ? formData.otherIsOnline : formData.isOnline;

    // Check for missing required fields explicitly to help the user
    const missingFields = [];
    if (!role) missingFields.push("Faculty Role");
    if (formData.schoolSection.length === 0) missingFields.push("School Section");
    if (!formData.activityTitle) missingFields.push("Activity Title");
    if (!formData.description) missingFields.push("Description");
    if (!formData.websiteLink) missingFields.push("Website Link");
    if (!formData.provider) missingFields.push("Provider");
    if (!onlineStatus) missingFields.push("Activity Format (Online/In-person)");
    if (!formData.discussedWithSupervisor) missingFields.push("Supervisor Discussion Status");
    if (!formData.startDate) missingFields.push("Start Date");
    if (!formData.endDate) missingFields.push("End Date");
    if (!formData.supervisorEmail) missingFields.push("Supervisor Selection");

    if (missingFields.length > 0) {
      setError(`Please complete all required fields: ${missingFields.join(', ')}.`);
      return;
    }

    if (totalCost > currentBalance) {
      setError(`Insufficient Funds: Total request ($${totalCost}) exceeds your current remaining balance ($${currentBalance}).`);
      return;
    }

    if (!currentUser) return;

    const newRequest: PLRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      staffEmail: currentUser.email.toLowerCase(),
      staffName: currentUser.name,
      facultyRole: role,
      schoolSection: formData.schoolSection,
      activityTitle: formData.activityTitle,
      description: formData.description,
      websiteLink: formData.websiteLink,
      provider: formData.provider,
      isOnline: onlineStatus,
      discussedWithSupervisor: formData.discussedWithSupervisor === 'Yes',
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: totalDays,
      location: formData.location,
      submissionDate: new Date().toISOString().split('T')[0],
      status: ApprovalStatus.PENDING,
      supervisorEmail: formData.supervisorEmail.toLowerCase(),
      registrationFee: Number(formData.registrationFee),
      travelCost: Number(formData.travelCost),
      accommodationCost: Number(formData.accommodationCost),
      visaCost: Number(formData.visaCost),
      otherCost: Number(formData.otherCost),
      totalCost: totalCost
    };

    onSubmit(newRequest);
    navigate('/');
  };

  const StandardRadio = ({ name, value, label, current, onChange }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input 
          type="radio" 
          name={name} 
          value={value} 
          checked={current === value}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-indigo-600 peer-checked:border-[6px] transition-all"></div>
      </div>
      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{label}</span>
    </label>
  );

  const StandardCheck = ({ value, label, current, onChange }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input 
          type="checkbox" 
          value={value} 
          checked={current.includes(value)}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
          {current.includes(value) && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
        </div>
      </div>
      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{label}</span>
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">New PL Request</h1>
            <p className="text-slate-500 font-medium text-sm italic">Multi-level authorization sequence initiating...</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Faculty Info */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">
            <UserCircle size={14} className="text-indigo-600" /> Faculty Information
          </div>
          
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-900">I am a... <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['Teaching Assistant', 'Teacher', 'Coach', 'Leadership', 'Admin Staff'].map(role => (
                <StandardRadio key={role} name="facultyRole" value={role} label={role} current={formData.facultyRole} onChange={handleChange} />
              ))}
              <div className="flex items-center gap-3">
                <StandardRadio name="facultyRole" value="Other" label="Other:" current={formData.facultyRole} onChange={handleChange} />
                {formData.facultyRole === 'Other' && (
                  <input 
                    type="text" 
                    name="otherFacultyRole"
                    value={formData.otherFacultyRole}
                    onChange={handleChange}
                    className="flex-grow border-b-2 border-slate-100 outline-none focus:border-indigo-600 py-1 transition-colors font-bold text-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-900">What section of school are you from? <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['ES', 'MS', 'HS', 'Cross Sectional / Schoolwide'].map(section => (
                <StandardCheck key={section} value={section} label={section} current={formData.schoolSection} onChange={handleChange} />
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Discussion */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
          <label className="text-sm font-black text-slate-900 leading-relaxed">
            Have you discussed this Professional Learning opportunity with your supervisor? <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-8">
            <StandardRadio name="discussedWithSupervisor" value="Yes" label="Yes" current={formData.discussedWithSupervisor} onChange={handleChange} />
            <StandardRadio name="discussedWithSupervisor" value="No" label="No" current={formData.discussedWithSupervisor} onChange={handleChange} />
          </div>
        </div>

        {/* Step 3: Activity Info */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">
            <FileText size={14} className="text-indigo-600" /> Requested Professional Learning Information
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Name of Professional Learning Activity <span className="text-rose-500">*</span></label>
            <p className="text-[10px] font-bold text-slate-400 italic">Enter the full name of the workshop, conference, or course</p>
            <input 
              type="text"
              name="activityTitle"
              value={formData.activityTitle}
              onChange={handleChange}
              placeholder="e.g., Annual Science Lab Safety Summit"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-900">Brief Description of the Professional Learning <span className="text-rose-500">*</span></label>
            <p className="text-[10px] font-bold text-slate-400 italic">Provide a brief overview of what will be covered</p>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Summary of objectives and learning outcomes..."
              rows={3}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Link to website <span className="text-rose-500">*</span></label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="url"
                  name="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">Provider/Organization <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  placeholder="Organization name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Monitor size={16} className="text-indigo-600" /> Activity Format <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['In-person', 'Online', 'Hybrid'].map(mode => (
                <StandardRadio key={mode} name="isOnline" value={mode} label={mode} current={formData.isOnline} onChange={handleChange} />
              ))}
              <div className="flex items-center gap-3">
                <StandardRadio name="isOnline" value="Other" label="Other:" current={formData.isOnline} onChange={handleChange} />
                {formData.isOnline === 'Other' && (
                  <input 
                    type="text" 
                    name="otherIsOnline"
                    value={formData.otherIsOnline}
                    onChange={handleChange}
                    className="flex-grow border-b-2 border-slate-100 outline-none focus:border-indigo-600 py-1 transition-colors font-bold text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Costs & Funding */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">
            <DollarSign size={14} className="text-indigo-600" /> Estimated Costs (in USD $)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: 'Registration Fee', name: 'registrationFee' },
              { label: 'Travel / Airfare', name: 'travelCost' },
              { label: 'Accommodation', name: 'accommodationCost' },
              { label: 'Visa / Travel Docs', name: 'visaCost' },
              { label: 'Other Expenses', name: 'otherCost' }
            ].map(field => (
              <div key={field.name} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] || ''}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-black text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Fund Impact Review Box */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Wallet size={120} />
            </div>
            <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Available Funds</span>
              <span className="text-2xl font-black">${currentBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-1">Request Amount</span>
              <span className="text-2xl font-black text-rose-300">-${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Projected Balance</span>
              <span className={`text-2xl font-black ${currentBalance - totalCost < 0 ? 'text-rose-500' : 'text-emerald-300'}`}>
                ${(currentBalance - totalCost).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Step 5: Logistics & Supervisor */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">
            <Clock size={14} className="text-indigo-600" /> Timing & Oversight
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-1">
                <Calendar size={10} /> Start Date <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-1">
                <Calendar size={10} /> End Date <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-1">
              <MapPin size={10} /> Location
            </label>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country (if in-person)"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 ml-1">
              <Users size={10} /> Select Direct Supervisor <span className="text-rose-500">*</span>
            </label>
            <select 
              name="supervisorEmail"
              value={formData.supervisorEmail}
              onChange={handleChange}
              className="w-full px-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-black text-slate-900 appearance-none shadow-sm cursor-pointer"
              required
            >
              {supervisorList.map(s => (
                <option key={s.email} value={s.email}>{s.label} ({s.email})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button 
            type="submit"
            className="w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all active:scale-[0.98] bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 flex items-center justify-center gap-3"
          >
            Submit Authorization Request <Send size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4">
            <AlertCircle className="text-rose-500 mt-0.5 shrink-0" size={20} />
            <p className="text-xs text-rose-700 font-bold leading-relaxed">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RequestForm;
