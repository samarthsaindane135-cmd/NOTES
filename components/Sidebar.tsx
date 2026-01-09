import React from 'react';
import { Todo } from '../types';

interface SidebarProps {
  activeView: 'notes' | 'todos' | 'insights';
  setActiveView: (view: 'notes' | 'todos' | 'insights') => void;
  upcomingTodos: Todo[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, upcomingTodos }) => {
  const menuItems = [
    { id: 'notes', icon: 'fa-note-sticky', label: 'Notes & Ideas' },
    { id: 'todos', icon: 'fa-list-check', label: 'Task Board' },
    { id: 'insights', icon: 'fa-wand-magic-sparkles', label: 'AI Coach' },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-400 flex flex-col hidden md:flex border-r border-slate-200/10 shrink-0">
      <div className="p-8 pb-10 flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black overflow-hidden p-2 shadow-xl shadow-blue-500/5">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" 
            alt="NOTES Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-black text-white tracking-tighter uppercase">ZenFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Menu</p>
        </div>
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#3B82F6] text-white font-semibold shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-sm ${isActive ? 'text-white' : 'group-hover:text-white transition-colors'}`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="px-4 mt-12 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Upcoming Reminders</p>
        </div>
        <div className="px-2 space-y-2">
          {upcomingTodos.length > 0 ? (
            upcomingTodos.map(todo => (
              <div key={todo.id} className="p-3 bg-slate-800/30 rounded-xl border border-white/5">
                <p className="text-[11px] text-white font-medium truncate mb-1">{todo.text}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">
                  {new Date(todo.dueDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {todo.alarmEnabled && <span className="ml-2 text-blue-400"><i className="fa-solid fa-bell"></i></span>}
                </p>
              </div>
            ))
          ) : (
            <p className="px-4 text-[10px] text-slate-600 italic">No tasks with due dates</p>
          )}
        </div>
      </nav>

      <div className="p-6">
        <div className="bg-gradient-to-br from-[#3B82F6]/20 to-transparent border border-[#3B82F6]/20 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <i className="fa-solid fa-shield-halved text-[#3B82F6] text-xs"></i>
            <p className="text-[10px] text-white uppercase font-black tracking-widest">Focus Mode</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            Alarms will ring even if this tab is in the background.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;