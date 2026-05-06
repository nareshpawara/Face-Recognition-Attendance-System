import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Calendar, Clock, User, Filter, ChevronDown } from 'lucide-react';
import { storage } from '../utils/storage';

const Records = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await storage.getAttendanceLogs();
      setLogs(data.reverse());
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDate === '' || log.date === new Date(filterDate).toLocaleDateString())
  );

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all attendance records?')) {
      await storage.clearLogs();
      setLogs([]);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Date', 'Time'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => `${log.name},${log.date},${log.time}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_records_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Attendance Records</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage history of all attendance events.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={handleClear}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl border border-red-100 dark:border-red-900/30 transition-all flex items-center gap-2"
          >
            <Trash2 size={18} /> Clear Records
          </button>
        </div>
      </header>

      {/* Filters */}
      <section className="glass-card p-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Search size={14} /> Search by Name
          </label>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full md:w-64">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Calendar size={14} /> Filter by Date
          </label>
          <input 
            type="date" 
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </section>

      {/* Table */}
      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-bold text-sm text-slate-500">
                  <div className="flex items-center gap-2"><User size={16} /> Name</div>
                </th>
                <th className="px-6 py-4 font-bold text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Calendar size={16} /> Date</div>
                </th>
                <th className="px-6 py-4 font-bold text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Clock size={16} /> Time</div>
                </th>
                <th className="px-6 py-4 font-bold text-sm text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold">{log.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.date}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.time}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                      PRESENT
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Filter size={40} className="mb-4 opacity-20" />
                      <p className="font-medium">No records found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Records;
