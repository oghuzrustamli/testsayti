// src/components/ProActivationModal.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { PRO_PACKAGES } from '../lib/constants';
import { Crown, Check, Sparkles, X, Key, AlertCircle } from 'lucide-react';

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

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Aktivasiya kodu yanlışdır və ya artıq istifadə olunub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150"
    >
      {/* Modal Dialog Container - Compact 1.5x scaled down */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150 relative"
      >
        {/* Permanent Sticky Top Header with Always-Visible Close Button */}
        <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-800 px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-lg font-black text-[10px] flex items-center gap-1 shadow-2xs">
              <Crown className="w-3 h-3 fill-current" /> EDUNEX PRO
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              Rəsmi Abunəlik
            </span>
          </div>

          {/* Həmişə Görünən Çıxış / Bağla (X) Düyməsi */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 bg-white/20 hover:bg-white/40 active:scale-95 rounded-full text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/20"
            title="Pəncərəni bağla (ESC)"
            aria-label="Pəncərəni bağla"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Modal Body - Compact 1.5x Layout */}
        <div className="p-4 flex flex-col gap-3.5 overflow-y-auto scrollbar-thin">
          {/* Subtitle Banner text */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <h3 className="text-xs font-black text-slate-900">
              Müəllim üçün Limitsiz İmtahan İmkankarı
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Limitsiz test və sual yaratma, tam sual bankı, riyazi düstur klaviaturası, qrafik laboratoriyası və dərhal Excel/PDF analitikası.
            </p>
          </div>

          {/* Activation Code Form - Compact */}
          <div className="p-3 bg-gradient-to-b from-indigo-50/60 to-white rounded-xl border border-indigo-100 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                Aktivasiya Kodu ilə Qoşulma
              </h4>
            </div>
            <p className="text-[10px] text-slate-500 mb-2 leading-tight">
              Məktəbinizdən və ya EDUNEX nümayəndəsindən aldığınız aktivasiya kodunu daxil edin.
            </p>

            {errorMsg && (
              <div className="p-2 mb-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2 mb-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg flex items-center gap-1.5 font-bold">
                <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleActivate} className="flex gap-2">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="Məs: EDX-PRO1-9842"
                className="flex-1 h-8 px-3 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Yoxlanılır...' : 'Aktivləşdir'}
              </button>
            </form>
          </div>

          {/* Official Packages List - Compact 2-column Grid */}
          <div>
            <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider mb-2">
              Rəsmi EDUNEX PRO Paketləri və Qiymətləri
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {PRO_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-3 rounded-xl border border-slate-200/90 hover:border-indigo-300 bg-white hover:bg-slate-50/60 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 text-xs truncate">{pkg.title}</span>
                      {pkg.badge && (
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 shrink-0">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-slate-900 my-1">
                      {pkg.priceAzn} <span className="text-[10px] font-bold text-slate-500">AZN</span>
                    </div>
                    <ul className="flex flex-col gap-1 text-[10px] text-slate-600">
                      {pkg.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 leading-tight">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Aktivasiya kodu</span>
                    <button
                      type="button"
                      onClick={() => setActivationCode(`EDX-PRO${pkg.months}-`)}
                      className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Kodu daxil et &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer with Close Action */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-medium">
            ESC və ya kənara klikləyərək bağlaya bilərsiniz
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
