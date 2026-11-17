// src/components/ProActivationModal.tsx
// EDUNEX PRO & Abunəlik Modalı (Kompakt 1.5x kiçildilmiş ölçü və aydın çıxış düyməsi)
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
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Aktivasiya kodu yanlışdır və ya artıq istifadə olunub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      {/* Modal Dialog Container - 1.5x kiçildilmiş kompakt ölçü */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150 relative"
      >
        {/* Sabit Yuxarı Başlıq və Çıxış (X) Düyməsi */}
        <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-800 px-3.5 py-2.5 text-white flex items-center justify-between shrink-0 shadow-xs relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-md font-black text-[10px] flex items-center gap-1 shadow-2xs">
              <Crown className="w-3 h-3 fill-current" /> EDUNEX PRO
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold">
              Abunəlik
            </span>
          </div>

          {/* Aydın və Görünən Çıxış (X) Düyməsi */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 bg-white/25 hover:bg-white/40 active:scale-90 rounded-full text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/30"
            title="Pəncərəni bağla (ESC)"
            aria-label="Pəncərəni bağla"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Scrollable İç Məzmun - 1.5x Kompakt Ölçülər */}
        <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 overflow-y-auto scrollbar-thin">
          {/* Məlumat Başlığı */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
            <h3 className="text-[11px] font-black text-slate-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Müəllim üçün Limitsiz İmtahan İmkanları
            </h3>
            <p className="text-[9.5px] text-slate-500 mt-0.5 leading-snug">
              Limitsiz test və sual yaratma, AI test generatoru, riyazi düstur klaviaturası və ani OMR analitikası.
            </p>
          </div>

          {/* Aktivasiya Kodu Formu */}
          <div className="p-2.5 bg-gradient-to-b from-indigo-50/70 to-white rounded-xl border border-indigo-100 shadow-2xs">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Key className="w-3 h-3 text-indigo-600" />
              Aktivasiya Kodu ilə Qoşulma
            </h4>
            <p className="text-[9px] text-slate-500 mb-2 leading-tight">
              Məktəbinizdən və ya nümayəndədən aldığınız aktivasiya kodunu daxil edin.
            </p>

            {errorMsg && (
              <div className="p-1.5 mb-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[9.5px] rounded-lg flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-1.5 mb-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9.5px] rounded-lg flex items-center gap-1 font-bold">
                <Check className="w-3 h-3 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleActivate} className="flex gap-1.5">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="Məs: EDX-PRO1-9842"
                className="flex-1 h-7 px-2.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-7 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10.5px] font-bold shadow-xs transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Yoxlanılır...' : 'Aktivləşdir'}
              </button>
            </form>
          </div>

          {/* Rəsmi PRO Paketlər Cədvəli (2x2 Kompakt Qrid) */}
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Rəsmi EDUNEX PRO Paketləri və Qiymətləri
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {PRO_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/60 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-slate-900 text-[11px] truncate">{pkg.title}</span>
                      {pkg.badge && (
                        <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 shrink-0">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-slate-900 my-0.5">
                      {pkg.priceAzn} <span className="text-[9px] font-bold text-slate-500">AZN</span>
                    </div>
                    <ul className="flex flex-col gap-0.5 text-[9px] text-slate-600">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1 leading-tight">
                          <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">Kod daxil et</span>
                    <button
                      type="button"
                      onClick={() => setActivationCode(`EDX-PRO${pkg.months}-`)}
                      className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Seç &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Altlığı - Çıxış / Bağla */}
        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[9.5px] text-slate-400 font-medium">
            ESC və ya kənara klikləyərək bağlaya bilərsiniz
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
