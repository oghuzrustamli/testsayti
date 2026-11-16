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

  const filteredStudents = selectedClassId === 'all'
    ? students
    : students.filter(s => s.class_id === selectedClassId);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Siniflərim və Şagirdlərim</h1>
          <p className="text-xs text-slate-500">
            Tədris etdiyiniz siniflər, qruplar və qeydiyyatdan keçmiş şagird siyahısı
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddClass(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Sinif Əlavə Et
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Şagird Əlavə Et
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedClassId('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedClassId === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold block ${selectedClassId === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>
            Bütün Siniflər
          </span>
          <h3 className="font-black text-base mt-1">Ümumi Siyahı</h3>
          <span className="text-xs mt-2 block font-semibold">
            {students.length} şagird
          </span>
        </div>

        {classes.map((c) => {
          const isSelected = selectedClassId === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`text-[10px] font-bold block ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`}>
                {c.grade}-ci Sinif
              </span>
              <h3 className="font-black text-base mt-1 truncate">{c.name}</h3>
              <span className="text-xs mt-2 block font-semibold opacity-90">
                {c.student_count || 0} şagird
              </span>
            </div>
          );
        })}
      </div>

      {/* Students List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Şagirdlər ({filteredStudents.length} nəfər)
          </h3>
        </div>

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
                <td colSpan={5} className="py-8 text-center text-slate-400">Şagird tapılmadı.</td>
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
