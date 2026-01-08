
import React from 'react';

interface SidebarProps {
  activeView: 'notes' | 'todos' | 'insights';
  setActiveView: (view: 'notes' | 'todos' | 'insights') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'notes', icon: 'fa-note-sticky', label: 'Notes' },
    { id: 'todos', icon: 'fa-list-check', label: 'Todo List' },
    { id: 'insights', icon: 'fa-wand-magic-sparkles', label: 'AI Insights' },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-400 flex flex-col hidden md:flex border-r border-slate-200/10">
      <div className="p-8 pb-10 flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black overflow-hidden p-2 shadow-xl shadow-blue-500/5">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" 
            alt="NOTES Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">NOTES</span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#3B82F6] text-white font-medium shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-sm ${isActive ? 'text-white' : 'group-hover:text-white'}`}></i>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <p className="text-[10px] text-white/90 uppercase font-bold tracking-widest mb-1.5">Pro Tip</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Set alarms for your todos to never miss a deadline!
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
