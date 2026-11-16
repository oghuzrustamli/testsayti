// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { Settings, User as UserIcon, Shield, Crown, Save, Check, Key } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  onOpenProModal: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onOpenProModal,
  onUserUpdate,
}) => {
  const [fullName, setFullName] = useState<string>(user.full_name || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [school, setSchool] = useState<string>(user.school || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.updateUser(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        role: user.role,
        school: school.trim(),
        status: user.status,
        is_pro: user.is_pro,
        pro_expires_at: user.pro_expires_at,
        password: newPassword.trim() || undefined
      });
      const updated: User = {
        ...user,
        full_name: fullName.trim(),
        phone: phone.trim(),
        school: school.trim()
      };
      onUserUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Yeniləmə zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Hesab Parametrləri</h1>
        <p className="text-xs text-slate-500">
          Şəxsi profil məlumatları, tədris etdiyiniz məktəb və PRO abunəlik vəziyyəti
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
          <Check className="w-4 h-4 text-emerald-600" />
          Məlumatlarınız uğurla yadda saxlanıldı!
        </div>
      )}

      {/* PRO Status Box */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-indigo-50/50 to-white border border-amber-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-sm">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {user.is_pro ? 'EDUNEX PRO Abunəliyi Aktivdir' : 'Standart Hesab'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.is_pro && user.pro_expires_at
                ? `Bitmə tarixi: ${new Date(user.pro_expires_at).toLocaleDateString('az-AZ')} (Bütün riyazi və qrafik funksiyalar limitsiz)`
                : 'Limitsiz sual bankı və qrafik laboratoriyası üçün PRO paketə keçin'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenProModal}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          {user.is_pro ? 'Paketi Yenilə / Uzat' : 'PRO-ya Yüksəlt'}
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-indigo-600" /> Şəxsi Məlumatlar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ad və Soyad:</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Ünvanı:</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-xl text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Əlaqə Telefonu:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994 50 123 45 67"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Məktəb / Lisey:</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Məsələn: 287 nömrəli Zəkalar liseyi"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-1">Yeni Şifrə (dəyişmək istəmirsinizsə boş buraxın):</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full max-w-sm px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-max px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Saxla'}
        </button>
      </form>
    </div>
  );
};
