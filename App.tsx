
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

  // Persistence
  useEffect(() => {
    localStorage.setItem('zenflow_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('zenflow_todos', JSON.stringify(todos));
  }, [todos]);

  // Permissions
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Alarm & Reminder Engine
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
              sendNotification("⏰ Productivity Alarm", `Time to focus on: ${todo.text}`);
              changed = true;
              return { ...todo, reminderSent: true };
            }
          }
          return todo;
        });
        return changed ? next : prev;
      });
    }, 5000); // Check every 5 seconds for precision
    return () => clearInterval(interval);
  }, []);

  // Audio Control
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

  const snoozeAlarm = (todo: Todo) => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
    
    setTodos(prev => prev.map(t => 
      t.id === todo.id ? { ...t, dueDate: snoozeTime.toISOString(), reminderSent: false } : t
    ));
    setActiveAlarm(null);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden relative selection-blue font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        upcomingTodos={todos.filter(t => !t.completed && t.dueDate).slice(0, 3)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              {activeView === 'notes' ? 'My Library' : activeView === 'todos' ? 'Action Board' : 'Intelligence Audit'}
            </h1>
          </div>
          <div className="flex items-center space-x-5">
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest leading-none">Status</span>
               <span className="text-[11px] font-semibold text-[#0F172A]">Production Active</span>
             </div>
             <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center bg-white p-2 shadow-sm">
               <img 
                 src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" 
                 alt="Brand Logo" 
                 className="w-full h-full object-contain" 
               />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
        <RingingAlarm todo={activeAlarm} onDismiss={dismissAlarm} onSnooze={() => snoozeAlarm(activeAlarm)} />
      )}
    </div>
  );
};

export default App;
