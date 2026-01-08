
import React, { useState } from 'react';
import { Todo, QualityScore } from '../types';

interface TodosViewProps {
  todos: Todo[];
  onAddTodo: (text: string, dueDate: string | null, alarmEnabled: boolean) => void;
  onToggleTodo: (id: string) => void;
  onUpdateQuality: (id: string, quality: QualityScore) => void;
  onDeleteTodo: (id: string) => void;
}

const TodosView: React.FC<TodosViewProps> = ({ 
  todos, 
  onAddTodo, 
  onToggleTodo, 
  onUpdateQuality,
  onDeleteTodo
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo) return;
    onAddTodo(newTodo, dueDate ? new Date(dueDate).toISOString() : null, alarmEnabled);
    setNewTodo('');
    setDueDate('');
    setAlarmEnabled(false);
  };

  const filteredTodos = todos.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeTodos = filteredTodos.filter(t => !t.completed);
  const completedTodos = filteredTodos.filter(t => t.completed);

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-full">
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 bg-[#0F172A] p-8 rounded-3xl flex items-center justify-between text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">Total Objectives</h4>
            <p className="text-4xl font-black">{activeTodos.length}</p>
          </div>
          <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl relative z-10">
             <i className="fa-solid fa-list-check text-xl text-blue-400"></i>
          </div>
        </div>
        <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400">Efficiency Rate</h4>
            <p className="text-4xl font-black text-[#0F172A]">{completedTodos.length > 0 ? Math.round((completedTodos.filter(t => t.quality === 'Perfect').length / completedTodos.length) * 100) : 0}%</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 flex items-center justify-center rounded-2xl">
             <i className="fa-solid fa-bolt text-xl text-blue-500"></i>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 mb-12 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Add Task</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Ex: Prepare quarterly budget review"
                className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-sm text-[#0F172A]"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
              />
              <input
                type="datetime-local"
                className="px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white transition-all outline-none text-xs font-bold text-[#0F172A]"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setAlarmEnabled(!alarmEnabled)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                alarmEnabled 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
            >
              <i className={`fa-solid ${alarmEnabled ? 'fa-bell' : 'fa-bell-slash'}`}></i>
              <span>{alarmEnabled ? 'Full Alarm On' : 'Silent Notification'}</span>
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#0F172A] text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
            >
              Deploy Task
            </button>
          </div>
        </form>
      </div>

      <div className="mb-10">
        <div className="relative mb-8">
           <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
           <input 
             type="text"
             placeholder="Search tasks..."
             className="w-full pl-11 pr-4 py-3 bg-transparent border-b border-slate-200 outline-none focus:border-blue-500 transition-all text-sm font-semibold"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">Active Objectives</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          
          {activeTodos.map(todo => (
            <TodoRow 
              key={todo.id} 
              todo={todo} 
              onToggle={() => onToggleTodo(todo.id)} 
              onUpdateQuality={(q) => onUpdateQuality(todo.id, q)}
              onDelete={() => onDeleteTodo(todo.id)}
            />
          ))}
          
          {activeTodos.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
              <i className="fa-solid fa-check-double text-2xl mb-4"></i>
              <p className="text-[10px] font-black uppercase tracking-widest">Clear Horizons</p>
            </div>
          )}
        </section>

        {completedTodos.length > 0 && (
          <section className="mt-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archive</span>
              <div className="h-px flex-1 bg-slate-100"></div>
            </div>
            <div className="space-y-4">
              {completedTodos.map(todo => (
                <TodoRow 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={() => onToggleTodo(todo.id)} 
                  onUpdateQuality={(q) => onUpdateQuality(todo.id, q)}
                  onDelete={() => onDeleteTodo(todo.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const TodoRow: React.FC<{ 
  todo: Todo; 
  onToggle: () => void; 
  onUpdateQuality: (q: QualityScore) => void;
  onDelete: () => void;
}> = ({ todo, onToggle, onUpdateQuality, onDelete }) => {
  const qualities: QualityScore[] = ['Perfect', 'Good', 'Fair', 'Needs Work'];
  const qualityColors = {
    'Perfect': 'bg-blue-500 text-white',
    'Good': 'bg-slate-700 text-white',
    'Fair': 'bg-slate-200 text-slate-600',
    'Needs Work': 'bg-red-50 text-red-500 border border-red-100'
  };

  return (
    <div className={`group p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center gap-6 transition-all duration-300 ${
      todo.completed ? 'bg-slate-50/50 border-slate-200/50' : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/[0.03]'
    }`}>
      <div className="flex items-center flex-1 min-w-0 space-x-6">
        <button 
          onClick={onToggle}
          className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            todo.completed ? 'bg-blue-500 border-blue-500 rotate-12 scale-110' : 'border-slate-200 hover:border-blue-500'
          }`}
        >
          {todo.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
        </button>
        
        <div className="min-w-0">
          <p className={`text-base font-bold transition-all ${todo.completed ? 'line-through text-slate-400 opacity-60' : 'text-[#0F172A]'}`}>
            {todo.text}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-3">
            {todo.dueDate && (
              <div className={`flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${todo.completed ? 'bg-slate-200 text-slate-400' : 'bg-slate-50 text-[#64748B] border border-slate-100'}`}>
                <i className={`fa-solid ${todo.alarmEnabled ? 'fa-bell' : 'fa-clock'} mr-2 text-[8px] ${!todo.completed && todo.alarmEnabled ? 'text-blue-500' : ''}`}></i>
                {new Date(todo.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {todo.completed && (
               <div className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm ${qualityColors[todo.quality]}`}>
                 {todo.quality}
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end space-x-6">
        {!todo.completed && (
          <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {qualities.map(q => (
              <button
                key={q}
                title={`Quality: ${q}`}
                onClick={() => onUpdateQuality(q)}
                className={`text-[9px] w-8 h-8 flex items-center justify-center rounded-xl font-black transition-all ${
                  todo.quality === q 
                    ? 'bg-[#0F172A] text-white shadow-xl' 
                    : 'text-slate-400 hover:text-[#0F172A]'
                }`}
              >
                {q.charAt(0)}
              </button>
            ))}
          </div>
        )}
        <button onClick={onDelete} className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white rounded-2xl border border-slate-100">
          <i className="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default TodosView;
