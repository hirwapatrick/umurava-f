'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, BrainCircuit, CheckCircle2, AlertTriangle, XCircle, Search, Trophy, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ScreeningResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [jobRes, resultsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/job/${id}/results`)
      ]);

      if (jobRes.ok) setJob(await jobRes.json());
      if (resultsRes.ok) setResults(await resultsRes.json());
    } catch (error) {
      console.error('Failed to fetch results', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm sm:text-base">
      Analyzing results...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 sm:pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full mb-6 sm:mb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href={`/jobs/${id}`} className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Link>
            <div>
               <h1 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-tighter">AI Shortlist Ranking</h1>
               <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">
                 {job?.title}
               </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ring-1 ring-blue-100">
             <BrainCircuit size={12} className="sm:w-3.5 sm:h-3.5" />
             <span className="hidden sm:inline">Powered by Gemini 2.5 Flash</span>
             <span className="sm:hidden">Gemini AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-10 text-center">
           <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 mb-3 sm:mb-4">
              <Trophy size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Recommended Shortlist</span>
           </div>
           <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight px-2">Match Quality Analysis</h2>
           <p className="text-slate-500 mt-1.5 sm:mt-2 text-xs sm:text-sm">Candidates are ranked by their alignment with job requirements and skill sets.</p>
        </div>

        {results.length === 0 ? (
           <div className="glass p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl text-center">
              <AlertTriangle size={32} className="mx-auto text-slate-300 mb-3 sm:mb-4 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">No Screening Data</h3>
              <p className="text-slate-500 mt-1.5 sm:mt-2 mb-4 sm:mb-6 text-sm sm:text-base">You haven't triggered the AI screening for this job profile yet.</p>
              <Link href={`/jobs/${id}`} className="bg-blue-600 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm inline-block">
                Return to Job Details
              </Link>
           </div>
        ) : (
           <div className="space-y-4 sm:space-y-6">
              {results.map((res, index) => (
                 <ResultCard key={res._id} result={res} rank={index + 1} />
              ))}
           </div>
        )}
      </main>
    </div>
  );
}

function ResultCard({ result, rank }: { result: any, rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const applicant = result.applicantId;

  const getRecommendationStyle = (rec: string) => {
    switch(rec) {
      case 'Strong Hire': return 'bg-emerald-500 text-white';
      case 'Hire': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Consider': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reject': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className={`glass-card p-0 transition-all duration-500 ${expanded ? 'shadow-2xl' : ''}`}>
       <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-xl sm:text-2xl text-slate-200 shrink-0">
               #{rank}
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                    {applicant.firstName} {applicant.lastName}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${getRecommendationStyle(result.recommendation)}`}>
                     {result.recommendation}
                  </span>
               </div>
               <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">{applicant.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 ml-auto sm:ml-0">
            <div className="text-right">
               <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 sm:mb-1">Match Score</div>
               <div className={`text-xl sm:text-2xl lg:text-3xl font-black ${
                 result.matchScore >= 80 ? 'text-emerald-500' : 
                 result.matchScore >= 60 ? 'text-amber-500' : 
                 'text-slate-400'
               }`}>
                  {result.matchScore}%
               </div>
            </div>

            <button 
               onClick={() => setExpanded(!expanded)}
               className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
               <ChevronRight className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''} w-4 h-4 sm:w-5 sm:h-5`} />
            </button>
          </div>
       </div>

       {expanded && (
          <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-2 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 mt-3 sm:mt-4">
                <div>
                   <h5 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">AI Insight: Strengths</h5>
                   <ul className="space-y-2 sm:space-y-3">
                      {result.strengths.map((str: string, i: number) => (
                         <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-700 bg-emerald-50/50 p-2 sm:p-3 rounded-lg border border-emerald-100/50">
                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0 sm:w-4 sm:h-4" />
                            <span className="flex-1">{str}</span>
                         </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h5 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">AI Insight: Potential Gaps</h5>
                   <ul className="space-y-2 sm:space-y-3">
                      {result.gaps.map((gap: string, i: number) => (
                         <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-700 bg-red-50/50 p-2 sm:p-3 rounded-lg border border-red-100/50">
                            <XCircle size={14} className="text-red-400 mt-0.5 shrink-0 sm:w-4 sm:h-4" />
                            <span className="flex-1">{gap}</span>
                         </li>
                      ))}
                      {result.gaps.length === 0 && (
                        <li className="text-xs sm:text-sm italic text-slate-400 p-2">No significant gaps identified.</li>
                      )}
                   </ul>
                </div>
             </div>

             <div className="mt-5 sm:mt-8 p-4 sm:p-6 bg-slate-900 rounded-xl sm:rounded-2xl text-white">
                <h5 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">AI Reasoning (Natural Language)</h5>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-100 italic">
                   "{result.explanationDetails}"
                </p>
             </div>
          </div>
       )}
    </div>
  );
}