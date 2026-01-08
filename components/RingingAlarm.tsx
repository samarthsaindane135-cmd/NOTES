
import React from 'react';
import { Todo } from '../types';

interface RingingAlarmProps {
  todo: Todo;
  onDismiss: () => void;
  onSnooze: () => void;
}

const RingingAlarm: React.FC<RingingAlarmProps> = ({ todo, onDismiss, onSnooze }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0F172A]/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20">
        <div className="bg-[#0F172A] p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
             <i className="fa-solid fa-bell text-[250px] -rotate-12 opacity-5"></i>
          </div>
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-10 ring-[12px] ring-white/10 animate-bounce relative z-10 shadow-2xl">
            <i className="fa-solid fa-bell text-4xl text-blue-500"></i>
          </div>
          <h2 className="text-white text-4xl font-black tracking-tighter uppercase leading-none relative z-10">Time Alert</h2>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-5 relative z-10">High Priority Action</p>
        </div>
        
        <div className="p-10 text-center">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-2">{todo.text}</h3>
            <p className="text-slate-400 text-sm font-bold">
              Due at {new Date(todo.dueDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={onDismiss}
              className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
            >
              Complete Task
            </button>
            <button
              onClick={onSnooze}
              className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
            >
              Snooze 5 Minutes
            </button>
          </div>
          
          <div className="mt-8">
             <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">ZenFlow Intelligence Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingingAlarm;
