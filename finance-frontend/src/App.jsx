import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Search,
  Shield, PieChart, Activity, Bell, ChevronDown, CheckCircle,
  ArrowUpRight, ArrowDownLeft, CreditCard, Lock, UserPlus,
  Trash2, Settings as SettingsIcon, Sparkles, SearchX, XCircle, AlertCircle, X, Loader2,
  Eye, EyeOff
} from 'lucide-react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, Title, Filler
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import UserManagement from './components/UserManagement';
import FinancialLog from './components/FinancialLog';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, Title, Filler
);

const StatCard = ({ label, amount, icon, trend, color = "text-slate-900" }) => (
  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 ${color}`}>{trend}</span>
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <h3 className={`text-3xl font-black tracking-tighter ${color}`}>₹{Number(amount).toLocaleString()}</h3>
  </div>
);

const navItems = [
  { name: 'Dashboard', icon: <Activity size={18} />, roles: ['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER'] },
  { name: 'Analytics', icon: <PieChart size={18} />, roles: ['ROLE_ADMIN', 'ROLE_ANALYST'] },
  { name: 'Wallet', icon: <Wallet size={18} />, roles: ['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER'] },
  { name: 'Settings', icon: <SettingsIcon size={18} />, roles: ['ROLE_ADMIN'] }
];

const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, '');

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0, categoryBreakdown: {} });
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [user, setUser] = useState({
    name: localStorage.getItem('userName') || "...",
    role: localStorage.getItem('userRole') || "..."
  });

  const [notification, setNotification] = useState(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    amount: '', category: '', description: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0]
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const authHeaders = useMemo(() => {
    const email = localStorage.getItem('userEmail');
    const pass = localStorage.getItem('userPassword');

    if (!email || !pass) {
      return {
        'Content-Type': 'application/json'
      };
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${email}:${pass}`)
    };
  }, [isLoggedIn]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

 const fetchData = useCallback(() => {
  const config = { headers: authHeaders };

  fetch(`${baseUrl}/api/records`, config)
    .then(async res => {
      if (res.status === 403) {
        showToast("Session Expired: Your account is no longer active.", "error");
        handleLogout();
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.status);
      }
      return res.json();
    })
    .then(data => {
      if (data) {
        const sorted = data.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
        setRecords(sorted);
      }
    })
    .catch(err => {
      if (err.message !== "Forbidden") {
        showToast(`Records sync failed: ${err.message}`, "error");
      }
    });

  fetch(`${baseUrl}/api/records/summary`, config)
    .then(async res => {
      if (res.ok) return res.json();
    })
    .then(data => {
      if (data) setSummary(data);
    })
    .catch(() => {});
}, [authHeaders, baseUrl, handleLogout]);
  const fetchUserProfile = useCallback(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    fetch(`${baseUrl}/api/users/profile?email=${email}`, {
      headers: authHeaders
    })
      .then(res => {
        if (!res.ok) throw new Error("Profile access restricted");
        return res.json();
      })
      .then(data => {
        setUser({
          name: data.businesspartnerfullname || data.name || email.split('@')[0],
          role: data.role || "ROLE_ANALYST"
        });
      })
      .catch(err => {
        console.warn("Profile fetch skipped. Using session data.");
      });
  }, [authHeaders, baseUrl]);

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');

    if (savedName && savedRole && user.name === "...") {
      setUser({ name: savedName, role: savedRole });
    }

    if (isLoggedIn) {
      fetchData();
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const currentTab = navItems.find(item => item.name === activeTab);
    if (currentTab && user.role && !currentTab.roles.includes(user.role)) {
      setActiveTab('Dashboard');
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [user.role, activeTab]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const term = searchTerm.toLowerCase();
      const formattedDate = record.date
        ? new Date(record.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).toLowerCase()
        : '';

      return (
        record.category?.toLowerCase().includes(term) ||
        record.description?.toLowerCase().includes(term) ||
        record.amount?.toString().includes(term) ||
        record.type?.toLowerCase().includes(term) ||
        formattedDate.includes(term)
      );
    });
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const currentRecords = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredRecords, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (user.role === 'ROLE_VIEWER') return showToast("Permission Denied", "error");

    if (!formData.amount || !formData.category) {
      return showToast("Fields cannot be empty", "error");
    }

    const isUpdate = !!formData.id;
    const url = isUpdate ? `${baseUrl}/api/records/${formData.id}` : `${baseUrl}/api/records`;
    const method = isUpdate ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString()
    };

    fetch(url, {
      method: method,
      headers: authHeaders,
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          if (isUpdate) {
            setRecords(prev => prev.map(txn => txn.id === data.id ? data : txn));
          } else {
            setRecords(prev => [data, ...prev]);
          }
          setShowForm(false);
          showToast(isUpdate ? "Transaction Updated" : "Transaction Logged", "success");
          setFormData({
            amount: '', category: '', description: '',
            type: 'EXPENSE', date: new Date().toISOString().split('T')[0]
          });
        } else {
          showToast("Failed to Save: Server Error", "error");
        }
      })
      .catch(() => showToast("Network Error", "error"));
  };
  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (user.role !== 'ROLE_ADMIN') return showToast("Admin Access Required", "error");

    try {
      const response = await fetch(`${baseUrl}/api/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: authHeaders
      });

      if (res.ok) {
        showToast(`User is now ${currentStatus ? 'Inactive' : 'Active'}`, "success");
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("Connection Error", "error");
    }
  };

  const handleDeleteRequest = (id, type = 'record') => {
    if (user.role !== 'ROLE_ADMIN') return showToast("Admin Access Required", "error");
    setDeleteTarget({ id, type });
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;

    const url = type === 'user'
      ? `${baseUrl}/api/users/${id}`
      : `${baseUrl}/api/records/${id}`;

    try {
      const res = await fetch(url, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        if (type === 'user') {
          fetchData();
        } else {
          setRecords(prev => prev.filter(txn => txn.id !== id));
          if ((filteredRecords.length - 1) % recordsPerPage === 0 && currentPage > 1) {
            setCurrentPage(p => p - 1);
          }
        }

        setDeleteTarget(null);
        showToast(`${type === 'user' ? 'User' : 'Transaction'} deleted successfully`, "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "Deletion failed", "error");
      }
    } catch (err) {
      showToast("Network connection failed", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: "...", role: "..." });
    setLoginEmail('');
    setLoginPassword('');
    setIsLoggedIn(false);
    setActiveTab('Dashboard');
    setSearchTerm('');
    showToast("Logged out successfully", "success");
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20, font: { size: 11, weight: '600' }, color: '#64748b' }
      },
      tooltip: { backgroundColor: '#1e293b', padding: 12, titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, cornerRadius: 12, displayColors: true }
    },
    hover: { mode: 'nearest', intersect: true },
    animation: { animateRotate: true, animateScale: true }
  };
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-10 pt-16 rounded-[40px] shadow-2xl w-full max-w-md text-center relative overflow-visible">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white font-black text-3xl italic shadow-2xl shadow-indigo-500/40 border-[6px] border-slate-900">
            F
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tighter text-slate-900 mt-4">Welcome Back</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Enter your credentials to access FinanceOS</p>
          <div className="space-y-5 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Corporate Email</label>
              <input
                type="email"
                placeholder="name@finance.com"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20 transition-all text-sm font-bold text-slate-700"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Security Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500/20 transition-all text-sm font-bold text-slate-700"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-400 hover:text-indigo-600 transition-colors border-none bg-transparent cursor-pointer p-2 outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              disabled={loading}
              onClick={() => {
                setLoading(true);
                const email = loginEmail;
                const pass = loginPassword;
                const basicAuth = 'Basic ' + btoa(`${email}:${pass}`);
                
                fetch(`${baseUrl}/api/records`, {
                  method: 'GET',
                  headers: { 'Authorization': basicAuth, 'Content-Type': 'application/json' }
                })
                .then(async res => {
                  if (res.ok) {
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userPassword', pass);
                    
                    const profileRes = await fetch(`${baseUrl}/api/users/profile?email=${email}`, { 
                      headers: { 'Authorization': basicAuth } 
                    });
                    
                    if (profileRes.ok) {
                      const data = await profileRes.json();
                      
                      if (data.businesspartnerisblocked || data.ismarkedforarchiving) {
                        setLoading(false);
                        showToast("Access Denied: Your account has been deactivated by the Administrator.", "error");
                        return;
                      }
                      
                      const finalName = data.businesspartnerfullname || data.name || email.split('@')[0];
                      const finalRole = data.role || "ROLE_VIEWER";
                      
                      localStorage.setItem('userName', finalName);
                      localStorage.setItem('userRole', finalRole);
                      setUser({ name: finalName, role: finalRole });
                      setIsLoggedIn(true);
                    } else {
                      setIsLoggedIn(true);
                    }
                    setLoading(false);
                  } else {
                    setLoading(false);
                    if (res.status === 401) {
                      showToast("Invalid Credentials: Please verify your email and password.", "error");
                    } else if (res.status === 403) {
                      showToast("Access Denied: Your account is currently inactive. Please contact support.", "error");
                    } else {
                      showToast("Service Unavailable: Unable to reach the finance gateway.", "error");
                    }
                  }
                })
                .catch(() => {
                  setLoading(false);
                  showToast("Network Error: Please check your internet connection.", "error");
                });
              }}
              className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-none disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Secure Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 antialiased overflow-hidden">
      {searchTerm.length === 0 && (
        <aside className="w-72 bg-slate-900 m-4 rounded-[32px] flex flex-col p-8 text-white shadow-2xl hidden lg:flex animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xl italic cursor-default">F</div>
            <span className="text-xl font-bold tracking-tight text-white cursor-default">FinanceOS</span>
          </div>

          <nav className="space-y-2 flex-grow">
            {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); setSearchTerm(''); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-semibold transition-all cursor-pointer outline-none border-none ${activeTab === item.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {item.icon} {item.name}
              </button>
            ))}

            {user.role === 'ROLE_ADMIN' && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-4">Management</p>
                <button
                  onClick={() => { setActiveTab('Provision'); setSearchTerm(''); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-semibold transition-all cursor-pointer outline-none border-none ${activeTab === 'Provision' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <UserPlus size={18} /> Provision User
                </button>
              </div>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between gap-3 group/profile">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 shrink-0 uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-black leading-none truncate w-24">
                    {user.name}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-tighter italic">
                    {user.role.replace('ROLE_', '')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border-none cursor-pointer text-[9px] font-black uppercase tracking-widest shrink-0"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>
      )}

      <main className={`flex-grow p-8 overflow-y-auto relative transition-all duration-500 ${searchTerm.length > 0 ? 'bg-indigo-50/30' : ''}`}>
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 relative z-50">
          <div className={`transition-all duration-500 ${searchTerm.length > 0 ? 'opacity-40 blur-[2px]' : 'opacity-100'}`}>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 cursor-default">{activeTab}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest cursor-default italic">
              Session: {user.role?.replace('ROLE_', '')}
            </p>
          </div>

          <div className="flex gap-4 items-center">
            {activeTab === 'Dashboard' && (
              <div className={`relative flex items-center transition-all duration-500 ${searchTerm.length > 0 ? 'scale-110 -translate-x-12' : ''}`}>
                <Search className={`absolute left-5 transition-colors ${searchTerm.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`} size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className={`pl-13 pr-6 py-4 bg-white rounded-2xl border-none shadow-2xl focus:ring-4 ring-indigo-500/10 text-sm outline-none transition-all ${searchTerm.length > 0 ? 'w-[600px] ring-2 ring-indigo-500' : 'w-80'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm.length > 0 && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-4 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all border-none cursor-pointer">Clear</button>
                )}
              </div>
            )}

            {searchTerm.length === 0 && (
              <div className="relative animate-in fade-in duration-300">
                <button
                  onClick={() => user.role === 'ROLE_ADMIN' && setIsRoleOpen(!isRoleOpen)}
                  className={`flex items-center gap-3 bg-white pl-4 pr-3 py-3 rounded-2xl shadow-sm border border-slate-100 transition-all outline-none ${user.role === 'ROLE_ADMIN' ? 'hover:border-indigo-500 cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Shield size={14} className="text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Active Identity</p>
                    <p className="text-xs font-bold text-slate-800 leading-none uppercase">{user.role?.replace('ROLE_', '')}</p>
                  </div>
                  {user.role === 'ROLE_ADMIN' && (
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {isRoleOpen && user.role === 'ROLE_ADMIN' && (
                  <>
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsRoleOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-50 p-2 z-20 animate-in fade-in zoom-in-95">
                      {['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER'].map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setUser({ ...user, role });
                            setIsRoleOpen(false);
                            setActiveTab('Dashboard');
                            setSearchTerm('');
                            setCurrentPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none border-none ${user.role === role ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          {role.replace('ROLE_', '')}
                          {user.role === role && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 relative">
          {activeTab === 'Dashboard' && (
            <>
              {searchTerm.length === 0 && (
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-500">
                  <StatCard label="Net Balance" amount={summary.netBalance} icon={<Wallet className="text-indigo-600" />} trend="Live" />
                  <StatCard label="Income" amount={summary.totalIncome} icon={<TrendingUp className="text-emerald-600" />} trend="+In" color="text-emerald-600" />
                  <StatCard label="Expenses" amount={summary.totalExpense} icon={<TrendingDown className="text-rose-600" />} trend="-Out" color="text-rose-600" />
                </div>
              )}
              <div className={`transition-all duration-700 ease-in-out ${searchTerm.length > 0 ? 'col-span-12 mt-4' : 'col-span-12 lg:col-span-8'}`}>
                <div className={`bg-white rounded-[40px] transition-all duration-500 ${searchTerm.length > 0 ? 'shadow-2xl ring-1 ring-indigo-100 overflow-hidden' : ''}`}>
                  {searchTerm.length > 0 && (
                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"><Sparkles size={20} /></div>
                        <div><h3 className="text-lg font-black tracking-tight text-slate-900">Intelligence Search</h3><p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Showing {filteredRecords.length} results</p></div>
                      </div>
                    </div>
                  )}
                  {searchTerm.length > 0 && filteredRecords.length === 0 ? (
                    <div className="p-32 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                      <div className="w-24 h-24 bg-rose-50/50 rounded-[32px] flex items-center justify-center mb-8 ring-1 ring-rose-100 shadow-sm"><SearchX size={40} className="text-rose-400 stroke-[1.5]" /></div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 italic">No Matches Found!</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] text-center max-w-sm italic">"Try a different keyword."</p>
                    </div>
                  ) : (
                    <FinancialLog
                      records={currentRecords}
                      totalRecords={filteredRecords.length}
                      user={user}
                      onDelete={handleDeleteRequest}
                      showForm={showForm}
                      setShowForm={setShowForm}
                      formData={formData}
                      setFormData={setFormData}
                      handleSubmit={handleSubmit}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      totalPages={totalPages}
                    />
                  )}
                </div>
              </div>
              {searchTerm.length === 0 && (
                <div className="col-span-12 lg:col-span-4 animate-in fade-in duration-500">
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 cursor-default sticky top-8 transition-all hover:shadow-xl hover:border-indigo-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Category Breakdown</h3>
                    <div className="h-80 w-full">
                      <Pie
                        data={{
                          labels: Object.keys(summary.categoryBreakdown || {}),
                          datasets: [{
                            data: Object.values(summary.categoryBreakdown || {}),
                            backgroundColor: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'],
                            hoverOffset: 20,
                            borderWidth: 2,
                            borderColor: '#ffffff'
                          }]
                        }}
                        options={pieChartOptions}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'Analytics' && (
            <div className="col-span-12 bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm animate-in fade-in duration-500">
              <h3 className="text-xl font-bold mb-6">Cashflow Analytics</h3>
              <div className="h-96">
                {(() => {
                  const last7 = [...records]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(-7);

                  return (
                    <Line
                      data={{
                        labels: last7.map(r => r.date?.split('T')[0]),
                        datasets: [{
                          fill: true,
                          label: 'Amount (₹)',
                          data: last7.map(r => {
                            const numAmount = parseFloat(r.amount) || 0;
                            return r.type === 'EXPENSE' ? -numAmount : numAmount;
                          }),
                          borderColor: '#6366f1',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          tension: 0.4,
                          pointRadius: 6,
                          pointBackgroundColor: '#6366f1',
                        }],
                      }}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'Wallet' && (
            <div className="col-span-12 md:col-span-5 bg-slate-900 p-10 rounded-[40px] relative overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-500">
              <CreditCard className="absolute -right-10 -bottom-10 text-white/5" size={300} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 italic">
                {user.role.replace('ROLE_', '')} ACCOUNT
              </p>
              <h2 className="text-5xl font-black mb-10 tracking-tighter italic">
                ₹{Number(summary.netBalance).toLocaleString()}
              </h2>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Clearance Name</p>
                <p className="font-bold text-xl tracking-tight uppercase">{user.name}</p>
              </div>
            </div>
          )}

          {(activeTab === 'Settings' || activeTab === 'Provision') && user.role === 'ROLE_ADMIN' && (
            <div className="col-span-12 animate-in fade-in duration-500">
         <UserManagement
          authHeaders={authHeaders}
          onDeleteUser={async (id) => {
            handleDeleteRequest(id, 'user');
          }}
          onToggleStatus={async (id) => {
            const response = await fetch(`${baseUrl}/api/users/${id}/toggle-status`, {
              method: 'PATCH',
              headers: { ...authHeaders, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error("Status update failed");
            fetchData();
          }}
        />
        </div>
          )}
        </div>
      </main>

      {notification && (
        <div className="fixed top-10 right-10 z-[1000] animate-in slide-in-from-right-full fade-in duration-500 ease-out">
          <div className={`
            relative overflow-hidden min-w-[320px] px-6 py-5 rounded-[28px] 
            shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl border
            flex items-center gap-5 bg-white/90
            ${notification.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}
          `}>

            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
              ${notification.type === 'success'
                ? 'bg-emerald-500 text-white shadow-emerald-200 animate-bounce'
                : 'bg-rose-500 text-white shadow-rose-200 animate-pulse'}
            `}>
              {notification.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>

            <div className="flex-grow">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${notification.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {notification.type === 'success' ? 'Success Verified' : 'System Error'}
              </h4>
              <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 border-none cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className={`
              absolute bottom-0 left-0 h-1.5 transition-all duration-[3000ms] ease-linear w-full
              ${notification.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}
            `} style={{ animation: 'shrink 3s linear forwards' }}>
              <div className={`h-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}} />
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-100/50">
              <XCircle size={48} className="animate-in zoom-in duration-300" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Final Purge?</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed italic">
              "Action cannot be undone."
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all cursor-pointer outline-none border border-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  setLoading(true);
                  await confirmDeleteAction();
                  setLoading(false);
                }}
                disabled={loading}
                className="flex-1 py-5 bg-rose-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed outline-none border-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
