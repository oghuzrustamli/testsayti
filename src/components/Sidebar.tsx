// src/components/Sidebar.tsx
// ATROQ Education - Modern SaaS Collapsible Navigation Sidebar

import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  FileQuestion,
  Database,
  Users2,
  GraduationCap,
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
  Layers,
  Sparkles,
  Award,
  Cpu,
  Edit3,
  Printer,
  ChevronRight,
  HelpCircle,
  Globe,
  Building2
} from 'lucide-react';

export type TeacherTab =
  | 'dashboard'
  | 'create_test'
  | 'ai_test'
  | 'omr_test'
  | 'exams_hub'
  | 'exams_subjects'
  | 'exams_grades'
  | 'my_tests'
  | 'question_bank'
  | 'student_database'
  | 'classes'
  | 'results'
  | 'statistics'
  | 'regional_stats'
  | 'ministry_exams'
  | 'archive'
  | 'about'
  | 'settings';

export type AdminTab =
  | 'users'
  | 'student_database'
  | 'activation_codes'
  | 'packages'
  | 'subscriptions'
  | 'stats'
  | 'regional_stats'
  | 'ministry_exams'
  | 'about'
  | 'settings'
  | 'audit';

export type StudentTab =
  | 'enter_test'
  | 'active_tests'
  | 'completed_tests'
  | 'results'
  | 'regional_stats'
  | 'ministry_exams'
  | 'about'
  | 'profile';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  badge?: string;
  highlight?: boolean;
  subItems?: NavSubItem[];
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  isCollapsed = false,
  onSelectTab,
  className = '',
}) => {
  // Accordion state for collapsible groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    test_creator_group: true,
    exams_group: true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // 1. MÜƏLLİM MENYULARI (Məntiqli Qruplaşdırma və Sıfır Təkrar)
  const teacherGroups: NavGroup[] = [
    {
      groupTitle: 'Əsas',
      items: [
        { id: 'dashboard', label: 'İdarəetmə Paneli', icon: LayoutDashboard },
      ]
    },
    {
      groupTitle: 'Testlərin Hazırlanması',
      items: [
        { id: 'create_test', label: 'İnteraktiv Test Yarat', icon: Edit3 },
        { id: 'ai_test', label: 'AI ilə Test Yarat', icon: Sparkles, badge: 'AI' },
        { id: 'omr_test', label: 'OMR / Cavablı Test', icon: Printer, badge: 'PDF' },
      ]
    },
    {
      groupTitle: 'İmtahanlar & Arxiv',
      items: [
        {
          id: 'exams_group',
          label: 'Sınaq İmtahanları',
          icon: BookOpen,
          subItems: [
            { id: 'exams_hub', label: 'Sınaq Portalı', icon: Layers },
            { id: 'my_tests', label: 'Bütün Testlərim', icon: FileQuestion },
            { id: 'question_bank', label: 'Sual Bankı', icon: Database },
          ]
        },
      ]
    },
    {
      groupTitle: 'Tədris və Nəzarət',
      items: [
        { id: 'student_database', label: 'Şagird bazası', icon: Users2, badge: 'UTİS', highlight: true },
        { id: 'classes', label: 'Sinif və Şagirdlər', icon: GraduationCap },
        { id: 'results', label: 'Nəticələr və Jurnal', icon: BarChart3 },
        { id: 'statistics', label: 'Akademik Statistika', icon: TrendingUp },
      ]
    },
    {
      groupTitle: 'Regional Təhsil',
      items: [
        { id: 'regional_stats', label: 'Regional Statistika', icon: Award, badge: 'NMR' },
        { id: 'ministry_exams', label: 'UTİS & Məktəb Bazası', icon: Building2, badge: 'UTİS', highlight: true },
      ]
    },
    {
      groupTitle: 'Sistem',
      items: [
        { id: 'about', label: 'Haqqında', icon: Cpu, badge: 'ATROQ' },
        { id: 'archive', label: 'Arxiv', icon: Archive },
        { id: 'settings', label: 'Parametrlər', icon: Settings },
      ]
    }
  ];

  // 2. ADMINISTRATOR MENYULARI
  const adminGroups: NavGroup[] = [
    {
      groupTitle: 'İdarəetmə',
      items: [
        { id: 'users', label: 'İstifadəçilər', icon: Users2 },
        { id: 'student_database', label: 'Şagird bazası', icon: Users2, badge: 'UTİS', highlight: true },
        { id: 'activation_codes', label: 'Aktivasiya Kodları', icon: Key, badge: 'PRO' },
        { id: 'packages', label: 'Paketlər və Qiymətlər', icon: CreditCard },
        { id: 'subscriptions', label: 'Abunəliklər & Ödənişlər', icon: Shield },
      ]
    },
    {
      groupTitle: 'Təhlil və Monitorinq',
      items: [
        { id: 'stats', label: 'İstifadə Statistikası', icon: TrendingUp },
        { id: 'regional_stats', label: 'Regional Statistika', icon: Award, badge: 'NMR' },
        { id: 'ministry_exams', label: 'UTİS & Məktəb Bazası', icon: Building2, badge: 'UTİS', highlight: true },
        { id: 'audit', label: 'Audit Jurnalı', icon: History },
      ]
    },
    {
      groupTitle: 'Sistem',
      items: [
        { id: 'about', label: 'Haqqında', icon: Cpu, badge: 'ATROQ' },
        { id: 'settings', label: 'Sistem Parametrləri', icon: Settings },
      ]
    }
  ];

  // 3. ŞAGİRD MENYULARI
  const studentGroups: NavGroup[] = [
    {
      groupTitle: 'İmtahan',
      items: [
        { id: 'enter_test', label: 'Testə Daxil Ol', icon: PlusCircle, highlight: true },
        { id: 'active_tests', label: 'Aktiv Sınaqlar', icon: BookOpen },
        { id: 'completed_tests', label: 'Tamamlanmış Sınaqlar', icon: CheckCircle2 },
        { id: 'results', label: 'Nəticələrim', icon: BarChart3 },
      ]
    },
    {
      groupTitle: 'Təhsil & Reytinq',
      items: [
        { id: 'regional_stats', label: 'Regional Reytinq', icon: Award, badge: 'NMR' },
        { id: 'about', label: 'Haqqında', icon: Cpu, badge: 'ATROQ' },
        { id: 'profile', label: 'Şəxsi Məlumatlar', icon: UserCheck },
      ]
    }
  ];

  const currentGroups = role === 'admin' ? adminGroups : role === 'student' ? studentGroups : teacherGroups;

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 flex flex-col justify-between select-none transition-all duration-200 ${
        isCollapsed ? 'w-18' : 'w-64'
      } ${className}`}
    >
      {/* Scrollable Navigation Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 scrollbar-thin flex flex-col gap-5">
        {currentGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            {/* Group Header (only when expanded) */}
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.groupTitle}
              </div>
            )}

            {group.items.map(item => {
              const Icon = item.icon;
              const hasSub = item.subItems && item.subItems.length > 0;
              const isGroupOpen = openGroups[item.id] ?? true;
              const isParentActive =
                activeTab === item.id ||
                (hasSub && item.subItems?.some(s => s.id === activeTab));

              if (hasSub) {
                return (
                  <div key={item.id} className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCollapsed) {
                          onSelectTab(item.subItems![0].id);
                        } else {
                          toggleGroup(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group dark-tricolor-border sidebar-menu-btn relative ${
                        isParentActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isParentActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-600'
                        }`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                              isGroupOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      )}
                    </button>

                    {/* Submenu Items */}
                    {!isCollapsed && isGroupOpen && (
                      <div className="flex flex-col gap-0.5 pl-3 mt-0.5 border-l-2 border-slate-100 ml-4">
                        {item.subItems!.map(sub => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeTab === sub.id;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => onSelectTab(sub.id)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer dark-tricolor-border sidebar-menu-btn relative ${
                                isSubActive
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span className="truncate">{sub.label}</span>
                              </div>

                              {sub.badge && (
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                  sub.badge === 'AI'
                                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal single item
              const isItemActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group dark-tricolor-border sidebar-menu-btn relative ${
                    isItemActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200/60 dark:border-indigo-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isItemActive
                        ? 'text-indigo-400'
                        : item.highlight
                        ? 'text-indigo-600'
                        : 'text-slate-500 group-hover:text-indigo-600'
                    }`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      item.badge === 'NMR'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : item.badge === 'ATROQ'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : item.badge === 'PRO'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-slate-100 flex flex-col gap-2 shrink-0">
        {!isCollapsed ? (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-[11px]">
            <div>
              <span className="font-black text-slate-800 block">ATROQ Education</span>
              <span className="text-[10px] text-slate-400 font-medium">v2.5 Professional</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sistem aktivdir" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Sistem aktivdir" />
          </div>
        )}
      </div>
    </aside>
  );
};
