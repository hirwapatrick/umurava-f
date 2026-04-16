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

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Analyzing results...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full mb-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/jobs/${id}`} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
               <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">AI Shortlist Ranking</h1>
               <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{job?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-blue-100">
             <BrainCircuit size={14} />
             <span>Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        <div className="mb-10 text-center">
           <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 mb-4">
              <Trophy size={14} />
              <span>Recommended Shortlist</span>
           </div>
           <h2 className="text-3xl font-black text-slate-900 leading-tight">Match Quality Analysis</h2>
           <p className="text-slate-500 mt-2">Candidates are ranked by their alignment with job requirements and skill sets.</p>
        </div>

        {results.length === 0 ? (
           <div className="glass p-12 rounded-3xl text-center">
              <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-800">No Screening Data</h3>
              <p className="text-slate-500 mt-2 mb-6">You haven't triggered the AI screening for this job profile yet.</p>
              <Link href={`/jobs/${id}`} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Return to Job Details</Link>
           </div>
        ) : (
           <div className="space-y-6">
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
       <div className="p-6 flex items-center gap-6">
          <div className="w-12 h-12 flex items-center justify-center font-black text-2xl text-slate-200 shrink-0">
             #{rank}
          </div>
          
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-1">
                <h4 className="text-lg font-bold text-slate-800">{applicant.firstName} {applicant.lastName}</h4>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getRecommendationStyle(result.recommendation)}`}>
                   {result.recommendation}
                </span>
             </div>
             <p className="text-xs text-slate-500 font-medium">{applicant.email}</p>
          </div>

          <div className="text-right">
             <div className="text-sm font-black text-slate-400 uppercase tracking-tighter mb-1">Match Score</div>
             <div className={`text-3xl font-black ${result.matchScore >= 80 ? 'text-emerald-500' : result.matchScore >= 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                {result.matchScore}%
             </div>
          </div>

          <button 
             onClick={() => setExpanded(!expanded)}
             className="ml-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
             <ChevronRight className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
          </button>
       </div>

       {expanded && (
          <div className="px-6 pb-8 pt-2 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div>
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Insight: Strengths</h5>
                   <ul className="space-y-3">
                      {result.strengths.map((str: string, i: number) => (
                         <li key={i} className="flex gap-2 text-sm text-slate-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{str}</span>
                         </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Insight: Potential Gaps</h5>
                   <ul className="space-y-3">
                      {result.gaps.map((gap: string, i: number) => (
                         <li key={i} className="flex gap-2 text-sm text-slate-700 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                            <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                            <span>{gap}</span>
                         </li>
                      ))}
                      {result.gaps.length === 0 && <li className="text-sm italic text-slate-400">No significant gaps identified.</li>}
                   </ul>
                </div>
             </div>

             <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Reasoning (Natural Language)</h5>
                <p className="text-sm leading-relaxed text-slate-100 italic">
                   "{result.explanationDetails}"
                </p>
             </div>
          </div>
       )}
    </div>
  );
}
