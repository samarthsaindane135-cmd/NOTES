
import React from 'react';
import { Todo } from '../types';

interface RingingAlarmProps {
  todo: Todo;
  onDismiss: () => void;
}

const RingingAlarm: React.FC<RingingAlarmProps> = ({ todo, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 border border-white/20">
        <div className="bg-[#0F172A] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
             <i className="fa-solid fa-bell text-[200px] -rotate-12 opacity-5"></i>
          </div>
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 ring-8 ring-white/5 animate-bounce relative z-10 shadow-lg">
            <i className="fa-solid fa-bell text-3xl text-[#0F172A]"></i>
          </div>
          <h2 className="text-white text-3xl font-bold tracking-tight uppercase leading-none relative z-10">Time Up</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4 relative z-10">Action Required</p>
        </div>
        
        <div className="p-10 text-center">
          <div className="mb-10">
            <h3 className="text-xl font-bold text-[#0F172A] leading-tight">{todo.text}</h3>
            <p className="text-[#64748B] text-xs font-medium mt-3">
              Scheduled for {new Date(todo.dueDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={onDismiss}
              className="w-full bg-[#3B82F6] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20"
            >
              Dismiss
            </button>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">NOTES PRODUCTIVITY CORE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingingAlarm;
