// src/components/AuthModal.tsx
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';
import { NAKHCHIVAN_DISTRICTS, DISTRICT_SCHOOLS } from '../lib/nakhchivanData';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  School,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Zap,
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Naxçıvan şəhəri');
  const [school, setSchool] = useState<string>('1 nömrəli tam orta məktəb');
  const [teacherUtisCode, setTeacherUtisCode] = useState<string>('');
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('E-poçt və şifrə daxil edilməlidir');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login(email.trim(), password);
      setSuccessMsg('Giriş təsdiqləndi! Sistemə qoşulur...');
      setTimeout(() => {
        onSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'E-poçt və ya şifrə yanlışdır');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg('Bütün vacib xanaları doldurun');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Şifrə minimum 6 simvoldan ibarət olmalıdır');
      return;
    }

    if (role === 'teacher') {
      const cleanUtis = teacherUtisCode.trim();
      if (!cleanUtis || !/^\d{7}$/.test(cleanUtis)) {
        setErrorMsg('Müəllimin UTİS kodu mütləq daxil edilməli və dəqiq 7 rəqəmdən ibarət olmalıdır (Məsələn: 1048291)');
        return;
      }
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim(),
        school: role === 'teacher' ? `${school} (${selectedDistrict})` : school.trim(),
        role,
      });
      setSuccessMsg('Qeydiyyat uğurla tamamlandı! Xoş gəldiniz!');
      setTimeout(() => {
        onSuccess(res.user);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Qeydiyyat zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Demo Quick-Logins
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.login(demoEmail, demoPass);
      setSuccessMsg('Sürətli demo girişi təsdiqləndi!');
      setTimeout(() => {
        onSuccess(res.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo girişi xətası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Cyberpunk Ambient Dark Backdrop with Animated Glow */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Futuristic Modal Container */}
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)] p-6 sm:p-8 overflow-hidden z-10 text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Futuristic Background Tech Grid & Light Flares */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer z-20 border border-slate-700/50 hover:border-cyan-500/40"
          title="Bağla"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Futuristic Status Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono tracking-widest text-cyan-300 uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>EDUNEX QUANTUM v2.5 • AI PORTAL</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            {mode === 'login' ? 'Gələcəyin İmtahan Platforması' : 'Yeni Hesab Qeydiyyatı'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Hesabınıza daxil olaraq sınaqlar və OMR kartlarını idarə edin'
              : 'EDUNEX platformasına qoşularaq innovativ imtahanlar yaradın'}
          </p>
        </div>

        {/* Futuristic Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl mb-5 relative">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Daxil Ol</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-purple-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Qeydiyyat</span>
          </button>
        </div>

        {/* Alerts: Error & Success */}
        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs rounded-xl flex items-center gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2 text-left animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* LOGIN FORM                                                     */}
        {/* ============================================================== */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                E-POÇT ÜNVANI
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="məsələn: muellim@edunex.az"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                ŞİFRƏ
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Yoxlanılır...' : 'SİSTEMƏ DAXİL OL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Futuristic Demo Quick-Logins */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 block mb-2 text-center uppercase">
                ⚡ Sürətli Demo Girişləri
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('muellim@edunex.az', 'muellim123')}
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex flex-col items-center gap-1 transition-all cursor-pointer group"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Müəllim</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('sagird@edunex.az', 'sagird123')}
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex flex-col items-center gap-1 transition-all cursor-pointer group"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Şagird</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@edunex.az', 'admin123')}
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-amber-300 flex flex-col items-center gap-1 transition-all cursor-pointer group"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ============================================================== */
          /* REGISTRATION FORM                                              */
          /* ============================================================== */
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            {/* Role Selection */}
            <div>
              <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                ROL SEÇİMİ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    role === 'teacher'
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block leading-tight">Müəllim</span>
                    <span className="text-[9px] text-slate-400 block">Sınaq təşkilatçısı</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    role === 'student'
                      ? 'bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block leading-tight">Şagird</span>
                    <span className="text-[9px] text-slate-400 block">Test iştirakçısı</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                AD VƏ SOYAD <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Məsələn: Rəşad Əliyev"
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                  E-POÇT <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ad@edunex.az"
                    className="w-full pl-9 pr-2.5 py-2 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                  TELEFON
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+994 50 123 45 67"
                    className="w-full pl-9 pr-2.5 py-2 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Teacher District, School & UTİS (Tələb 5: Məcburi Əlaqələndirmə) */}
            {role === 'teacher' ? (
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Müəllim Məktəb & UTİS Qeydiyyatı
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-300 block mb-1">
                      RAYON / ŞƏHƏR <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setSelectedDistrict(newDist);
                        const list = DISTRICT_SCHOOLS[newDist];
                        if (list && list.length > 0) setSchool(list[0]);
                      }}
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      {NAKHCHIVAN_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-300 block mb-1">
                      İŞLƏDİYİNİZ MƏKTƏB <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      {(DISTRICT_SCHOOLS[selectedDistrict] || []).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-300 block mb-1">
                    MÜƏLLİMİN 7 RƏQƏMLİ UTİS KODU <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={teacherUtisCode}
                    onChange={(e) => setTeacherUtisCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Məsələn: 2049182"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-mono font-bold tracking-widest focus:outline-none focus:border-cyan-400 placeholder-slate-600"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                  MƏKTƏB / LİSEY / MƏRKƏZ
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Məsələn: Bakı şəhəri Zəkalar Liseyi"
                    className="w-full pl-10 pr-3 py-2 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-[11px] font-mono tracking-wider text-slate-300 block mb-1">
                TƏHLÜKƏSİZ ŞİFRƏ (MİN. 6 SİMVOLDAN) <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 text-xs bg-slate-950/70 border border-slate-700/80 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Yaradılır...' : 'HESAB YARAT VƏ BAŞLA'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            © 2026 EDUNEX AI Neural Test Suite • Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </div>
  );
};
