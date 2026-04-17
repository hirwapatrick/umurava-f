"use client";

import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Plus,
  BrainCircuit,
  Settings,
  LogOut,
  Search,
  Activity,
  Trash2,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Jobs");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const userInfoStr = localStorage.getItem("umurava_user");
    if (!userInfoStr) {
      router.push("/login");
    } else {
      const userInfo = JSON.parse(userInfoStr);
      setUser(userInfo);
      setProfile({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        email: userInfo.email || "",
      });
      setIsAuthChecking(false);
      fetchJobs();
      fetchApplicants();
    }
  }, [router]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applicants`,
      );
      const data = await res.json();
      setApplicants(data);
    } catch (error) {
      console.error("Failed to fetch applicants", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("umurava_user");
    router.push("/login");
  };

  const handleDeleteJob = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to delete this job and all its applicants?",
      )
    )
      return;

    setIsDeleting(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setJobs(jobs.filter((j) => j._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete job", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteApplicant = async (id: string) => {
    if (!confirm("Delete this applicant?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applicants/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setApplicants(applicants.filter((a) => a._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete applicant", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(profile),
        },
      );

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, ...data };
        localStorage.setItem("umurava_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update Error", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white/95 backdrop-blur-3xl flex flex-col items-center py-4 lg:py-8 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 mb-6 lg:mb-12 px-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
            <BrainCircuit size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Umurava AI
          </h1>
        </div>

        <nav className="w-full px-2 lg:px-4 flex flex-col gap-1 lg:gap-2">
          <NavItem
            icon={<Briefcase size={20} />}
            label="Jobs"
            active={activeTab === "Jobs"}
            onClick={() => setActiveTab("Jobs")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Candidates"
            active={activeTab === "Candidates"}
            onClick={() => setActiveTab("Candidates")}
          />
          <NavItem
            icon={<Activity size={20} />}
            label="Analytics"
            active={activeTab === "Analytics"}
            onClick={() => setActiveTab("Analytics")}
          />
        </nav>

        <div className="mt-auto w-full px-2 lg:px-4 flex flex-col gap-1 lg:gap-2">
          <div className="px-3 lg:px-4 py-3 lg:py-4 mb-2 bg-slate-50/50 rounded-xl lg:rounded-2xl border border-slate-100 flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">
                {user?.role}
              </p>
            </div>
          </div>
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "Settings"}
            onClick={() => setActiveTab("Settings")}
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-10">
          {/* Mobile Header */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu size={24} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              {activeTab === "Jobs" && (
                <Link
                  href="/jobs/new"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-all text-sm"
                >
                  <Plus size={16} />
                  <span>New Job</span>
                </Link>
              )}
            </div>
          </div>

          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-10 w-full max-w-6xl mx-auto">
            <div className="flex-1">
            <div className="block">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                Hi, {user?.firstName || "Recruiter"} 👋
              </h2>
            </div>
              <p className="text-sm lg:text-base text-slate-500 mt-0.5 lg:mt-1">
                {activeTab === "Jobs" &&
                  "Manage job postings and oversee AI talent screening"}
                {activeTab === "Candidates" &&
                  "View and manage all applicants across all roles"}
                {activeTab === "Analytics" &&
                  "Track recruitment performance and AI impact"}
                {activeTab === "Settings" &&
                  "Manage your recruiter profile and preferences"}
              </p>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {activeTab === "Jobs" && (
                <>
                  {/* Mobile Search Toggle */}
                  <button
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    className="lg:hidden p-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Search size={18} />
                  </button>

                  {/* Desktop Search */}
                  <div className="hidden lg:block relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all w-64 focus:w-80"
                    />
                  </div>

                  {/* Desktop New Job Button */}
                  <Link
                    href="/jobs/new"
                    className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <Plus size={18} />
                    <span>New Job</span>
                  </Link>
                </>
              )}
            </div>
          </header>

          {/* Mobile Search Bar (Expandable) */}
          {activeTab === "Jobs" && isMobileSearchOpen && (
            <div className="lg:hidden mb-4 max-w-6xl mx-auto">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            {activeTab === "Jobs" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-10">
                  {loading ? (
                    <>
                      <div className="h-28 lg:h-32 bg-white rounded-xl lg:rounded-2xl border border-slate-100 animate-pulse" />
                      <div className="h-28 lg:h-32 bg-white rounded-xl lg:rounded-2xl border border-slate-100 animate-pulse" />
                      <div className="h-28 lg:h-32 bg-white rounded-xl lg:rounded-2xl border border-slate-100 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <StatCard
                        title="Active Jobs"
                        value={jobs.length.toString()}
                        subtitle="+2 this week"
                      />
                      <StatCard
                        title="Total Candidates"
                        value={applicants.length.toLocaleString()}
                        subtitle="Across all roles"
                      />
                      <StatCard
                        title="AI Screening Savings"
                        value="142 hrs"
                        subtitle="Time saved this month"
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-between items-end mb-4 lg:mb-6">
                  <h3 className="text-lg lg:text-xl font-semibold text-slate-800">
                    Recent Postings
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-44 lg:h-48 bg-white/50 rounded-xl lg:rounded-2xl border border-slate-100 animate-pulse"
                      />
                    ))
                  ) : jobs.length === 0 ? (
                    <div className="col-span-full text-center py-8 lg:py-10 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm text-slate-500">
                      <Briefcase
                        size={32}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="text-sm lg:text-base">You haven't posted any jobs yet.</p>
                      <Link
                        href="/jobs/new"
                        className="text-blue-600 font-medium hover:underline mt-2 inline-block"
                      >
                        Create your first job
                      </Link>
                    </div>
                  ) : (
                    jobs.map((job, index) => (
                      <Link
                        href={`/jobs/${job._id}`}
                        key={job._id}
                        className="glass-card p-4 lg:p-6 flex flex-col group cursor-pointer block text-left animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                        style={
                          {
                            animationDelay: `${index * 100}ms`,
                          } as React.CSSProperties
                        }
                      >
                        <div className="flex justify-between items-start mb-3 lg:mb-4">
                          <h4 className="text-base lg:text-lg font-semibold text-slate-800 leading-tight">
                            {job.title}
                          </h4>
                          <button
                            onClick={(e) => handleDeleteJob(e, job._id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all lg:opacity-0 lg:group-hover:opacity-100"
                          >
                            {isDeleting === job._id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-slate-500 mb-4 lg:mb-6 flex-wrap mt-auto">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs">
                            {job.department || "General"}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs mb-1">
                            {job.experienceLevel}
                          </span>
                        </div>
                        <div className="mt-auto flex justify-between items-center w-full pt-3 lg:pt-4 border-t border-slate-100">
                          <span className="text-xs lg:text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                            Screen with AI →
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tight">
                            {job.status}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "Candidates" && (
              <div className="glass p-4 lg:p-8 rounded-xl lg:rounded-2xl animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 lg:mb-8">
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800">
                    Global Applicant Pool
                  </h3>
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-400">
                    <Users size={14} />
                    {applicants.length} Total Applicants
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 bg-white rounded-xl border border-slate-100 animate-pulse"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100" />
                          <div className="flex-1 space-y-2">
                            <div className="w-24 h-3 bg-slate-100 rounded" />
                            <div className="w-32 h-2 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-20 h-3 bg-slate-100 rounded" />
                          <div className="w-16 h-3 bg-slate-100 rounded" />
                        </div>
                      </div>
                    ))
                  ) : applicants.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic">
                      No applicants found in the system.
                    </div>
                  ) : (
                    applicants.map((app) => (
                      <div
                        key={app._id}
                        className="p-4 bg-white rounded-xl border border-slate-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                              {app.firstName[0]}
                              {app.lastName[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {app.firstName} {app.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {app.email}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteApplicant(app._id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">
                            {app.appliedJobId?.title || "Unknown Role"}
                          </span>
                          <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                          Candidate
                        </th>
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                          Applied Role
                        </th>
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading
                        ? [1, 2, 3, 4, 5].map((i) => (
                            <tr key={i}>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                                  <div className="space-y-2">
                                    <div className="w-24 h-3 bg-slate-100 animate-pulse rounded" />
                                    <div className="w-32 h-2 bg-slate-100 animate-pulse rounded" />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="w-20 h-3 bg-slate-100 animate-pulse rounded" />
                              </td>
                              <td className="py-4">
                                <div className="w-12 h-3 bg-slate-100 animate-pulse rounded" />
                              </td>
                              <td className="py-4 text-right">
                                <div className="w-6 h-6 ml-auto bg-slate-100 animate-pulse rounded" />
                              </td>
                            </tr>
                          ))
                        : applicants.map((app) => (
                            <tr
                              key={app._id}
                              className="group hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                    {app.firstName[0]}
                                    {app.lastName[0]}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm">
                                      {app.firstName} {app.lastName}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {app.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className="text-sm text-slate-600 font-medium">
                                  {app.appliedJobId?.title || "Unknown Role"}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                                  {app.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  title="delete"
                                  onClick={() => handleDeleteApplicant(app._id)}
                                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      {!loading && applicants.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-12 text-center text-slate-400 italic"
                          >
                            No applicants found in the system.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 animate-in fade-in duration-500">
                <div className="glass p-4 lg:p-8 rounded-xl lg:rounded-2xl">
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4 lg:mb-6">
                    Hiring Pipeline
                  </h3>
                  <div className="space-y-4 lg:space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Total Applicants
                        </p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-800">
                          {applicants.length}
                        </p>
                      </div>
                      <div className="text-emerald-500 text-xs lg:text-sm font-bold flex items-center gap-1">
                        <Activity size={12} /> +12%
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: "45%" }}
                      ></div>
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: "25%" }}
                      ></div>
                      <div
                        className="h-full bg-slate-200"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                    <div className="flex flex-wrap gap-3 lg:gap-4 text-[10px] lg:text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>{" "}
                        New (45%)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{" "}
                        Shortlisted (25%)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-200"></span>{" "}
                        Other (30%)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-4 lg:p-8 rounded-xl lg:rounded-2xl flex flex-col justify-center text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                    <BrainCircuit size={24} />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-2">
                    AI Impact Analysis
                  </h3>
                  <p className="text-slate-500 text-xs lg:text-sm">
                    Gemini 2.0 Flash is currently saving your team an average of
                    4.2 hours per job posting.
                  </p>
                  <div className="mt-6 lg:mt-8 grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="p-3 lg:p-4 bg-slate-50 rounded-xl">
                      <div className="text-lg lg:text-xl font-black text-blue-600">92%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Accuracy
                      </div>
                    </div>
                    <div className="p-3 lg:p-4 bg-slate-50 rounded-xl">
                      <div className="text-lg lg:text-xl font-black text-blue-600">0.8s</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Avg. Response
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="glass p-4 lg:p-8 rounded-xl lg:rounded-2xl max-w-2xl animate-in fade-in duration-500">
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-4 lg:mb-8 pb-3 lg:pb-4 border-b border-slate-100">
                  Recruiter Profile & Preferences
                </h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-1.5 lg:space-y-2">
                      <label className="text-xs lg:text-sm font-medium text-slate-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                        value={profile.firstName}
                        onChange={(e) =>
                          setProfile({ ...profile, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1.5 lg:space-y-2">
                      <label className="text-xs lg:text-sm font-medium text-slate-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile({ ...profile, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 lg:space-y-2">
                    <label className="text-xs lg:text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      title="input"
                      type="email"
                      className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                      value={profile.email}
                      disabled
                    />
                    <p className="text-[10px] text-slate-400 italic">
                      Email cannot be changed for security reasons.
                    </p>
                  </div>

                  <div className="space-y-3 lg:space-y-4 pt-4 lg:pt-6 border-t border-slate-100">
                    <h4 className="text-xs lg:text-sm font-black text-slate-400 uppercase tracking-widest">
                      Integrations
                    </h4>
                    <div className="flex items-center justify-between p-3 lg:p-4 bg-white border border-slate-100 rounded-xl lg:rounded-2xl">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                          <BrainCircuit className="text-slate-400" size={16} />
                        </div>
                        <div>
                          <p className="text-xs lg:text-sm font-bold text-slate-800">
                            Google Gemini AI
                          </p>
                          <p className="text-[10px] lg:text-xs text-slate-500">
                            Active • gemini-2.5-flash
                          </p>
                        </div>
                      </div>
                      <span className="px-2 lg:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        Connected
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 lg:pt-6">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl font-bold text-xs lg:text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUpdating && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponents

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium ${
        active
          ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {icon}
      <span className="text-sm lg:text-base">{label}</span>
    </button>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="glass p-4 lg:p-6 rounded-xl lg:rounded-2xl">
      <h3 className="text-xs lg:text-sm font-medium text-slate-500 mb-1 lg:mb-2">{title}</h3>
      <p className="text-2xl lg:text-4xl font-bold text-slate-800 tracking-tight mb-1 lg:mb-2">
        {value}
      </p>
      <p className="text-[10px] lg:text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded border border-emerald-100">
        {subtitle}
      </p>
    </div>
  );
}