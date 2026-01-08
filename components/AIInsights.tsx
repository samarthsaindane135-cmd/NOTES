
import React, { useState, useEffect } from 'react';
import { Note, Todo, QualityScore } from '../types';
import { getAIProductivityInsights } from '../services/geminiService';

interface AIInsightsProps {
  notes: Note[];
  todos: Todo[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ notes, todos }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getAIProductivityInsights(notes, todos);
    if (result) {
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (notes.length > 0 || todos.length > 0) {
      fetchInsights();
    }
  }, []);

  if (notes.length === 0 && todos.length === 0) {
    return (
      <div className="p-24 text-center text-slate-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-ghost text-3xl"></i>
        </div>
        <p className="text-sm font-medium">Operational data required for AI analysis</p>
      </div>
    );
  }

  const completed = todos.filter(t => t.completed);
  const qualityCounts = {
    'Perfect': completed.filter(t => t.quality === 'Perfect').length,
    'Good': completed.filter(t => t.quality === 'Good').length,
    'Fair': completed.filter(t => t.quality === 'Fair').length,
    'Needs Work': completed.filter(t => t.quality === 'Needs Work').length,
  };

  const maxCount = Math.max(...Object.values(qualityCounts), 1);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">AI Audit</h2>
          <p className="text-[#64748B] text-sm mt-1">Measuring work fidelity and outcome quality.</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="bg-white text-[#0F172A] border border-slate-200 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all shadow-sm"
        >
          <i className={`fa-solid fa-arrows-rotate ${loading ? 'animate-spin' : ''} mr-2`}></i>
          <span>{loading ? 'Analyzing...' : 'Refresh Audit'}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-50 border border-slate-100 rounded-2xl"></div>
            <div className="h-48 bg-slate-50 border border-slate-100 rounded-2xl"></div>
            <div className="h-48 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-10">
          <div className="bg-[#0F172A] text-white p-10 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32"></div>
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center space-x-3 mb-6">
                <span className="bg-white/10 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-white/10">Fidelity Score</span>
              </div>
              <h3 className="text-8xl font-black tracking-tighter leading-none">{data.overallScore}<span className="text-white/20 text-4xl ml-2">%</span></h3>
              <p className="mt-6 text-blue-400 font-bold uppercase text-[10px] tracking-[0.2em]">VERDICT: {data.verdict}</p>
              
              <div className="mt-10 flex items-center space-x-8">
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[9px] tracking-widest mb-1.5">Perfect Output</p>
                  <p className="font-bold text-2xl">{qualityCounts.Perfect}</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[9px] tracking-widest mb-1.5">Needs Work</p>
                  <p className="font-bold text-2xl text-red-400">{qualityCounts['Needs Work']}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl md:w-80 relative z-10 backdrop-blur-sm">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">Quality Distribution</h4>
              <div className="space-y-4">
                {(Object.entries(qualityCounts) as [QualityScore, number][]).map(([q, count]) => (
                  <div key={q} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className={q === 'Perfect' ? 'text-blue-400' : 'text-white/60'}>{q}</span>
                      <span className="text-white/40">{count}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${q === 'Perfect' ? 'bg-blue-500' : q === 'Good' ? 'bg-slate-400' : 'bg-slate-600'}`}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.insights.map((insight: any, i: number) => (
              <div key={i} className="bg-white p-7 rounded-2xl border border-slate-200 hover:border-[#3B82F6]/50 hover:shadow-xl hover:shadow-blue-500/[0.03] transition-all duration-300">
                <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-[#0F172A]">
                  <i className={`fa-solid ${
                    insight.category === 'momentum' ? 'fa-bolt-lightning' : 
                    insight.category === 'quality' ? 'fa-award' : 'fa-bullseye'
                  } text-lg`}></i>
                </div>
                <h4 className="font-bold text-[#0F172A] text-lg mb-3 leading-tight">{insight.title}</h4>
                <p className="text-sm font-medium text-[#64748B] leading-relaxed mb-6">{insight.description}</p>
                <div className="flex items-center space-x-2">
                   <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] w-[70%]"></div>
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-[#3B82F6]">
                    {insight.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
           <button onClick={fetchInsights} className="text-sm font-bold text-[#3B82F6] hover:underline">Initiate performance audit</button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
