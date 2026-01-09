import React from 'react';

interface MobileNavProps {
  activeView: 'notes' | 'todos' | 'insights';
  setActiveView: (view: 'notes' | 'todos' | 'insights') => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'notes', icon: 'fa-note-sticky', label: 'Notes' },
    { id: 'todos', icon: 'fa-list-check', label: 'Tasks' },
    { id: 'insights', icon: 'fa-wand-magic-sparkles', label: 'Coach' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
      <nav className="bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-2xl shadow-blue-500/10 rounded-3xl flex items-center justify-around p-2 pointer-events-auto max-w-sm mx-auto">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`flex flex-col items-center justify-center w-20 py-2 rounded-2xl transition-all duration-300 relative ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                <i className={`fa-solid ${item.icon} text-lg`}></i>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;