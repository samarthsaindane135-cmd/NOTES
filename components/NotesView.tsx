
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { summarizeNote } from '../services/geminiService';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
}

const COLORS = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#ffffff', '#ffffff'];

const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onDeleteNote }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [autoSummaryEnabled, setAutoSummaryEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce summarization
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
    if (result) {
      setSummary(result);
    }
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

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-full">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Writing Space</h2>
          <p className="text-[#64748B] text-sm mt-1">Capture thoughts, insights, and ideas.</p>
        </div>
        <div className="flex space-x-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".txt,.md" 
            onChange={handleFileUpload} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50"
          >
            <i className="fa-solid fa-file-arrow-up text-xs"></i>
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              isAdding 
                ? 'bg-slate-100 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200' 
                : 'bg-[#3B82F6] text-white hover:bg-blue-600 shadow-md shadow-blue-500/10'
            }`}
          >
            <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'} text-xs`}></i>
            <span>{isAdding ? 'Cancel' : 'New Entry'}</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 mb-10 transition-all animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Title</label>
                <input
                  type="text"
                  placeholder="Note Title"
                  className="w-full text-xl font-semibold px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-[#9CA3AF] placeholder:italic text-[#0F172A]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Content</label>
                <textarea
                  placeholder="Begin writing..."
                  className="w-full h-80 px-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5 transition-all resize-none placeholder:text-[#9CA3AF] placeholder:italic custom-scrollbar text-lg font-normal text-[#334155] leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">AI Summary</h4>
                <div className="flex items-center space-x-3">
                   <button 
                     type="button"
                     onClick={() => setAutoSummaryEnabled(!autoSummaryEnabled)}
                     className={`text-[9px] font-bold uppercase transition-all px-2 py-1 rounded ${autoSummaryEnabled ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}
                   >
                     Auto: {autoSummaryEnabled ? 'ON' : 'OFF'}
                   </button>
                   <button 
                     type="button" 
                     onClick={handleSummarize}
                     disabled={isSummarizing || !content.trim()}
                     className="text-slate-400 hover:text-blue-500 transition-colors"
                   >
                     <i className={`fa-solid fa-arrows-rotate text-xs ${isSummarizing ? 'animate-spin' : ''}`}></i>
                   </button>
                </div>
              </div>

              <div className="min-h-[200px] bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/60 relative group shadow-inner">
                {isSummarizing ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 space-y-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generating Summary...</p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm text-[#475569] text-xs leading-relaxed animate-in fade-in duration-500">
                    <div className="whitespace-pre-wrap">{summary}</div>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(summary)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-500 border border-slate-100"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                       <i className="fa-solid fa-wand-magic-sparkles text-slate-300 text-xl"></i>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 max-w-[140px] leading-relaxed">
                      {content.length < 50 ? 'Write a bit more to see an AI overview' : 'AI Summary will appear here'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Theme</h4>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-[#3B82F6] scale-110 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-8 border-t border-slate-100 mt-10">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                className="bg-[#3B82F6] text-white px-10 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                Save Entry
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length === 0 && !isAdding && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-feather-pointed text-2xl text-slate-300"></i>
            </div>
            <p className="text-sm font-medium text-slate-400">Minimalism awaits your first word</p>
          </div>
        )}
        {notes.map((note) => (
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
      className="p-6 rounded-2xl border border-slate-200 group relative hover:border-[#3B82F6] hover:shadow-xl hover:shadow-blue-500/[0.04] transition-all duration-300 flex flex-col min-h-[220px]"
    >
      <div className="flex justify-between items-start mb-4 pr-8">
        <h3 className="font-bold text-[#0F172A] text-base leading-tight line-clamp-2">{note.title}</h3>
        <div className="flex items-center space-x-1">
          {note.summary && (
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className={`p-1.5 transition-colors rounded-lg ${showSummary ? 'text-blue-500 bg-blue-50 border border-blue-100' : 'text-slate-300 hover:text-blue-400'}`}
              title="View AI Summary"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-200"
          >
            <i className="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        {showSummary && note.summary ? (
          <div className="text-[11px] text-[#1E3A8A] bg-[#EFF6FF] p-4 rounded-xl border border-[#DBEAFE] leading-relaxed animate-in zoom-in-95 duration-200">
            <p className="font-bold uppercase tracking-widest text-[8px] mb-2 text-[#3B82F6]">AI Summary</p>
            <div className="whitespace-pre-wrap">{note.summary}</div>
          </div>
        ) : (
          <p className="text-[#64748B] text-sm font-normal whitespace-pre-wrap leading-relaxed line-clamp-6">{note.content}</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400 flex justify-between items-center uppercase tracking-wider">
        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        <span>{note.content.length} characters</span>
      </div>
    </div>
  );
};

export default NotesView;
