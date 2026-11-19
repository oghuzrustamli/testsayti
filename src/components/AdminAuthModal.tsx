// src/components/AdminAuthModal.tsx
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { Shield, Lock, X, AlertCircle, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

interface AdminAuthModalProps {
  onSuccess: (adminUser: User) => void;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Administrator şifrəsi daxil edilməlidir');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login('admin@edunex.az', password);
      if (res.user.role === 'admin') {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg('Bu hesab administrator səlahiyyətinə malik deyil');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Şifrə yanlışdır');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 border border-amber-300 dark:border-amber-500/40 shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center overflow-hidden z-10 text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-end relative z-20">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-200 dark:border-slate-700/50 cursor-pointer"
            title="Bağla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Official ATROQ Logo */}
        <div className="flex justify-center mb-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm inline-flex items-center justify-center">
            <img
              src="/assets/atroq-logo.png"
              alt="ATROQ Education Logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-500/40 text-[9.5px] font-mono tracking-widest text-amber-800 dark:text-amber-300 uppercase shadow-xs mb-2">
          <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>CYBER SECURITY CLEARANCE</span>
        </div>

        <h3 className="font-black text-lg text-slate-900 dark:bg-gradient-to-r dark:from-amber-200 dark:via-white dark:to-yellow-200 dark:bg-clip-text dark:text-transparent">
          Administrator Girişi
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Təhlükəsizlik üçün baş administrator şifrəsini daxil edin.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-3.5">
          <div className="relative">
            <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin şifrəsi..."
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 hover:border-amber-500/50 focus:border-amber-500 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs transition-all font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Təsdiqlənir...' : 'GİRİŞİ TƏSDİQLƏ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          Demo şifrə: <strong className="font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">admin123</strong>
        </p>
      </div>
    </div>
  );
};
