// src/components/ProActivationModal.tsx
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { PRO_PACKAGES } from '../lib/constants';
import { Crown, Check, Sparkles, X, ShieldCheck, Key, AlertCircle } from 'lucide-react';

interface ProActivationModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

export const ProActivationModal: React.FC<ProActivationModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [activationCode, setActivationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setErrorMsg('Aktivasiya kodunu daxil edin');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.activatePro(user.id, activationCode.trim());
      setSuccessMsg(res.message || 'PRO paket uğurla aktivləşdirildi!');
      setTimeout(() => {
        onSuccess({
          ...user,
          is_pro: true,
          pro_expires_at: res.pro_expires_at
        });
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Aktivasiya kodu yanlışdır və ya artıq istifadə olunub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm">
              <Crown className="w-4 h-4 fill-current" /> EDUNEX PRO
            </span>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
              Rəsmi Təhsil Abunəliyi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Müəllim üçün Limitsiz İmtahan İmkankarı
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-lg">
            Limitsiz testlər, tam sual bankı, riyazi düstur klaviaturası, qrafik laboratoriyası və dərhal Excel/PDF analitikası.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Activation Code Form */}
          <div className="p-5 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl border border-indigo-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              Aktivasiya Kodu ilə Qoşulma
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Məktəbinizdən və ya EDUNEX rəsmi nümayəndəsindən aldığınız unikal aktivasiya kodunu daxil edin.
            </p>

            {errorMsg && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="Məsələn: EDX-PRO1-9842"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? 'Yoxlanılır...' : 'Aktivləşdir'}
              </button>
            </form>
          </div>

          {/* Official Packages List */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Rəsmi EDUNEX PRO Paketləri və Qiymətləri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRO_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{pkg.title}</span>
                      {pkg.badge && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-slate-900 my-2">
                      {pkg.priceAzn} <span className="text-xs font-bold text-slate-500">AZN</span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-[11px] text-slate-600">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">Aktivasiya kodu tələb olunur</span>
                    <button
                      onClick={() => setActivationCode(`EDX-PRO${pkg.months}-`)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Kodu daxil et &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
