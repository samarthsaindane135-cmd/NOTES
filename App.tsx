import React, { useState, useEffect, useRef } from 'react';
import { Todo, Note, QualityScore } from './types';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import NotesView from './components/NotesView';
import TodosView from './components/TodosView';
import AIInsights from './components/AIInsights';
import RingingAlarm from './components/RingingAlarm';
import { requestNotificationPermission, sendNotification } from './services/notificationService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'notes' | 'todos' | 'insights'>('notes');
  const [activeAlarm, setActiveAlarm] = useState<Todo | null>(null);
  
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('zenflow_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('zenflow_todos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
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

  // Alarm & Reminder Engine
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      setTodos(prev => {
        let changed = false;
        const next = prev.map(todo => {
          if (todo.dueDate && !todo.reminderSent && !todo.completed) {
            const due = new Date(todo.dueDate);
            if (due <= now) {
              if (todo.alarmEnabled && !activeAlarm) {
                setActiveAlarm(todo);
              }
              sendNotification("⏰ ZenFlow Alert", `Time for: ${todo.text}`);
              changed = true;
              return { ...todo, reminderSent: true };
            }
          }
          return todo;
        });
        return changed ? next : prev;
      });
    };

    const interval = setInterval(checkSchedule, 1000);
    return () => clearInterval(interval);
  }, [activeAlarm]);

  // Handle Alarm Audio
  useEffect(() => {
    if (activeAlarm) {
      if (!alarmAudioRef.current) {
        alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
        alarmAudioRef.current.loop = true;
      }
      alarmAudioRef.current.play().catch(e => console.warn("Interaction required for audio", e));
    } else if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  }, [activeAlarm]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = { ...note, id: crypto.randomUUID(), createdAt: Date.now() };
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
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        if (activeAlarm?.id === id) setActiveAlarm(null);
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const updateTodoQuality = (id: string, quality: QualityScore) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, quality } : t));
  };

  const snoozeAlarm = (todo: Todo) => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
    setTodos(prev => prev.map(t => 
      t.id === todo.id ? { ...t, dueDate: snoozeTime.toISOString(), reminderSent: false } : t
    ));
    setActiveAlarm(null);
  };

  const getViewTitle = () => {
    switch(activeView) {
      case 'notes': return 'Notes';
      case 'todos': return 'Task';
      case 'insights': return 'AI Coach';
      default: return 'ZenFlow';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden selection-blue font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        upcomingTodos={todos.filter(t => !t.completed && t.dueDate).slice(0, 5)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-30 shrink-0 sticky top-0">
          <h1 className="text-[10px] md:text-[11px] font-black text-[#0F172A] tracking-[0.25em] uppercase flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 md:mr-3 animate-pulse"></span>
            <span className="truncate">{getViewTitle()} Center</span>
          </h1>
          <div className="flex items-center space-x-4 md:space-x-6">
             <div className="flex items-center space-x-2">
               <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
               </span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="animate-slide-up p-1 min-h-full pb-24 md:pb-8">
            {activeView === 'notes' && <NotesView notes={notes} onAddNote={addNote} onDeleteNote={deleteNote} />}
            {activeView === 'todos' && <TodosView todos={todos} onAddTodo={addTodo} onToggleTodo={toggleTodo} onUpdateQuality={updateTodoQuality} onDeleteTodo={(id) => setTodos(prev => prev.filter(t => t.id !== id))} />}
            {activeView === 'insights' && <AIInsights notes={notes} todos={todos} />}
          </div>
        </div>

        <MobileNav activeView={activeView} setActiveView={setActiveView} />
      </main>

      {activeAlarm && (
        <RingingAlarm 
          todo={activeAlarm} 
          onDismiss={() => {
            toggleTodo(activeAlarm.id);
            setActiveAlarm(null);
          }} 
          onSnooze={() => snoozeAlarm(activeAlarm)} 
        />
      )}
    </div>
  );
};

export default App;