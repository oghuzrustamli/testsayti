// src/components/NavigationMegaMenu.tsx
// ATROQ Education - Yuxarıdan Açılan İdarəetmə Paneli Menyu Sistemi
// İki sütunlu kaskad açılan menyu: Sol sütunda əsas menyular, sağ sütunda alt menyular
// Çoxdilli (AZ, EN, RU) və Dark/Light rejim dəstəyi ilə

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Printer,
  Edit3,
  BookOpen,
  Layers,
  FileQuestion,
  Database,
  Users2,
  BarChart3,
  TrendingUp,
  Award,
  Cpu,
  Archive,
  Settings,
  Shield,
  Key,
  CreditCard,
  History,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export interface SubMenuItem {
  id: string;
  label: string;
  description: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

export interface MainMenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  accentColor: string;
  subItems: SubMenuItem[];
}

interface NavigationMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const NavigationMegaMenu: React.FC<NavigationMegaMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  onNavigateTab,
  triggerRef,
}) => {
  const { t } = useThemeLanguage();
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 1. MÜƏLLİM ÜÇÜN MENYU STRUKTURU
  const teacherMenu: MainMenuItem[] = [
    {
      id: 'core',
      label: t.catCore,
      subtitle: t.catCoreSub,
      icon: LayoutDashboard,
      accentColor: 'indigo',
      subItems: [
        {
          id: 'dashboard',
          label: t.dashboardTitle,
          description: t.dashboardDesc,
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: 'test_creation',
      label: t.catTestCreation,
      subtitle: t.catTestCreationSub,
      icon: PlusCircle,
      accentColor: 'violet',
      subItems: [
        {
          id: 'create_test',
          label: t.createInteractiveTitle,
          description: t.createInteractiveDesc,
          icon: Edit3,
        },
        {
          id: 'ai_test',
          label: t.createAiTitle,
          description: t.createAiDesc,
          icon: Sparkles,
          badge: 'AI',
          badgeColor: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
        },
        {
          id: 'omr_test',
          label: t.createOmrTitle,
          description: t.createOmrDesc,
          icon: Printer,
          badge: 'PDF',
          badgeColor: 'bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-emerald-800 border border-emerald-200 dark:border-emerald-800',
        },
      ],
    },
    {
      id: 'exams',
      label: t.catExams,
      subtitle: t.catExamsSub,
      icon: BookOpen,
      accentColor: 'blue',
      subItems: [
        {
          id: 'exams_hub',
          label: t.examsHubTitle,
          description: t.examsHubDesc,
          icon: Layers,
        },
        {
          id: 'my_tests',
          label: t.myTestsTitle,
          description: t.myTestsDesc,
          icon: FileQuestion,
        },
        {
          id: 'question_bank',
          label: t.questionBankTitle,
          description: t.questionBankDesc,
          icon: Database,
        },
      ],
    },
    {
      id: 'teaching',
      label: t.catTeaching,
      subtitle: t.catTeachingSub,
      icon: Users2,
      accentColor: 'amber',
      subItems: [
        {
          id: 'classes',
          label: t.classesTitle,
          description: t.classesDesc,
          icon: Users2,
        },
        {
          id: 'results',
          label: t.resultsTitle,
          description: t.resultsDesc,
          icon: BarChart3,
        },
        {
          id: 'statistics',
          label: t.statisticsTitle,
          description: t.statisticsDesc,
          icon: TrendingUp,
        },
      ],
    },
    {
      id: 'regional',
      label: t.catRegional,
      subtitle: t.catRegionalSub,
      icon: Award,
      badge: 'NMR',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 text-emerald-800 border border-emerald-200 dark:border-emerald-800',
      accentColor: 'emerald',
      subItems: [
        {
          id: 'regional_stats',
          label: t.regionalStatsTitle,
          description: t.regionalStatsDesc,
          icon: Award,
          badge: 'NMR',
          badgeColor: 'bg-emerald-500 text-white',
        },
      ],
    },
    {
      id: 'system',
      label: t.catSystem,
      subtitle: t.catSystemSub,
      icon: Settings,
      accentColor: 'slate',
      subItems: [
        {
          id: 'about',
          label: t.aboutTitle,
          description: t.aboutDesc,
          icon: Cpu,
          badge: 'ATROQ',
          badgeColor: 'bg-sky-100 dark:bg-sky-950 dark:text-sky-300 text-sky-800 border border-sky-200 dark:border-sky-800',
        },
        {
          id: 'archive',
          label: t.archiveTitle,
          description: t.archiveDesc,
          icon: Archive,
        },
        {
          id: 'settings',
          label: t.settingsTitle,
          description: t.settingsDesc,
          icon: Settings,
        },
      ],
    },
  ];

  // 2. ŞAGİRD ÜÇÜN MENYU STRUKTURU
  const studentMenu: MainMenuItem[] = [
    {
      id: 'exams',
      label: t.catExams,
      subtitle: t.catExamsSub,
      icon: BookOpen,
      accentColor: 'indigo',
      subItems: [
        {
          id: 'enter_test',
          label: t.enterTestTitle,
          description: t.enterTestDesc,
          icon: PlusCircle,
        },
        {
          id: 'active_tests',
          label: t.activeTestsTitle,
          description: t.activeTestsDesc,
          icon: BookOpen,
        },
        {
          id: 'completed_tests',
          label: t.completedTestsTitle,
          description: t.completedTestsDesc,
          icon: CheckCircle2,
        },
      ],
    },
    {
      id: 'academic',
      label: t.catTeaching,
      subtitle: t.catTeachingSub,
      icon: BarChart3,
      accentColor: 'emerald',
      subItems: [
        {
          id: 'results',
          label: t.resultsTitle,
          description: t.resultsDesc,
          icon: BarChart3,
        },
        {
          id: 'regional_stats',
          label: t.regionalStatsTitle,
          description: t.regionalStatsDesc,
          icon: Award,
          badge: 'NMR',
          badgeColor: 'bg-emerald-500 text-white',
        },
      ],
    },
    {
      id: 'account',
      label: t.catSystem,
      subtitle: t.catSystemSub,
      icon: Settings,
      accentColor: 'slate',
      subItems: [
        {
          id: 'profile',
          label: t.profileTitle,
          description: t.profileDesc,
          icon: UserCheck,
        },
        {
          id: 'about',
          label: t.aboutTitle,
          description: t.aboutDesc,
          icon: Cpu,
          badge: 'ATROQ',
          badgeColor: 'bg-sky-100 dark:bg-sky-950 dark:text-sky-300 text-sky-800 border border-sky-200 dark:border-sky-800',
        },
      ],
    },
  ];

  // 3. ADMİNİSTRATOR ÜÇÜN MENYU STRUKTURU
  const adminMenu: MainMenuItem[] = [
    {
      id: 'users',
      label: t.usersTitle,
      subtitle: t.classesDesc,
      icon: Users2,
      accentColor: 'indigo',
      subItems: [
        {
          id: 'users',
          label: t.usersTitle,
          description: t.usersDesc,
          icon: Users2,
        },
        {
          id: 'audit',
          label: t.auditTitle,
          description: t.auditDesc,
          icon: Shield,
        },
      ],
    },
    {
      id: 'subscriptions',
      label: t.subscriptionsTitle,
      subtitle: t.packagesDesc,
      icon: Key,
      accentColor: 'amber',
      subItems: [
        {
          id: 'activation_codes',
          label: t.activationCodesTitle,
          description: t.activationCodesDesc,
          icon: Key,
          badge: 'PRO',
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'packages',
          label: t.packagesTitle,
          description: t.packagesDesc,
          icon: CreditCard,
        },
        {
          id: 'subscriptions',
          label: t.subscriptionsTitle,
          description: t.subscriptionsDesc,
          icon: History,
        },
      ],
    },
    {
      id: 'stats',
      label: t.statisticsTitle,
      subtitle: t.statsDesc,
      icon: TrendingUp,
      accentColor: 'emerald',
      subItems: [
        {
          id: 'stats',
          label: t.statsTitle,
          description: t.statsDesc,
          icon: TrendingUp,
        },
        {
          id: 'regional_stats',
          label: t.regionalStatsTitle,
          description: t.regionalStatsDesc,
          icon: Award,
          badge: 'NMR',
          badgeColor: 'bg-emerald-500 text-white',
        },
        {
          id: 'about',
          label: t.aboutTitle,
          description: t.aboutDesc,
          icon: Cpu,
          badge: 'ATROQ',
          badgeColor: 'bg-sky-100 dark:bg-sky-950 dark:text-sky-300 text-sky-800 border border-sky-200 dark:border-sky-800',
        },
        {
          id: 'settings',
          label: t.settingsTitle,
          description: t.settingsDesc,
          icon: Settings,
        },
      ],
    },
  ];

  const currentMenu =
    currentUser.role === 'admin'
      ? adminMenu
      : currentUser.role === 'student'
      ? studentMenu
      : teacherMenu;

  // Find initial category based on activeTab
  const initialCategory =
    currentMenu.find((cat) => cat.subItems.some((s) => s.id === activeTab))?.id ||
    currentMenu[0]?.id ||
    'core';

  const [hoveredCategoryId, setHoveredCategoryId] = useState<string>(initialCategory);

  // Update selected category when activeTab changes or menu opens
  useEffect(() => {
    if (isOpen) {
      const matchingCat = currentMenu.find((cat) =>
        cat.subItems.some((s) => s.id === activeTab)
      );
      if (matchingCat) {
        setHoveredCategoryId(matchingCat.id);
      }
    }
  }, [isOpen, activeTab]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const activeCategory =
    currentMenu.find((cat) => cat.id === hoveredCategoryId) || currentMenu[0];

  const handleItemClick = (tabId: string) => {
    onNavigateTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Yumşaq fon qaraldılması (Backdrop) - Header-in altından başlayır, düyməyə mane olmur */}
      <div
        className="fixed top-16 inset-x-0 bottom-0 bg-slate-900/30 backdrop-blur-2xs z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Yuxarıdan açılan Əsas və Alt Menyu Qutusu (İşıqlı rejim, normal ağ qutular, qara yazılar) */}
      <div
        ref={menuRef}
        className="fixed top-16 sm:top-[66px] left-3 sm:left-6 max-w-[calc(100vw-24px)] md:max-w-none bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-sky-950/20 border border-sky-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-slate-900"
        style={{ maxHeight: 'calc(100vh - 84px)' }}
      >
        {/* ================================================================= */}
        {/* SOL SÜTUN: ƏSAS MENYULAR SİYAHISI (Okean mavisi zərif fon)       */}
        {/* ================================================================= */}
        <div className="w-full md:w-72 bg-[#f4f9fd] border-b md:border-b-0 md:border-r border-sky-100 p-3 sm:p-3.5 flex flex-col overflow-y-auto shrink-0 select-none">
          <div className="px-2.5 py-1.5 mb-2 flex items-center justify-between border-b border-sky-100">
            <div className="bg-white px-2.5 py-1 rounded-xl border border-sky-200/80 shadow-2xs inline-flex items-center justify-center">
              <img
                src="/assets/atroq-logo.png"
                alt="ATROQ Education"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {currentMenu.length} {t.sectionsCount}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {currentMenu.map((cat) => {
              const Icon = cat.icon;
              const isSelected = cat.id === hoveredCategoryId;
              const hasActiveChild = cat.subItems.some((s) => s.id === activeTab);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onClick={() => {
                    setHoveredCategoryId(cat.id);
                    if (cat.subItems.length === 1 && cat.id === 'core') {
                      handleItemClick(cat.subItems[0].id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-white text-indigo-950 font-black shadow-xs border border-sky-200/90 ring-1 ring-sky-500/10'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/80 border border-transparent font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : hasActiveChild
                          ? 'bg-sky-100 text-indigo-800'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black truncate text-slate-900">{cat.label}</span>
                        {cat.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                              cat.badgeColor || 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-indigo-600 translate-x-0.5'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SAĞ SÜTUN: SEÇİLMİŞ ƏSAS MENYUYA AİD ALT MENYULAR (Ağ Kartlar)    */}
        {/* ================================================================= */}
        <div className="w-full md:w-[440px] lg:w-[480px] bg-white p-4 sm:p-5 flex flex-col justify-between overflow-y-auto select-none">
          <div>
            {/* Alt Menyu Başlığı */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {React.createElement(activeCategory.icon, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {activeCategory.label}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    {activeCategory.subtitle} — {t.functionsCount}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeCategory.subItems.length} {t.functionsCount}
              </span>
            </div>

            {/* Alt Menyu Bəndləri (Normal Ağ Qutular, Qara Yazılar) */}
            <div className="flex flex-col gap-2">
              {activeCategory.subItems.map((sub) => {
                const SubIcon = sub.icon;
                const isItemActive = activeTab === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleItemClick(sub.id)}
                    className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isItemActive
                        ? 'bg-sky-50/90 border-sky-300 text-slate-950 shadow-xs'
                        : 'bg-white hover:bg-sky-50/50 border-slate-200/90 hover:border-sky-300 hover:shadow-xs text-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 mt-0.5 ${
                          isItemActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700'
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-[13px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {sub.label}
                          </span>
                          {sub.badge && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                                sub.badgeColor || 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {sub.badge}
                            </span>
                          )}
                          {isItemActive && (
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded-full">
                              {t.currentSection}
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                          {sub.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 flex items-center justify-center shrink-0 transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menyu Alt Məlumat Zolağı */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold">ATROQ Education • v2.5</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.closeEsc}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
