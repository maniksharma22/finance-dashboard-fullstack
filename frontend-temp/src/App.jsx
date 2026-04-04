import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Search,
  Shield, PieChart, Activity, Bell, ChevronDown, CheckCircle,
  ArrowUpRight, ArrowDownLeft, CreditCard, Lock, UserPlus,
  Trash2, Settings as SettingsIcon, Sparkles, SearchX
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

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0, categoryBreakdown: {} });
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState({ name: "Manik Sharma", role: "ADMIN" });
  const [notification, setNotification] = useState(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    amount: '', category: '', description: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0]
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin@finance.com:admin123')
  }), []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(() => {
    fetch('http://localhost:8081/api/records', { headers: authHeaders })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.id - a.id;
          });
          setRecords(sortedData);
        } else {
          setRecords([]);
        }
      })
      .catch(() => {
        setRecords([]);
        showToast("System Connection Error", "error");
      });

    fetch('http://localhost:8081/api/records/summary', { headers: authHeaders })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setSummary)
      .catch(() => {
      });
  }, [authHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user.role]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const term = searchTerm.toLowerCase();
      const formattedDate = new Date(record.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).toLowerCase();

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
    if (user.role === 'VIEWER') return showToast("Permission Denied", "error");
    const payload = { ...formData, amount: parseFloat(formData.amount), date: new Date(formData.date).toISOString() };
    fetch('http://localhost:8081/api/records', { method: 'POST', headers: authHeaders, body: JSON.stringify(payload) })
      .then(res => {
        if (res.ok) {
          fetchData(); setShowForm(false); showToast("Transaction Logged");
          setFormData({ amount: '', category: '', description: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0] });
        }
      });
  };

  const handleDeleteRequest = (id, type = 'record') => {
    if (user.role !== 'ADMIN') return showToast("Admin Access Required", "error");
    setDeleteTarget({ id, type });
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    const url = type === 'user' ? `http://localhost:8081/api/users/${id}` : `http://localhost:8081/api/records/${id}`;

    try {
      const res = await fetch(url, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        await fetchData();
        setDeleteTarget(null);
        showToast(`${type === 'user' ? 'Identity' : 'Transaction'} Purged`, "error");
        if (currentRecords.length === 1 && currentPage > 1) {
          setCurrentPage(p => p - 1);
        }
      }
    } catch (err) {
      showToast("Operation Failed", "error");
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: <Activity size={18} />, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { name: 'Analytics', icon: <PieChart size={18} />, roles: ['ADMIN', 'ANALYST'] },
    { name: 'Wallet', icon: <Wallet size={18} />, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { name: 'Settings', icon: <SettingsIcon size={18} />, roles: ['ADMIN'] }
  ];

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
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-semibold transition-all cursor-pointer outline-none border-none ${activeTab === item.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {item.icon} {item.name}
              </button>
            ))}
            {user.role === 'ADMIN' && (
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
          <div className="mt-auto pt-6 border-t border-white/10 cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold">MS</div>
              <div><p className="text-xs font-bold leading-none">{user.name}</p><p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{user.role}</p></div>
            </div>
          </div>
        </aside>
      )}

      <main className={`flex-grow p-8 overflow-y-auto relative transition-all duration-500 ${searchTerm.length > 0 ? 'bg-indigo-50/30' : ''}`}>
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 relative z-50">
          <div className={`transition-all duration-500 ${searchTerm.length > 0 ? 'opacity-40 blur-[2px]' : 'opacity-100'}`}>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 cursor-default">{activeTab}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest cursor-default">Session: {user.role}</p>
          </div>
          <div className="flex gap-4 items-center">
            {activeTab === 'Dashboard' && (
              <div className={`relative flex items-center transition-all duration-500 ${searchTerm.length > 0 ? 'scale-110 -translate-x-12' : ''}`}>
                <Search className={`absolute left-5 transition-colors ${searchTerm.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`} size={18} />
                <input
                  type="text"
                  placeholder="Search by amounts, categories or dates..."
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
                <button onClick={() => setIsRoleOpen(!isRoleOpen)} className="flex items-center gap-3 bg-white pl-4 pr-3 py-3 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-500 transition-all cursor-pointer group outline-none">
                  <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 transition-colors"><Shield size={14} className="text-indigo-600 group-hover:text-white" /></div>
                  <div className="text-left"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Active Identity</p><p className="text-xs font-bold text-slate-800 leading-none">{user.role}</p></div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
                </button>
                {isRoleOpen && (
                  <>
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsRoleOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-50 p-2 z-20 animate-in fade-in zoom-in-95">
                      {['ADMIN', 'ANALYST', 'VIEWER'].map((role) => (
                        <button key={role} onClick={() => { setUser({ ...user, role }); setIsRoleOpen(false); setActiveTab('Dashboard'); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none border-none ${user.role === role ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                          {role} {user.role === role && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
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
                <Line data={{
                  labels: [...new Set(records.map(r => r.date?.split('T')[0]))].sort().slice(-7),
                  datasets: [{
                    fill: true,
                    label: 'Amount (₹)',
                    data: records.map(r => r.type === 'EXPENSE' ? -r.amount : r.amount).slice(-7),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#6366f1',
                  }],
                }} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          )}

          {activeTab === 'Wallet' && (
            <div className="col-span-12 md:col-span-5 bg-slate-900 p-10 rounded-[40px] relative overflow-hidden shadow-2xl text-white animate-in zoom-in-95 duration-500">
              <CreditCard className="absolute -right-10 -bottom-10 text-white/5" size={300} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Primary Account</p>
              <h2 className="text-5xl font-black mb-10 tracking-tighter">₹{Number(summary.netBalance).toLocaleString()}</h2>
              <div><p className="text-[10px] text-slate-400 uppercase font-black">Account Holder</p><p className="font-bold">{user.name}</p></div>
            </div>
          )}

          {(activeTab === 'Settings' || activeTab === 'Provision') && user.role === 'ADMIN' && (
            <div className="col-span-12 animate-in fade-in duration-500">
              <UserManagement
                authHeaders={authHeaders}
                onDeleteUser={(id) => {
                  handleDeleteRequest(id, 'user');
                  return new Promise((resolve) => {
                    const interval = setInterval(() => {
                      if (!deleteTarget) {
                        clearInterval(interval);
                        resolve();
                      }
                    }, 50);
                  });
                }}
              />
            </div>
          )}
        </div>
      </main>

      {notification && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 bg-white ${notification.type === 'success' ? 'border-emerald-500' : 'border-rose-500'}`}>
            <CheckCircle className={notification.type === 'success' ? 'text-emerald-500' : 'text-rose-500'} size={20} />
            <p className="text-sm font-bold text-slate-800">{notification.message}</p>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse"><Trash2 size={48} /></div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Final Purge?</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed italic">"Action cannot be undone."</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all cursor-pointer outline-none border border-slate-100">Cancel</button>
              <button onClick={confirmDeleteAction} className="flex-1 py-5 bg-rose-500 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all cursor-pointer outline-none border-none">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default App;