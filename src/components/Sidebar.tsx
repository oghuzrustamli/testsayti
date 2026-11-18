// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  FileCheck,
  LayoutDashboard,
  PlusCircle,
  FileQuestion,
  Database,
  Users2,
  GraduationCap,
  Share2,
  BarChart3,
  TrendingUp,
  Archive,
  Settings,
  Shield,
  Key,
  CreditCard,
  History,
  BookOpen,
  CheckCircle2,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
  Cpu
} from 'lucide-react';

export type TeacherTab =
  | 'dashboard'
  | 'create_test'
  | 'ai_test'
  | 'exams_hub'
  | 'exams_subjects'
  | 'exams_grades'
  | 'my_tests'
  | 'omr_test'
  | 'question_bank'
  | 'classes'
  | 'results'
  | 'statistics'
  | 'regional_stats'
  | 'archive'
  | 'about'
  | 'settings';

export type AdminTab =
  | 'users'
  | 'activation_codes'
  | 'packages'
  | 'subscriptions'
  | 'stats'
  | 'regional_stats'
  | 'about'
  | 'settings'
  | 'audit';

export type StudentTab =
  | 'enter_test'
  | 'active_tests'
  | 'completed_tests'
  | 'results'
  | 'regional_stats'
  | 'about'
  | 'profile';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  className?: string;
}

interface NavSubItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
  subItems?: NavSubItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  className = '',
}) => {
  // Accordion state for Sınaq İmtahanları
  const isExamsActive = activeTab === 'exams_hub' || activeTab === 'exams_subjects' || activeTab === 'exams_grades' || activeTab === 'my_tests';
  const [examsExpanded, setExamsExpanded] = useState<boolean>(true);

  // Navigation menus based on user role
  const teacherNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create_test', label: 'Yeni test yarat', icon: PlusCircle, highlight: true },
    { id: 'ai_test', label: 'AI ilə test yarat', icon: Sparkles, badge: 'AI', highlight: false },
    {
      id: 'exams_hub',
      label: 'Sınaq imtahanları',
      icon: BookOpen,
      subItems: [
        { id: 'exams_subjects', label: 'Fənlər', icon: Layers },
        { id: 'exams_grades', label: 'Siniflər', icon: GraduationCap },
        { id: 'my_tests', label: 'Bütün Testlərim', icon: FileQuestion },
      ]
    },
    { id: 'classes', label: 'Sinif və Şagirdlər', icon: Users2 },
    { id: 'results', label: 'Nəticələr', icon: BarChart3 },
    { id: 'statistics', label: 'Statistika', icon: TrendingUp },
    { id: 'regional_stats', label: 'Regional statistika', icon: Award, badge: 'NMR' },
    { id: 'about', label: 'Haqqında', icon: Cpu, badge: 'EDUNEX', highlight: false },
    { id: 'archive', label: 'Arxiv', icon: Archive },
    { id: 'settings', label: 'Parametrlər', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { id: 'users', label: 'İstifadəçilər', icon: Users2 },
    { id: 'activation_codes', label: 'Aktivasiya kodları', icon: Key, badge: 'PRO' },
    { id: 'packages', label: 'Paketlər və Qiymətlər', icon: CreditCard },
    { id: 'subscriptions', label: 'Abunəliklər & Ödənişlər', icon: Shield },
    { id: 'stats', label: 'İstifadə statistikası', icon: TrendingUp },
    { id: 'regional_stats', label: 'Regional statistika', icon: Award, badge: 'NMR' },
    { id: 'about', label: 'Haqqında', icon: Cpu, badge: 'EDUNEX', highlight: false },
    { id: 'audit', label: 'Audit jurnalı', icon: History },
    { id: 'settings', label: 'Sistem parametrləri', icon: Settings },
  ];

  const studentNav: NavItem[] = [
    { id: 'enter_test', label: 'Testə daxil ol', icon: PlusCircle, highlight: true },
    { id: 'active_tests', label: 'Aktiv testlər', icon: BookOpen },
    { id: 'completed_tests', label: 'Tamamlanmış testlər', icon: CheckCircle2 },
    { id: 'results', label: 'Nəticələrim', icon: BarChart3 },
    { id: 'regional_stats', label: 'Regional statistika', icon: Award, badge: 'NMR' },
    { id: 'about', label: 'Haqqında', icon: Cpu, badge: 'EDUNEX', highlight: false },
    { id: 'profile', label: 'Şəxsi məlumatlar', icon: UserCheck },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'student' ? studentNav : teacherNav;

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-4 px-3 shrink-0 ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
          {role === 'admin' ? 'Administrator İdarəsi' : role === 'student' ? 'Şagird Portalı' : 'Müəllim Kabineti'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.subItems && item.subItems.length > 0;
          const isParentActive = activeTab === item.id || (hasChildren && item.subItems?.some(s => s.id === activeTab));

          if (hasChildren) {
            return (
              <div key={item.id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setExamsExpanded(!examsExpanded);
                    onSelectTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                    isParentActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-800 hover:bg-slate-100 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isParentActive ? 'text-indigo-400' : 'text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      examsExpanded ? 'rotate-180' : ''
                    } ${isParentActive ? 'text-white' : 'text-slate-400'}`}
                  />
                </button>

                {/* Açılıb-bağlanan Alt Menyular: Fənlər, Siniflər, Bütün Testlərim */}
                {examsExpanded && (
                  <div className="flex flex-col gap-0.5 pl-3 py-1 border-l-2 border-slate-200 ml-4 my-0.5 animate-in fade-in duration-150">
                    {item.subItems?.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeTab === sub.id;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelectTab(sub.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSubActive
                              ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                              : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                            <span>{sub.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = activeTab === item.id;
          const isAbout = item.id === 'about';

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : item.highlight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 font-extrabold'
                  : isAbout
                  ? 'bg-gradient-to-r from-sky-50/90 to-indigo-50/80 text-indigo-950 hover:bg-sky-100 border border-sky-200/70 shadow-2xs font-extrabold'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? 'text-indigo-400'
                    : item.highlight
                    ? 'text-white'
                    : isAbout
                    ? 'text-sky-600'
                    : 'text-slate-600'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : isAbout
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-700">EDUNEX Platforması</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">v2.5</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Avtomatik qiymətləndirmə və sual bankı mühərriki.
        </p>
      </div>
    </aside>
  );
};
