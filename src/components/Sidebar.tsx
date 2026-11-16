// src/components/Sidebar.tsx
import React from 'react';
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
  UserCheck
} from 'lucide-react';

export type TeacherTab =
  | 'dashboard'
  | 'create_test'
  | 'my_tests'
  | 'omr_test'
  | 'question_bank'
  | 'classes'
  | 'students'
  | 'shared_tests'
  | 'results'
  | 'statistics'
  | 'archive'
  | 'settings';

export type AdminTab =
  | 'users'
  | 'activation_codes'
  | 'packages'
  | 'subscriptions'
  | 'stats'
  | 'settings'
  | 'audit';

export type StudentTab =
  | 'enter_test'
  | 'active_tests'
  | 'completed_tests'
  | 'results'
  | 'profile';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  className = '',
}) => {
  // Navigation menus based on user role
  const teacherNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create_test', label: 'Yeni test yarat', icon: PlusCircle, highlight: true },
    { id: 'my_tests', label: 'Testlərim', icon: FileQuestion },
    { id: 'classes', label: 'Siniflərim', icon: Users2 },
    { id: 'students', label: 'Şagirdlərim', icon: GraduationCap },
    { id: 'shared_tests', label: 'Paylaşılan testlər', icon: Share2 },
    { id: 'results', label: 'Nəticələr', icon: BarChart3 },
    { id: 'statistics', label: 'Statistika', icon: TrendingUp },
    { id: 'archive', label: 'Arxiv', icon: Archive },
    { id: 'settings', label: 'Parametrlər', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { id: 'users', label: 'İstifadəçilər', icon: Users2 },
    { id: 'activation_codes', label: 'Aktivasiya kodları', icon: Key, badge: 'PRO' },
    { id: 'packages', label: 'Paketlər və Qiymətlər', icon: CreditCard },
    { id: 'subscriptions', label: 'Abunəliklər & Ödənişlər', icon: Shield },
    { id: 'stats', label: 'İstifadə statistikası', icon: TrendingUp },
    { id: 'audit', label: 'Audit jurnalı', icon: History },
    { id: 'settings', label: 'Sistem parametrləri', icon: Settings },
  ];

  const studentNav: NavItem[] = [
    { id: 'enter_test', label: 'Testə daxil ol', icon: PlusCircle, highlight: true },
    { id: 'active_tests', label: 'Aktiv testlər', icon: BookOpen },
    { id: 'completed_tests', label: 'Tamamlanmış testlər', icon: CheckCircle2 },
    { id: 'results', label: 'Nəticələrim', icon: BarChart3 },
    { id: 'profile', label: 'Şəxsi məlumatlar', icon: UserCheck },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'student' ? studentNav : teacherNav;

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-4 px-3 shrink-0 ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {role === 'admin' ? 'Administrator İdarəsi' : role === 'student' ? 'Şagird Portalı' : 'Müəllim Kabineti'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : item.highlight
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
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
        <p className="text-[10px] text-slate-400">
          Avtomatik qiymətləndirmə və sual bankı mühərriki.
        </p>
      </div>
    </aside>
  );
};
