
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { summarizeNote } from '../services/geminiService';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
}

const COLORS = ['#ffffff', '#f8fafc', '#f1f5f9', '#eff6ff', '#f0fdf4', '#fff7ed'];

const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onDeleteNote }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [autoSummaryEnabled, setAutoSummaryEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoSummaryEnabled || !isAdding || content.length < 50) return;
    const timer = setTimeout(async () => {
      handleSummarize();
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, autoSummaryEnabled, isAdding]);

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    const result = await summarizeNote(content);
    if (result) setSummary(result);
    setIsSummarizing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setIsAdding(true);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onAddNote({ title, content, summary, tags: [], color });
    setTitle('');
    setContent('');
    setSummary('');
    setIsAdding(false);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-colors group-focus-within:text-blue-500"></i>
            <input 
              type="text"
              placeholder="Search through notes..."
              className="w-full md:max-w-md pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50"
          >
            <i className="fa-solid fa-file-arrow-up"></i>
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              isAdding 
                ? 'bg-slate-100 text-[#64748B]' 
                : 'bg-[#3B82F6] text-white hover:bg-blue-600 shadow-xl shadow-blue-500/20'
            }`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
            <span>{isAdding ? 'Cancel' : 'New Note'}</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <input
                type="text"
                placeholder="The Big Idea..."
                className="w-full text-2xl font-black px-0 bg-transparent border-none outline-none placeholder:text-slate-200 text-[#0F172A]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <textarea
                placeholder="What's on your mind? Capture every detail..."
                className="w-full h-80 px-0 bg-transparent border-none outline-none resize-none placeholder:text-slate-200 custom-scrollbar text-lg font-medium text-[#334155] leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 relative group min-h-[250px] shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Context</h4>
                  <button type="button" onClick={() => setAutoSummaryEnabled(!autoSummaryEnabled)} className={`text-[8px] font-black px-2 py-0.5 rounded ${autoSummaryEnabled ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    AUTO {autoSummaryEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {isSummarizing ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400">Synthesizing...</p>
                  </div>
                ) : summary ? (
                  <div className="text-[11px] text-[#475569] leading-relaxed animate-in fade-in duration-500">
                    <div className="whitespace-pre-wrap italic opacity-80">{summary}</div>
                  </div>
                ) : (
                  <p className="text-[10px] font-medium text-slate-300 text-center py-12">Write more to generate an AI summary</p>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aesthetic</h4>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-xl border-2 transition-all ${color === c ? 'border-[#3B82F6] scale-110 shadow-lg' : 'border-slate-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-8 border-t border-slate-100 mt-10 space-x-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-[#64748B]">Discard</button>
            <button type="submit" className="bg-[#0F172A] text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10">Save Record</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredNotes.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
              <i className="fa-solid fa-note-sticky text-3xl text-slate-200"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-400">No notes found</h3>
            <p className="text-sm text-slate-400 mt-1">Try a different search or create a new one.</p>
          </div>
        )}
        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={() => onDeleteNote(note.id)} />
        ))}
      </div>
    </div>
  );
};

const NoteCard: React.FC<{ note: Note; onDelete: () => void }> = ({ note, onDelete }) => {
  const [showSummary, setShowSummary] = useState(false);
  return (
    <div 
      style={{ backgroundColor: note.color }}
      className="p-6 rounded-3xl border border-slate-200 group relative hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/[0.05] transition-all duration-500 flex flex-col min-h-[260px]"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-extrabold text-[#0F172A] text-lg leading-tight line-clamp-2">{note.title}</h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.summary && (
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className={`p-2 rounded-lg transition-colors ${showSummary ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-blue-500'}`}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
            </button>
          )}
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-trash-can text-[10px]"></i>
          </button>
        </div>
      </div>
      <div className="flex-1">
        {showSummary && note.summary ? (
          <div className="text-[11px] text-blue-900 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 leading-relaxed animate-in zoom-in-95">
            <p className="font-black uppercase tracking-[0.2em] text-[8px] mb-2 text-blue-500">Summary</p>
            <div className="whitespace-pre-wrap italic">{note.summary}</div>
          </div>
        ) : (
          <p className="text-[#64748B] text-sm font-medium whitespace-pre-wrap leading-relaxed line-clamp-6">{note.content}</p>
        )}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</span>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
      </div>
    </div>
  );
};

export default NotesView;
