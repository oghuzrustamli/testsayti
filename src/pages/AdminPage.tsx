// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { User, ActivationCode, AuditLog } from '../types';
import { api } from '../lib/api';
import { PRO_PACKAGES } from '../lib/constants';
import {
  Shield,
  Key,
  Users,
  CreditCard,
  History,
  TrendingUp,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Power,
  RefreshCw,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface AdminPageProps {
  currentUser: User;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'codes' | 'stats' | 'audit'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchUser, setSearchUser] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal: Generate Codes
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [genDuration, setGenDuration] = useState<number>(1);
  const [genCount, setGenCount] = useState<number>(5);

  // Modal: Add User
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newRole, setNewRole] = useState<'teacher' | 'student' | 'admin'>('teacher');
  const [newIsPro, setNewIsPro] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, codesData, logsData, statsData] = await Promise.all([
        api.getUsers(),
        api.getActivationCodes(),
        api.getAuditLogs(),
        api.getAdminStats()
      ]);
      setUsers(usersData || []);
      setCodes(codesData || []);
      setAuditLogs(logsData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (user: User) => {
    try {
      const nextStatus = user.status === 'active' ? 'inactive' : 'active';
      await api.updateUser(user.id, {
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        school: user.school,
        status: nextStatus,
        is_pro: user.is_pro,
        pro_expires_at: user.pro_expires_at
      });
      loadData();
    } catch {
      alert('Status dəyişdirilərkən xəta');
    }
  };

  const handleExtendUserPro = async (user: User, months: number) => {
    try {
      const now = new Date();
      let baseDate = now;
      if (user.is_pro && user.pro_expires_at && new Date(user.pro_expires_at) > now) {
        baseDate = new Date(user.pro_expires_at);
      }
      const newExp = new Date(baseDate);
      newExp.setMonth(newExp.getMonth() + months);

      await api.updateUser(user.id, {
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        school: user.school,
        status: user.status,
        is_pro: true,
        pro_expires_at: newExp.toISOString()
      });
      alert(`${user.full_name} üçün PRO müddəti ${months} ay uzadıldı`);
      loadData();
    } catch {
      alert('Xəta baş verdi');
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.generateActivationCodes(genDuration, genCount);
      setShowGenModal(false);
      loadData();
    } catch (err) {
      alert('Kod yaradılarkən xəta');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        email: newEmail.trim(),
        password: newPassword.trim(),
        full_name: newFullName.trim(),
        phone: newPhone.trim(),
        role: newRole,
        is_pro: newIsPro,
        duration_months: 12
      });
      setShowAddUser(false);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'İstifadəçi yaradılarkən xəta');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.phone && u.phone.includes(searchUser))
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-md">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">ATROQ Education Administrator Paneli</h1>
            <p className="text-xs text-slate-500">
              İstifadəçi idarəsi, PRO aktivasiya kodları generatoru və təhlükəsizlik audit jurnalı
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            İstifadəçilər
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'codes' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Aktivasiya Kodları
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'stats' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Statistika
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Audit Jurnalı
          </button>
        </div>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="İstifadəçi adı, email və ya telefon..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <button
              onClick={() => setShowAddUser(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Yeni İstifadəçi Əlavə Et
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">İstifadəçi</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">PRO Statusu</th>
                    <th className="py-3 px-4">Bitmə Tarixi</th>
                    <th className="py-3 px-4 text-center">Hesab Statusu</th>
                    <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isPro = u.is_pro;
                    const isActive = u.status === 'active';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{u.full_name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-semibold text-slate-700">
                            {u.role === 'admin' ? 'Administrator' : u.role === 'teacher' ? 'Müəllim' : 'Şagird'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.phone || '-'}</td>
                        <td className="py-3 px-4">
                          {isPro ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                              PRO Aktiv
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-500">
                              Standart
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {u.pro_expires_at ? new Date(u.pro_expires_at).toLocaleDateString('az-AZ') : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isActive ? 'Aktiv' : 'Deaktiv'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleExtendUserPro(u, 3)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-bold text-[11px] border border-amber-200"
                              title="+3 Ay PRO Uzat"
                            >
                              +3 Ay
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`p-1.5 rounded transition-colors ${
                                isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Hesabı Deaktiv Et' : 'Hesabı Aktivləşdir'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVATION CODES (Section XV & XVI) */}
      {activeTab === 'codes' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">PRO Aktivasiya Kodları</h3>
              <p className="text-xs text-slate-400">Yaradılmış bütün unikal kodlar və istifadə vəziyyətləri</p>
            </div>

            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Key className="w-4 h-4" />
              Yeni Kodlar Generasiya Et
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Kod</th>
                    <th className="py-3 px-4">Müddət</th>
                    <th className="py-3 px-4">Məbləğ</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">İstifadəçi</th>
                    <th className="py-3 px-4">İstifadə Tarixi</th>
                    <th className="py-3 px-4 text-right">Kopyala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {codes.map((c) => {
                    const isUsed = c.is_used === 1;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-indigo-700 font-mono">{c.code}</td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-700">{c.duration_months} ay</td>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">{c.amount_azn} AZN</td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isUsed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isUsed ? 'İstifadə olunub' : 'Aktiv (İstifadəsiz)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-600">{c.used_by_name || '-'}</td>
                        <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">
                          {c.used_at ? new Date(c.used_at).toLocaleDateString('az-AZ') : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleCopy(c.code)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                            title="Kopyala"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM STATS */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ümumi İstifadəçi</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total_users}</span>
            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">{stats.pro_users} PRO abunəçi</span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Yaradılmış Testlər</span>
            <span className="text-2xl font-black text-indigo-700 mt-1 block">{stats.total_tests}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Sistemdə aktiv</span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sual Bankında Cəmi</span>
            <span className="text-2xl font-black text-violet-700 mt-1 block">{stats.total_questions}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Sual mövcuddur</span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keçirilən İmtahanlar</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.completed_exams}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Şagird sessiyası</span>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS (Section XVIII & XV) */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Təhlükəsizlik və Əməliyyat Jurnalı</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tarix</th>
                  <th className="py-3 px-4">İstifadəçi</th>
                  <th className="py-3 px-4">Əməliyyat</th>
                  <th className="py-3 px-4">Təfərrüat</th>
                  <th className="py-3 px-4">IP Ünvan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString('az-AZ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.user_name}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Generate Codes */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">Yeni Aktivasiya Kodları Generasiyası</h3>
            <form onSubmit={handleGenerateCodes} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Paket Müddəti:</label>
                <select
                  value={genDuration}
                  onChange={(e) => setGenDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value={1}>1 Aylıq Paket (7 AZN)</option>
                  <option value={3}>3 Aylıq Paket (20 AZN)</option>
                  <option value={6}>6 Aylıq Paket (40 AZN)</option>
                  <option value={12}>12 Aylıq Paket (60 AZN)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Yaradılacaq Kod Sayı:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="w-1/2 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow"
                >
                  Generasiya Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">Yeni İstifadəçi Əlavə Et</h3>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ad və Soyad:</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Məsələn: Rəşad Əliyev"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email:</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@atroq.edu.az"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Şifrə:</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 simvol"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rol:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="teacher">Müəllim</option>
                    <option value="student">Şagird</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PRO Hesab:</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newIsPro}
                      onChange={(e) => setNewIsPro(e.target.checked)}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span>1 İllik PRO verilsin</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="w-1/2 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow"
                >
                  Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
