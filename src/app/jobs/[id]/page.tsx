'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, BrainCircuit, Users, UploadCloud, CheckCircle2, AlertTriangle, Loader2, Copy, ExternalLink, Mail, Clock, FileSpreadsheet, Edit, Plus, Globe, Trash2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Papa from 'papaparse';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingResults, setCheckingResults] = useState(true);
  const [hasResults, setHasResults] = useState(false);
  
  // Applicant Upload States
  const [candidateJSON, setCandidateJSON] = useState('');
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    fetchApplicants();
    checkScreeningStatus();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      } else {
         router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch job', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/job/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      }
    } catch (error) {
      console.error('Failed to fetch applicants', error);
    }
  };

  const checkScreeningStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/job/${id}/results`);
      if (res.ok) {
        const data = await res.json();
        setHasResults(data.length > 0);
      }
    } catch (error) {
       console.error('Failed to check results', error);
    } finally {
       setCheckingResults(false);
    }
  };

  const handleUploadCandidate = async () => {
    if (!candidateJSON) return;
    setUploading(true);
    setUploadSuccess(false);

    try {
      let parsed;
      try {
         parsed = JSON.parse(candidateJSON);
      } catch (err) {
         alert('Invalid JSON format. Please paste a valid JSON object.');
         setUploading(false);
         return;
      }

      const payload = {
         firstName: parsed.firstName || 'Unknown',
         lastName: parsed.lastName || 'Candidate',
         email: parsed.email || `candidate_${Math.floor(Math.random() * 1000)}@test.com`,
         appliedJobId: id,
         parsedData: parsed
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });

      if (res.ok) {
         setUploadSuccess(true);
         setCandidateJSON('');
         fetchApplicants();
      } else {
         alert('Failed to upload applicant.');
      }
    } catch (error) {
      console.error('Upload Error', error);
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerScreening = async () => {
     if (applicants.length === 0) {
        alert('No applicants to screen yet.');
        return;
     }

     const userInfoStr = localStorage.getItem('umurava_user');
     const token = userInfoStr ? JSON.parse(userInfoStr).token : '';

     setLoading(true);
     try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/screen`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
           router.push(`/jobs/${id}/results`);
        } else {
           const data = await res.json().catch(() => ({}));
           const errMsg = data?.message || '';
           if (errMsg.toLowerCase().includes('high demand') || errMsg.includes('503')) {
              alert('The AI engine is currently experiencing very high demand. The system tried to auto-retry, but it\'s still busy. Please try again in 1-2 minutes.');
           } else {
              alert('AI Screening failed. Details: ' + errMsg);
           }
        }
     } catch (error) {
        console.error('Screening Error', error);
     } finally {
        setLoading(false);
     }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId: id,
              applicants: results.data
            })
          });

          if (res.ok) {
            setUploadSuccess(true);
            fetchApplicants();
            setTimeout(() => setUploadSuccess(false), 3000);
          } else {
            alert('Failed to batch upload applicants.');
          }
        } catch (error) {
          console.error('Batch Upload Error', error);
        } finally {
          setBulkUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  const copyApplyLink = () => {
     const link = `${window.location.origin}/apply/${id}`;
     navigator.clipboard.writeText(link);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteJob = async () => {
     if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
     setLoading(true);
     try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
           method: 'DELETE'
        });
        if (res.ok) {
           router.push('/');
        }
     } catch (error) {
        console.error('Failed to delete job', error);
     } finally {
        setLoading(false);
     }
  };

  const handleDeleteApplicant = async (appId: string) => {
     if (!confirm('Are you sure you want to delete this applicant?')) return;
     try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants/${appId}`, {
           method: 'DELETE'
        });
        if (res.ok) {
           setApplicants(applicants.filter(a => a._id !== appId));
        }
     } catch (error) {
        console.error('Failed to delete applicant', error);
     }
  };

  if (loading || !job) {
     return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Job Details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full mb-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
               <h1 className="text-lg font-semibold text-slate-800">{job.title}</h1>
               <div className="flex items-center gap-1 ml-2">
                  <Link href={`/jobs/${id}/edit`} className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-all">
                     <Edit size={16} />
                  </Link>
                  <button 
                    onClick={handleDeleteJob}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-all"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">{job.status}</span>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={copyApplyLink}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2 text-sm font-medium transition-colors"
             >
                {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                <span>{copied ? 'Copied Link' : 'Copy Application Link'}</span>
             </button>
             
             {hasResults ? (
                <Link href={`/jobs/${id}/results`} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md shadow-emerald-500/20 text-sm">
                   <Trophy size={16} />
                   <span>View Rankings</span>
                </Link>
             ) : (
                <button onClick={handleTriggerScreening} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md shadow-blue-500/20 text-sm">
                   <BrainCircuit size={16} />
                   <span>Screen with AI</span>
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Col: Job Details & Applicants */}
         <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-2xl">
               <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <Clock size={20} className="text-blue-500" />
                  Details
               </h2>
               <div className="prose prose-slate max-w-none text-slate-600 text-sm whitespace-pre-wrap mb-8">
                  {job.description}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                  <div>
                     <h3 className="font-semibold text-slate-700 mb-3 text-sm">Mandatory Requirements</h3>
                     <ul className="space-y-2">
                        {job.requirements.map((req: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                             <CheckCircle2 size={14} className="text-emerald-500 mt-1 shrink-0" />
                             <span>{req}</span>
                          </li>
                        ))}
                     </ul>
                  </div>
                  <div>
                     <h3 className="font-semibold text-slate-700 mb-3 text-sm">Preferred Skills</h3>
                     <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill: string, i: number) => (
                           <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2.5 py-1 rounded-md">{skill}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Applicant Pool List */}
            <div className="glass p-8 rounded-2xl">
               <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <Users size={20} className="text-blue-500" />
                     Applicant Pool
                  </h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{applicants.length} Total</span>
               </div>
               
               <div className="space-y-4">
                  {applicants.length === 0 ? (
                     <div className="text-center py-10 text-slate-400">
                        <Users size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm italic">No applicants yet. Share the link to get started!</p>
                     </div>
                  ) : (
                     applicants.map((app) => (
                        <div key={app._id} className="flex items-center justify-between p-4 bg-white/50 border border-white hover:border-blue-100 rounded-xl transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                 {app.firstName[0]}{app.lastName[0]}
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-slate-800">{app.firstName} {app.lastName}</h4>
                                 <div className="flex items-center gap-2 mt-0.5">
                                    <Mail size={12} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">{app.email}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${app.status === 'screening' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                                 {app.status}
                              </span>
                              <button 
                                onClick={() => handleDeleteApplicant(app._id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>

         {/* Right Col: Admin Ingestion */}
         <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30">
               <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mx-auto mb-3">
                     <UploadCloud size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Direct Ingestion</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">Manually import profile JSON</p>
               </div>

               <textarea 
                  rows={8}
                  placeholder={`{\n  "firstName": "John",\n  "lastName": "Doe",\n  "skills": ["React", "Node"]\n}`}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white resize-none"
                  value={candidateJSON}
                  onChange={(e) => setCandidateJSON(e.target.value)}
               ></textarea>

               {uploadSuccess && (
                  <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1 justify-center font-medium bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                     <CheckCircle2 size={14} /> Ingested successfully!
                  </div>
               )}

               <button 
                  onClick={handleUploadCandidate}
                  disabled={uploading || !candidateJSON}
                  className="w-full mt-4 bg-slate-900 hover:bg-black text-white disabled:opacity-50 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
               >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Add to Queue
               </button>
            </div>

            <div className="glass p-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
               <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mx-auto mb-3">
                     <FileSpreadsheet size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Bulk Ingestion</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">Upload candidate CSV (Scenario 2)</p>
               </div>

               <input 
                  type="file" 
                  accept=".csv" 
                  hidden 
                  ref={fileInputRef}
                  onChange={handleCSVUpload}
               />

               <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={bulkUploading}
                  className="w-full bg-white border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 disabled:opacity-50 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
               >
                  {bulkUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                  Upload Candidates CSV
               </button>
               <p className="text-[10px] text-center text-slate-400 mt-3 italic">Expected headers: firstName, lastName, email, phone, resumeText</p>
            </div>
            
            <div className="glass p-6 rounded-2xl">
               <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">Share this role</h3>
               <Link 
                  href={`/apply/${id}`}
                  target="_blank"
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all group"
               >
                  <div className="flex items-center gap-3">
                     <Globe className="text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
                     <span className="text-sm font-medium text-slate-600">Public Application Link</span>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-slate-600" />
               </Link>
            </div>
         </div>
      </main>
    </div>
  );
}
