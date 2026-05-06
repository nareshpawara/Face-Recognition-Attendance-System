import React from 'react';
import { Settings as SettingsIcon, Database, Shield, Trash2, Moon, Sun, Download, Upload } from 'lucide-react';
import { storage } from '../utils/storage';

const Settings = () => {
  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all attendance logs? This action cannot be undone.')) {
      await storage.clearLogs();
      alert('Logs cleared successfully!');
    }
  };

  const handleExportData = async () => {
    const users = await storage.getUsers();
    const logs = await storage.getAttendanceLogs();
    const data = {
      users,
      logs,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facepass_backup_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <SettingsIcon size={32} className="text-primary-600" /> Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Configure system preferences and manage your data.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Management */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Database size={20} className="text-primary-600" />
            <h2 className="text-xl font-bold">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleExportData}
              className="w-full btn-secondary flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Download size={18} />
                <span>Backup All Data</span>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-primary-500 transition-colors">JSON</span>
            </button>

            <button 
              disabled
              className="w-full p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center gap-3 cursor-not-allowed"
            >
              <Upload size={18} />
              <span>Restore from Backup (Coming Soon)</span>
            </button>

            <button 
              onClick={handleClearLogs}
              className="w-full p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} />
                <span>Clear Attendance Logs</span>
              </div>
            </button>
          </div>
        </div>

        {/* System & Privacy */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-primary-600" />
            <h2 className="text-xl font-bold">System & Privacy</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-bold">Offline Mode</p>
                <p className="text-xs text-slate-500">All recognition is done locally</p>
              </div>
              <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-bold">Camera Resolution</p>
                <p className="text-xs text-slate-500">Default: 640x480 (SD)</p>
              </div>
              <span className="text-xs font-bold text-primary-600">LOCKED</span>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-xs border border-primary-100 dark:border-primary-900/30">
              <p className="font-bold mb-1">Privacy Notice</p>
              Face embeddings are stored as mathematical vectors. No actual photos are saved in the system database.
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-10 opacity-30">
        <p className="text-sm font-bold">FacePass v1.0.0-Phase2</p>
        <p className="text-xs">Built with React + face-api.js</p>
      </footer>
    </div>
  );
};

export default Settings;
