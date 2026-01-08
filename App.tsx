
import React, { useState, useEffect, useRef } from 'react';
import { Todo, Note, QualityScore } from './types';
import Sidebar from './components/Sidebar';
import NotesView from './components/NotesView';
import TodosView from './components/TodosView';
import AIInsights from './components/AIInsights';
import RingingAlarm from './components/RingingAlarm';
import { requestNotificationPermission, sendNotification } from './services/notificationService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'notes' | 'todos' | 'insights'>('notes');
  const [activeAlarm, setActiveAlarm] = useState<Todo | null>(null);
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('zenflow_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zenflow_todos');
    return saved ? JSON.parse(saved) : [];
  });

  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('zenflow_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('zenflow_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTodos(prev => {
        let changed = false;
        const next = prev.map(todo => {
          if (todo.dueDate && !todo.reminderSent && !todo.completed) {
            const due = new Date(todo.dueDate);
            if (due <= now) {
              if (todo.alarmEnabled) {
                setActiveAlarm(todo);
              }
              sendNotification("NOTES Task Due", todo.text);
              changed = true;
              return { ...todo, reminderSent: true };
            }
          }
          return todo;
        });
        return changed ? next : prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeAlarm) {
      if (!alarmAudioRef.current) {
        alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
        alarmAudioRef.current.loop = true;
      }
      alarmAudioRef.current.play().catch(e => console.log("Audio play blocked", e));
    } else {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    }
  }, [activeAlarm]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addTodo = (text: string, dueDate: string | null, alarmEnabled: boolean) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      quality: 'Perfect',
      dueDate,
      reminderSent: false,
      alarmEnabled
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const updateTodoQuality = (id: string, quality: QualityScore) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, quality } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden relative selection-blue">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-3">
            <button className="md:hidden text-[#0F172A] mr-2">
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 className="text-lg font-semibold text-[#0F172A] tracking-tight">
              {activeView === 'notes' ? 'Notes' : activeView === 'todos' ? 'Todo List' : 'AI Performance'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:block text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
             </div>
             <div className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center bg-white p-1.5 shadow-sm">
               <img 
                 src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" 
                 alt="Brand Logo" 
                 className="w-full h-full object-contain" 
               />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {activeView === 'notes' && (
            <NotesView notes={notes} onAddNote={addNote} onDeleteNote={deleteNote} />
          )}
          {activeView === 'todos' && (
            <TodosView 
              todos={todos} 
              onAddTodo={addTodo} 
              onToggleTodo={toggleTodo} 
              onUpdateQuality={updateTodoQuality}
              onDeleteTodo={deleteTodo}
            />
          )}
          {activeView === 'insights' && (
            <AIInsights notes={notes} todos={todos} />
          )}
        </div>
      </main>

      {activeAlarm && (
        <RingingAlarm todo={activeAlarm} onDismiss={dismissAlarm} />
      )}
    </div>
  );
};

export default App;
