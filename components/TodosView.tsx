
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo) return;
    onAddTodo(newTodo, dueDate ? new Date(dueDate).toISOString() : null, alarmEnabled);
    setNewTodo('');
    setDueDate('');
    setAlarmEnabled(false);
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const perfectCount = completedTodos.filter(t => t.quality === 'Perfect').length;
  const perfectPercentage = completedTodos.length > 0 ? Math.round((perfectCount / completedTodos.length) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-full">
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-5 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 flex items-center justify-center text-[#3B82F6] rounded-xl">
            <i className="fa-solid fa-chart-line text-lg"></i>
          </div>
          <div>
            <h4 className="text-[#64748B] text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Success Rate</h4>
            <p className="text-2xl font-bold text-[#3B82F6]">{perfectPercentage}% <span className="text-[10px] text-slate-400 font-medium ml-1">Fidelity</span></p>
          </div>
        </div>
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-5 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 rounded-xl">
            <i className="fa-solid fa-circle-check text-lg"></i>
          </div>
          <div>
            <h4 className="text-[#64748B] text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Archived Tasks</h4>
            <p className="text-2xl font-bold text-[#0F172A]">{completedTodos.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 mb-12 shadow-sm transition-all">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">New Task</label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-sm text-[#0F172A] placeholder:text-slate-400"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                 <input
                  type="datetime-local"
                  className="px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-xs font-semibold text-[#0F172A]"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setAlarmEnabled(!alarmEnabled)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider ${
                alarmEnabled 
                  ? 'bg-blue-50 text-[#3B82F6] border-blue-200 shadow-sm shadow-blue-500/5' 
                  : 'bg-white text-slate-400 border-slate-200 hover:border-blue-200 hover:text-blue-500'
              }`}
            >
              <i className={`fa-solid ${alarmEnabled ? 'fa-bell' : 'fa-bell-slash'} text-xs`}></i>
              <span>{alarmEnabled ? 'Alarm On' : 'Silent'}</span>
            </button>
            <button
              type="submit"
              className="bg-[#3B82F6] text-white px-10 py-3 rounded-xl font-bold uppercase text-[11px] tracking-widest hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-12 pb-20">
        <section>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">Active Objectives</h3>
            <span className="bg-blue-50 text-[#3B82F6] text-[10px] px-2.5 py-1 rounded-full font-black border border-blue-100">
              {activeTodos.length}
            </span>
          </div>
          <div className="space-y-4">
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
              <div className="text-slate-300 py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl text-xs font-medium">
                <i className="fa-solid fa-mug-hot text-2xl mb-4 block opacity-30"></i>
                All tasks cleared.
              </div>
            )}
          </div>
        </section>

        {completedTodos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Archive</h3>
              <span className="bg-slate-50 text-[#64748B] text-[10px] px-2.5 py-1 rounded-full font-black border border-slate-100">
                {completedTodos.length}
              </span>
            </div>
            <div className="space-y-4 opacity-75">
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
    'Perfect': 'bg-[#0F172A] text-white',
    'Good': 'bg-slate-600 text-white',
    'Fair': 'bg-slate-300 text-[#0F172A]',
    'Needs Work': 'bg-slate-100 text-slate-500'
  };

  return (
    <div className={`group p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 ${
      todo.completed 
        ? 'bg-slate-50/50 border-slate-200/50' 
        : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/[0.02]'
    }`}>
      <div className="flex items-center flex-1 min-w-0 space-x-5">
        <button 
          onClick={onToggle}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            todo.completed 
              ? 'bg-[#3B82F6] border-[#3B82F6] scale-90' 
              : 'border-slate-200 hover:border-blue-400 bg-white'
          }`}
        >
          {todo.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
        </button>
        
        <div className="min-w-0">
          <p className={`text-[15px] font-semibold transition-all ${todo.completed ? 'line-through text-slate-400' : 'text-[#0F172A]'}`}>
            {todo.text}
          </p>
          <div className="flex flex-wrap gap-2.5 mt-2.5">
            {todo.dueDate && (
              <div className={`flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${todo.completed ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-[#64748B]'}`}>
                <i className={`fa-solid ${todo.alarmEnabled ? 'fa-clock' : 'fa-bell'} mr-2 text-[8px]`}></i>
                {new Date(todo.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            )}
            {todo.completed && (
               <div className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest shadow-sm ${qualityColors[todo.quality]}`}>
                 {todo.quality}
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end space-x-4">
        {!todo.completed ? (
          <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            {qualities.map(q => (
              <button
                key={q}
                title={q}
                onClick={() => onUpdateQuality(q)}
                className={`text-[9px] w-7 h-7 flex items-center justify-center rounded-lg font-black transition-all ${
                  todo.quality === q 
                    ? 'bg-[#0F172A] text-white shadow-md' 
                    : 'text-slate-400 hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                {q.charAt(0)}
              </button>
            ))}
          </div>
        ) : null}
        <button 
          onClick={onDelete}
          className="p-2.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white rounded-xl border border-transparent hover:border-red-100"
        >
          <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default TodosView;
