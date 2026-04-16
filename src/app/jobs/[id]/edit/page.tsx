'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Briefcase, Plus, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    experienceLevel: 'Mid',
    description: '',
  });

  const [requirements, setRequirements] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title,
          department: data.department || '',
          experienceLevel: data.experienceLevel,
          description: data.description,
        });
        setRequirements(data.requirements || []);
        setSkills(data.skills || []);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch job', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    const userInfoStr = localStorage.getItem('umurava_user');
    const token = userInfoStr ? JSON.parse(userInfoStr).token : '';

    const payload = {
      ...formData,
      requirements,
      skills,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push(`/jobs/${id}`), 1500);
      } else {
        const errorData = await response.json();
        alert(`Failed to update job: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('An error occurred while connecting to the server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Job Details...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full mb-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href={`/jobs/${id}`} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center text-sm font-medium text-slate-500">
             <Link href="/" className="hover:text-slate-800">Jobs</Link>
             <ChevronRight size={16} className="mx-1" />
             <Link href={`/jobs/${id}`} className="hover:text-slate-800">{formData.title}</Link>
             <ChevronRight size={16} className="mx-1" />
             <span className="text-slate-800">Edit</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Job Posting</h1>
            <p className="text-slate-500 mt-2">Update the requirements or description for this role.</p>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 font-medium animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={18} />
              Changes saved!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass p-8 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Role Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job Title</label>
                 <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                  />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</label>
                 <input 
                    type="text" 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                  />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</label>
                 <select 
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                 </select>
              </div>
              <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                 <textarea 
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-white resize-none"
                  ></textarea>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl shadow-sm border border-blue-50">
             <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 border-b border-blue-50 pb-4">Dynamic Criteria</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700">Requirements</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                      placeholder="Add requirement..."
                    />
                    <button type="button" onClick={handleAddRequirement} className="bg-slate-900 text-white px-3 rounded-lg"><Plus size={16}/></button>
                  </div>
                  <ul className="space-y-2">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex justify-between items-center bg-blue-50/50 p-2 rounded-lg text-xs text-blue-800 border border-blue-100/50">
                        {req}
                        <button type="button" onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-blue-300 hover:text-blue-600 font-bold ml-2">×</button>
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700">Preferred Skills</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                      placeholder="Add skill..."
                    />
                    <button type="button" onClick={handleAddSkill} className="bg-slate-900 text-white px-3 rounded-lg"><Plus size={16}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600 flex items-center gap-1 shadow-sm">
                        {skill}
                        <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
               </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
