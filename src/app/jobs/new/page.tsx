'use client';

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Briefcase, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewJobPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    experienceLevel: 'Mid',
    description: '',
  });

  // Simple array states for tags
  const [requirements, setRequirements] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const handleAddRequirement = () => {
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      requirements,
      skills,
    };

    try {
      // Fetch token from local storage
      const userInfoStr = localStorage.getItem('umurava_user');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        alert('You must be logged in to post a job. Please login.');
        return;
      }

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        console.error('Failed to create job:', errorData);
        alert(`Failed to create job: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('An error occurred while connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Job Posted!</h2>
          <p className="text-slate-500 mb-8">
            Your job opening for <strong>{formData.title}</strong> is now live and ready to receive applicants.
          </p>
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={() => { setSuccess(false); setFormData({ title: '', department: '', experienceLevel: 'Mid', description: '' }); setRequirements([]); setSkills([]); }}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-medium transition-all"
            >
              Post Another Job
            </button>
            <Link href="/" className="bg-slate-100 hover:bg-slate-200 text-slate-700 w-full py-3 rounded-xl font-medium transition-all">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full mb-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center text-sm font-medium text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer">Jobs</span>
            <ChevronRight size={16} className="mx-1" />
            <span className="text-slate-800">Create New Job</span>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <Briefcase size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create a New Job Posting</h1>
          <p className="text-slate-500 mt-2 text-lg">Define the role requirements so Umurava AI can seamlessly screen candidates.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details Section */}
          <div className="glass p-8 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Basic Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Job Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white"
                  placeholder="e.g. Senior Product Designer"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Department</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white"
                  placeholder="e.g. Engineering"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Experience Level</label>
                <select 
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead / Staff</option>
                </select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Job Description</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white resize-none"
                  placeholder="Describe the overall role, responsibilities, and team..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* AI Matching Criteria Section */}
          <div className="glass p-8 rounded-2xl shadow-sm border border-blue-100 bg-gradient-to-br from-white/70 to-blue-50/30">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">AI Matching Criteria</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-blue-100">
              The Gemini AI model will use these specific items to evaluate and score candidates. Be explicit.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Requirements List */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                  <span>Mandatory Requirements</span>
                  <span className="text-slate-400 font-normal">{requirements.length} added</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm bg-white"
                    placeholder="e.g. 5+ years of React experience"
                  />
                  <button type="button" onClick={handleAddRequirement} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 rounded-lg transition-colors flex items-center justify-center">
                    <Plus size={20} />
                  </button>
                </div>
                
                <ul className="space-y-2">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex justify-between items-center bg-blue-50 border border-blue-100 text-blue-800 text-sm px-3 py-2 rounded-lg">
                      <span className="truncate pr-4">{req}</span>
                      <button type="button" onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-blue-600 font-bold px-1">&times;</button>
                    </li>
                  ))}
                  {requirements.length === 0 && <li className="text-sm text-slate-400 italic py-2">No requirements added yet.</li>}
                </ul>
              </div>

              {/* Skills List */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 flex justify-between">
                  <span>Preferred Skills</span>
                  <span className="text-slate-400 font-normal">{skills.length} added</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm bg-white"
                    placeholder="e.g. Typescript, Next.js, Figma"
                  />
                  <button type="button" onClick={handleAddSkill} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 rounded-lg transition-colors flex items-center justify-center">
                    <Plus size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm text-slate-700 text-sm px-3 py-1.5 rounded-full">
                      <span>{skill}</span>
                      <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 ml-1 font-bold">&times;</button>
                    </div>
                  ))}
                  {skills.length === 0 && <div className="text-sm text-slate-400 italic py-2 w-full">No skills added yet.</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
             <button type="button" className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors">
               Cancel
             </button>
             <button 
               type="submit" 
               disabled={loading || !formData.title || !formData.description}
               className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
               <span>{loading ? 'Posting Job...' : 'Publish Job Post'}</span>
             </button>
          </div>
        </form>
      </main>
    </div>
  );
}
