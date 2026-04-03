import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Trash2, UserPlus, X, Lock, Mail, ChevronDown, Search, SearchX, Edit3, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManagement = ({ authHeaders, onDeleteUser }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'ROLE_ANALYST' });

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const fetchUsers = () => {
    fetch('http://localhost:8081/api/users', { headers: authHeaders })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  };

  useEffect(() => { fetchUsers(); }, []);

  // FIX: Async wait for parent modal to finish before refreshing the local list
  const handleDelete = async (id) => {
    await onDeleteUser(id);
    fetchUsers(); 
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = useMemo(() => {
    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    return filteredUsers.slice(indexOfFirst, indexOfLast);
  }, [filteredUsers, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const openEditModal = (user) => {
    setIsEditing(true);
    setSelectedUserId(user.id);
    setNewUser({ email: user.email, password: '', role: user.role });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setSelectedUserId(null);
    setNewUser({ email: '', password: '', role: 'ROLE_ANALYST' });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const url = isEditing
      ? `http://localhost:8081/api/users/${selectedUserId}`
      : 'http://localhost:8081/api/users';

    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).then(res => {
      if (res.ok) {
        setSuccess(isEditing ? "Identity Updated" : "Identity Deployed");
        fetchUsers();
        setTimeout(() => handleCloseModal(), 1500);
      } else {
        setError("Action could not be completed.");
      }
    }).catch(() => {
      setError("System unreachable.");
    });
  };

  const toggleUserStatus = (id, currentStatus) => {
    fetch(`http://localhost:8081/api/users/${id}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !currentStatus })
    }).then(res => {
      if (res.ok) fetchUsers();
    });
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mt-8">
      {/* Header Section */}
      <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-white gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Identity Manager</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Access Governance</p>
          </div>
        </div>

        <div className="flex flex-1 max-w-md items-center relative">
          <Search size={18} className="absolute left-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search identities..."
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 cursor-pointer border-none shadow-xl shadow-slate-100 active:scale-95 outline-none">
          <UserPlus size={16} /> Provision User
        </button>
      </div>

      {/* Table Section */}
      <div className="px-6 pb-2 overflow-x-auto min-h-[400px]">
        {currentUsers.length > 0 ? (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-6 py-4 text-left">Identity Profile</th>
                <th className="px-6 py-4 text-center">System Role</th>
                <th className="px-6 py-4 text-center">Current Status</th>
                <th className="px-6 py-4 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u) => (
                <tr key={u.id} className="group transition-all hover:translate-x-1">
                  <td className="px-6 py-5 bg-slate-50/50 rounded-l-[24px]">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                        {u.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800 leading-tight">{u.email}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Ref ID: {String(u.id).padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'ROLE_ADMIN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-600'}`}>
                      {u.role?.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 text-center">
                    <button
                      onClick={() => toggleUserStatus(u.id, u.active)}
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none border ${u.active ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {u.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-5 bg-slate-50/50 rounded-r-[24px] text-right pr-10">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(u)} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border-none bg-transparent outline-none active:scale-90"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-none bg-transparent outline-none active:scale-90"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchX size={32} className="text-slate-300 mb-4" />
            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">No Identities Found</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="px-10 py-6 border-t border-slate-50 flex items-center justify-between bg-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Displaying {currentUsers.length} of {filteredUsers.length} Units
        </p>
        <div className="flex items-center gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all cursor-pointer bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
            {currentPage} / {totalPages || 1}
          </span>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all cursor-pointer bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Modal - Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
              <h4 className="font-black uppercase tracking-tighter text-slate-900 text-xl flex items-center gap-3">
                {isEditing ? <Edit3 size={22} className="text-indigo-600" /> : <UserPlus size={22} className="text-indigo-600" />}
                {isEditing ? "Modify Access" : "Create Access"}
              </h4>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl cursor-pointer border-none outline-none"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest border border-rose-100">
                  <AlertCircle size={18} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest border border-emerald-100">
                  <CheckCircle2 size={18} /> {success}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Identity (Email)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none" type="email" required placeholder="user@domain.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Security Key {isEditing && "(Leave blank to keep)"}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none" type="password" required={!isEditing} placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Privilege Level</label>
                <div className="relative">
                  <Shield size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select className="w-full pl-14 pr-12 py-4 bg-slate-50 rounded-2xl text-sm font-black ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none uppercase cursor-pointer" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="ROLE_ANALYST">Analyst Access</option>
                    <option value="ROLE_VIEWER">Viewer Access</option>
                    <option value="ROLE_ADMIN">Root Admin</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button type="submit" disabled={!!success} className={`w-full py-5 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] transition-all mt-4 active:scale-95 cursor-pointer border-none outline-none ${success ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-indigo-600'}`}>
                {success ? "Deployed" : isEditing ? "Update Identity" : "Deploy Identity"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;