// src/pages/ClassesPage.tsx
import React, { useState, useEffect } from 'react';
import { User, ClassItem, StudentItem } from '../types';
import { api } from '../lib/api';
import { Users2, GraduationCap, Plus, Search, Trash2, Check, Phone, UserPlus } from 'lucide-react';

interface ClassesPageProps {
  user: User;
}

export const ClassesPage: React.FC<ClassesPageProps> = ({ user }) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'students'>('classes');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Modals / Form
  const [showAddClass, setShowAddClass] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<number>(9);
  const [newClassDesc, setNewClassDesc] = useState<string>('');

  const [showAddStudent, setShowAddStudent] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [clsData, stdData] = await Promise.all([
        api.getClasses(),
        api.getStudents()
      ]);
      setClasses(clsData || []);
      setStudents(stdData || []);
      if (clsData && clsData.length > 0 && !targetClassId) {
        setTargetClassId(clsData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      await api.createClass({
        name: newClassName.trim(),
        grade: newClassGrade,
        description: newClassDesc.trim()
      });
      setNewClassName('');
      setNewClassDesc('');
      setShowAddClass(false);
      loadAll();
    } catch (err) {
      alert('Sinif yaradılarkən xəta');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    try {
      await api.createStudent({
        full_name: newStudentName.trim(),
        phone: newStudentPhone.trim(),
        class_id: targetClassId || undefined
      });
      setNewStudentName('');
      setNewStudentPhone('');
      setShowAddStudent(false);
      loadAll();
    } catch (err) {
      alert('Şagird əlavə edilərkən xəta');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClassId === 'all' || s.class_id === selectedClassId;
    const matchesSearch = !studentSearch.trim() ||
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.student_number && s.student_number.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.phone && s.phone.includes(studentSearch));
    return matchesClass && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Sinif və Şagirdlər</h1>
          <p className="text-xs text-slate-500">
            Tədris etdiyiniz siniflər, qruplar və qeydiyyatdan keçmiş şagird kontingenti
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddClass(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Yeni Sinif Əlavə Et
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Şagird Əlavə Et
          </button>
        </div>
      </div>

      {/* 2-Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Siniflər və Qruplar ({classes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Şagird Kontingenti ({students.length})</span>
        </button>
      </div>

      {/* TAB 1: SİNİFLƏR VƏ QRUPLAR */}
      {activeTab === 'classes' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => {
                setSelectedClassId('all');
                setActiveTab('students');
              }}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
            >
              <span className="text-[10px] font-bold block text-slate-400 uppercase tracking-wider">
                Bütün Siniflər
              </span>
              <h3 className="font-black text-lg mt-1 text-slate-900 group-hover:text-indigo-600">Ümumi Kontingent</h3>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{students.length} şagird</span>
                <span className="text-indigo-600 font-bold group-hover:underline">Hamısına bax →</span>
              </div>
            </div>

            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedClassId(c.id);
                  setActiveTab('students');
                }}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {c.grade}-ci Sinif
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {c.student_count || 0} şagird
                    </span>
                  </div>
                  <h3 className="font-black text-base mt-2 text-slate-900 group-hover:text-indigo-600 truncate">{c.name}</h3>
                  {c.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Qrup / Bölmə</span>
                  <span className="text-indigo-600 font-bold group-hover:underline">Şagirdləri aç →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ŞAGİRD KONTİNGENTİ */}
      {activeTab === 'students' && (
        <div className="flex flex-col gap-4">
          {/* Controls bar: search and filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Şagird adı, nömrəsi və ya telefon axtar..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
                <span>Sinif Filteri:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">Bütün Siniflər ({students.length})</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade}-ci sinif • {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Göstərilir: <span className="text-indigo-600 font-black">{filteredStudents.length}</span> şagird
            </div>
          </div>

          {/* Students List Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">№</th>
                  <th className="py-3 px-4">Ad və Soyad</th>
                  <th className="py-3 px-4">Şagird Kodu</th>
                  <th className="py-3 px-4">Sinif / Qrup</th>
                  <th className="py-3 px-4">Əlaqə Nömrəsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Şagird tapılmadı.</td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.full_name}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-700">{s.student_number}</td>
                      <td className="py-3 px-4 text-slate-600">{s.class_name || 'Təyin edilməyib'}</td>
                      <td className="py-3 px-4 text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {s.phone || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">Yeni Sinif / Qrup Əlavə Et</h3>
            <form onSubmit={handleCreateClass} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sinif Adı:</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Məsələn: 10-A Sinfi"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dərəcə (Sinif):</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => (
                    <option key={g} value={g}>{g}-ci sinif</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Açıqlama:</label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Məsələn: Blok I qrup abituriyent hazırlığı"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="w-1/2 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow"
                >
                  Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">Yeni Şagird Qeydiyyatı</h3>
            <form onSubmit={handleCreateStudent} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ad və Soyad:</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Məsələn: Əli Həsənov"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sinif:</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telefon / Valideyn əlaqə:</label>
                <input
                  type="text"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="+994 50 123 45 67"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
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
