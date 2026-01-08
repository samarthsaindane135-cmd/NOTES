
import React from 'react';
import { Todo } from '../types';

interface RingingAlarmProps {
  todo: Todo;
  onDismiss: () => void;
  onSnooze: () => void;
}

const RingingAlarm: React.FC<RingingAlarmProps> = ({ todo, onDismiss, onSnooze }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0F172A]/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)] animate-in zoom-in-95 duration-500">
        <div className="bg-[#3B82F6] p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce relative z-10">
            <i className="fa-solid fa-bell text-3xl text-[#3B82F6]"></i>
          </div>
          <h2 className="text-white text-3xl font-black tracking-tighter uppercase leading-none relative z-10">Task Alert</h2>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mt-4 relative z-10">High Priority Action</p>
        </div>
        
        <div className="p-10 text-center">
          <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-8 line-clamp-2 px-4">{todo.text}</h3>
          
          <div className="space-y-3">
            <button
              onClick={onDismiss}
              className="w-full bg-[#0F172A] text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
            >
              Mark Completed
            </button>
            <button
              onClick={onSnooze}
              className="w-full bg-slate-50 text-slate-500 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
            >
              Snooze 5 Minutes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingingAlarm;
