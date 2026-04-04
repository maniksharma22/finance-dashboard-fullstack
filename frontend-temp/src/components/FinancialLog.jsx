import React from 'react';
import { Filter, CheckCircle2, Trash2, Plus, X, CreditCard, Tag, FileText, Edit3, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const FinancialLog = ({
  records, totalRecords, user, onDelete, showForm, setShowForm,
  formData, setFormData, handleSubmit,
  currentPage, setCurrentPage, totalPages
}) => {

  const handleEditInitiate = (record) => {
    setFormData({
      id: record.id,
      amount: record.amount.toString(),
      category: record.category,
      description: record.description || '',
      type: record.type,
      date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ amount: '', category: '', description: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/50">
        <h3 className="font-bold flex items-center gap-2 text-slate-800 cursor-default">
          <Filter size={16} className="text-slate-400" /> Financial Ledger
        </h3>
        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 cursor-pointer outline-none active:scale-95 border-none"
          >
            <Plus size={16} /> New Entry
          </button>
        )}
      </div>

      <div className="overflow-x-auto p-4 min-h-[480px]">
        <table className="w-full text-left">
          <thead className="text-[11px] font-black uppercase text-slate-400 tracking-widest cursor-default">
            <tr>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5">Details</th>
              <th className="px-6 py-5">Type</th>
              <th className="px-6 py-5 text-right">Value</th>
              {user.role === 'ADMIN' && <th className="px-6 py-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((r) => (
              <tr key={r.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                <td className="px-6 py-5">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600">
                    <CheckCircle2 size={14} /> Success
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                    <Calendar size={14} className="text-slate-300" />
                    {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-sm text-slate-800">{r.category}</p>
                  <p className="text-xs text-slate-400">{r.description || 'No description'}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${r.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {r.type}
                  </span>
                </td>
                <td className={`px-6 py-5 text-right font-black text-base ${r.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  ₹{Number(r.amount).toLocaleString()}
                </td>
                {user.role === 'ADMIN' && (
                  <td className="px-6 py-5 text-center flex items-center justify-center gap-1">
                    <button onClick={() => handleEditInitiate(r)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer outline-none border-none bg-transparent">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => onDelete(r.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer outline-none border-none bg-transparent">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default">
          Showing Page {currentPage} of {totalPages || 1} • {totalRecords} Records
        </p>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer outline-none disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 bg-slate-900 text-white rounded-xl disabled:opacity-30 hover:bg-indigo-600 transition-all cursor-pointer outline-none disabled:cursor-not-allowed border-none"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
              <h4 className="font-black uppercase tracking-tighter text-slate-800 flex items-center gap-2 cursor-default">
                {formData.id ? 'Update Entry' : 'Log Transaction'}
              </h4>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-rose-500 outline-none cursor-pointer border-none bg-transparent">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 cursor-default">Amount</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                    value={formData.amount} 
                    onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 cursor-default">Category</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                    type="text" 
                    required 
                    placeholder={formData.type === 'INCOME' ? 'e.g. Salary, Freelance' : 'e.g. Grocery, Rent'}
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 cursor-default">Flow Type</label>
                <div className="relative">
                  <select 
                    className="w-full pl-6 pr-10 py-3 bg-slate-50 rounded-2xl text-sm font-black border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none uppercase cursor-pointer" 
                    value={formData.type} 
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 cursor-default">Memo</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                    type="text" 
                    placeholder={formData.id ? "Update your notes..." : "What was this for?"}
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all mt-4 cursor-pointer border-none active:scale-95 ${formData.id ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-indigo-600'}`}
              >
                {formData.id ? 'Save Changes' : 'Record Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialLog;