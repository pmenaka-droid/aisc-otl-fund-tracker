
import React from 'react';
import { Wallet, Users, TrendingDown, ExternalLink, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { StaffBalance } from '../types';
import { PD_BALANCE_SHEET_URL } from '../constants';

interface Props {
  balances: StaffBalance[];
}

const BalancesView: React.FC<Props> = ({ balances }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 shadow-sm">
            <FileSpreadsheet size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">PD Fund Registry</h1>
            <p className="text-slate-500 font-medium text-sm">Official balance synchronization from OTL Finance.</p>
          </div>
        </div>
        <a 
          href={PD_BALANCE_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          View Source Spreadsheet <ExternalLink size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-indigo-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Stat</span>
          </div>
          <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Members</h3>
          <p className="text-3xl font-black text-slate-900">{balances.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Cap</span>
          </div>
          <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Available Liquidity</h3>
          <p className="text-3xl font-black text-slate-900">
            ${balances.reduce((acc, curr) => acc + curr.remainingBalance, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-amber-500 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis</span>
          </div>
          <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Average Allocation</h3>
          <p className="text-3xl font-black text-slate-900">
            ${(balances.reduce((acc, curr) => acc + curr.remainingBalance, 0) / balances.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={18} />
            <h2 className="font-black text-slate-900 uppercase tracking-tight text-sm">Synchronized Staff Balances</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced: Just Now</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Available Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {balances.map((staff) => (
                <tr key={staff.email} className="hover:bg-slate-50 transition group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{staff.name}</span>
                      <span className="text-[10px] text-slate-400">{staff.email.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">{staff.department}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-base font-black ${staff.remainingBalance < 200 ? 'text-rose-600' : 'text-slate-900'}`}>
                      ${staff.remainingBalance.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalancesView;
