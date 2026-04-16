'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Briefcase, User, Mail, Phone, FileText, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ApplyPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeText: ''
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Failed to fetch job', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rawResumeText: formData.resumeText,
          appliedJobId: id
        })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Submission Error', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-medium italic">Loading Careers Portal...</div>;
  }

  if (!job) {
    return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-800">Job Not Found</h1>
      <p className="text-slate-500 mt-2">This position may have been filled or the link is incorrect.</p>
    </div>;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Application Received</h2>
          <p className="text-slate-500 mb-8 lowercase">
            thank you for applying to the <strong>{job.title}</strong> role at Umurava. our AI recruitment assistant will review your profile shortly.
          </p>
          <p className="text-xs text-slate-400">you will be notified once a recruiter reviews your shortlist ranking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left side: Job Info (Desktop) */}
      <div className="lg:w-1/2 bg-blue-600 p-10 lg:p-20 text-white flex flex-col sticky top-0 lg:h-screen overflow-y-auto">
        <div className="flex items-center gap-2 mb-12">
          <Globe size={20} className="text-blue-200" />
          <span className="font-semibold tracking-wider text-blue-100 uppercase text-xs">Careers Portal</span>
        </div>
        
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">{job.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">{job.department || 'General'}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">{job.experienceLevel}</span>
          </div>
        </div>

        <div className="space-y-8 text-blue-100">
           <div>
              <h3 className="text-white font-bold mb-3 uppercase tracking-widest text-xs">Job Description</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">{job.description}</p>
           </div>
           
           <div>
              <h3 className="text-white font-bold mb-3 uppercase tracking-widest text-xs">What we are looking for</h3>
              <ul className="space-y-2">
                 {job.requirements.map((req: string, i: number) => (
                   <li key={i} className="flex gap-2 text-sm italic opacity-85">
                      <CheckCircle2 size={16} className="text-blue-300 mt-1 shrink-0" />
                      <span>{req}</span>
                   </li>
                 ))}
              </ul>
           </div>
        </div>

        <div className="mt-auto pt-12 text-xs text-blue-300">
           © 2026 Umurava AI Technology Hackathon Project. All rights reserved.
        </div>
      </div>

      {/* Right side: Application Form */}
      <div className="lg:w-1/2 p-10 lg:p-20 bg-white">
        <div className="max-w-md mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Apply for this position</h2>
            <p className="text-slate-500 mt-2">Submit your details and professional background below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">First Name</label>
                 <div className="relative group">
                    <User className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all text-sm"
                      placeholder="e.g. Jean"
                    />
                 </div>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Last Name</label>
                 <input 
                    required
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all text-sm"
                    placeholder="e.g. Bosco"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Email Address</label>
               <div className="relative group">
                 <Mail className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all text-sm"
                    placeholder="bosco@example.com"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Phone Number</label>
               <div className="relative group">
                 <Phone className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all text-sm"
                    placeholder="+250 78x xxx xxx"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex justify-between">
                 <span>Resume / Professional Summary</span>
                 <span className="text-blue-500 lowercase normal-case text-[10px] font-medium tracking-normal">AI parses this text</span>
               </label>
               <div className="relative group">
                 <FileText className="absolute left-3 top-3 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <textarea 
                    required
                    rows={8}
                    value={formData.resumeText}
                    onChange={(e) => setFormData({...formData, resumeText: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all text-sm resize-none"
                    placeholder="Describe your experience, skills, and why you are a fit for this role. Paste your resume text here."
                  ></textarea>
               </div>
            </div>

            <button 
               type="submit" 
               disabled={submitting}
               className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 group shadow-xl"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <span>Submit Application</span>}
              {!submitting && <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />}
            </button>
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-4">Your data is processed by Umurava AI Engine.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
