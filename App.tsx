
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

  // Auto-Persistence
  useEffect(() => {
    localStorage.setItem('zenflow_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('zenflow_todos', JSON.stringify(todos));
  }, [todos]);

  // Request Permissions on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Precision Reminder & Alarm Engine
  useEffect(() => {
    const checkSchedule = () => {
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
              sendNotification("⏰ ZenFlow Reminder", `Target identified: ${todo.text}`);
              changed = true;
              return { ...todo, reminderSent: true };
            }
          }
          return todo;
        });
        return changed ? next : prev;
      });
    };

    const interval = setInterval(checkSchedule, 2000);
    return () => clearInterval(interval);
  }, []);

  // Audio Control Logic
  useEffect(() => {
    if (activeAlarm) {
      if (!alarmAudioRef.current) {
        // High priority alarm tone
        alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
        alarmAudioRef.current.loop = true;
      }
      alarmAudioRef.current.play().catch(() => console.warn("Interacted required for audio"));
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
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
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

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden selection-blue font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        upcomingTodos={todos.filter(t => !t.completed && t.dueDate).slice(0, 3)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-20 shrink-0 sticky top-0">
          <h1 className="text-sm font-black text-[#0F172A] tracking-widest uppercase">
            {activeView} Center
          </h1>
          <div className="flex items-center space-x-4">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Engine</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeView === 'notes' && <NotesView notes={notes} onAddNote={addNote} onDeleteNote={deleteNote} />}
          {activeView === 'todos' && <TodosView todos={todos} onAddTodo={addTodo} onToggleTodo={toggleTodo} onUpdateQuality={updateTodoQuality} onDeleteTodo={(id) => setTodos(prev => prev.filter(t => t.id !== id))} />}
          {activeView === 'insights' && <AIInsights notes={notes} todos={todos} />}
        </div>
      </main>

      {activeAlarm && (
        <RingingAlarm 
          todo={activeAlarm} 
          onDismiss={() => setActiveAlarm(null)} 
          onSnooze={() => snoozeAlarm(activeAlarm)} 
        />
      )}
    </div>
  );
};

export default App;
