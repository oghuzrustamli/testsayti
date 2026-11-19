// src/components/NavigationMegaMenu.tsx
// ATROQ Education - Yuxarıdan Açılan İdarəetmə Paneli Menyu Sistemi
// İki sütunlu kaskad açılan menyu: Sol sütunda əsas menyular, sağ sütunda alt menyular

import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
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
  X,
  GraduationCap
} from 'lucide-react';

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
}

export const NavigationMegaMenu: React.FC<NavigationMegaMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  onNavigateTab,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 1. MÜƏLLİM ÜÇÜN MENYU STRUKTURU
  const teacherMenu: MainMenuItem[] = [
    {
      id: 'core',
      label: 'Əsas',
      subtitle: 'İdarəetmə Paneli',
      icon: LayoutDashboard,
      accentColor: 'indigo',
      subItems: [
        {
          id: 'dashboard',
          label: 'İdarəetmə Paneli',
          description: 'Ümumi icmal, KPI statistikası, son sınaqlar və sürətli əməliyyatlar',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: 'test_creation',
      label: 'Testlərin Hazırlanması',
      subtitle: 'İnteraktiv, AI və OMR',
      icon: PlusCircle,
      accentColor: 'violet',
      subItems: [
        {
          id: 'create_test',
          label: 'İnteraktiv Test Yarat',
          description: 'Birbaşa onlayn sual konstruktoru, riyazi KaTeX düsturları və açıq/qapalı suallar',
          icon: Edit3,
        },
        {
          id: 'ai_test',
          label: 'AI ilə Test Yarat',
          description: 'DİM təhsil proqramına uyğun fənn və mövzu üzrə süni intellektlə saniyələr içində sınaq',
          icon: Sparkles,
          badge: 'AI',
          badgeColor: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
        },
        {
          id: 'omr_test',
          label: 'OMR / Cavablı Test',
          description: 'PDF və Word sual kitabçası yüklənməsi, 3 sütunlu optik cavab kartı və şablonlar',
          icon: Printer,
          badge: 'PDF',
          badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        },
      ],
    },
    {
      id: 'exams',
      label: 'İmtahanlar & Arxiv',
      subtitle: 'Sınaqlar və Sual Bankı',
      icon: BookOpen,
      accentColor: 'blue',
      subItems: [
        {
          id: 'exams_hub',
          label: 'Sınaq Portalı',
          description: 'Buraxılış, Blok, Məktəbdaxili (KSQ/BSQ) və Lisey imtahanları kataloqu',
          icon: Layers,
        },
        {
          id: 'my_tests',
          label: 'Bütün Testlərim',
          description: 'Müəllimin şəxsi test bazası, yayımlanmış və qaralama sınaqların idarəsi',
          icon: FileQuestion,
        },
        {
          id: 'question_bank',
          label: 'Sual Bankı',
          description: 'Fənlər və mövzular üzrə toplanmış minlərlə hazır sual və tapşırıq bazası',
          icon: Database,
        },
      ],
    },
    {
      id: 'teaching',
      label: 'Tədris və Nəzarət',
      subtitle: 'Siniflər, Jurnal və Analitika',
      icon: Users2,
      accentColor: 'amber',
      subItems: [
        {
          id: 'classes',
          label: 'Sinif və Şagirdlər',
          description: 'Sinif siyahıları, şagird profilləri və tədris qrupları',
          icon: Users2,
        },
        {
          id: 'results',
          label: 'Nəticələr və Jurnal',
          description: 'Şagirdlərin imtahan balları, faizləri və rəqəmsal qiymətləndirmə jurnalı',
          icon: BarChart3,
        },
        {
          id: 'statistics',
          label: 'Akademik Statistika',
          description: 'Siniflərin və fənlərin müvəffəqiyyət dinamikası, inkişaf diaqramları',
          icon: TrendingUp,
        },
      ],
    },
    {
      id: 'regional',
      label: 'Regional Təhsil',
      subtitle: 'Naxçıvan MR Reytinqi',
      icon: Award,
      badge: 'NMR',
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      accentColor: 'emerald',
      subItems: [
        {
          id: 'regional_stats',
          label: 'Regional Statistika (NMR)',
          description: 'Naxçıvan Muxtar Respublikasının bütün rayon və məktəbləri üzrə akademik reytinq',
          icon: Award,
          badge: 'NMR',
          badgeColor: 'bg-emerald-500 text-white',
        },
      ],
    },
    {
      id: 'system',
      label: 'Sistem',
      subtitle: 'Haqqında və Parametrlər',
      icon: Settings,
      accentColor: 'slate',
      subItems: [
        {
          id: 'about',
          label: 'Haqqında & Video',
          description: 'ATROQ Education təqdimatı, virtual qadın aparıcı və video bələdçi',
          icon: Cpu,
          badge: 'ATROQ',
          badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200',
        },
        {
          id: 'archive',
          label: 'Arxiv',
          description: 'Saxlanılmış köhnə sınaqlar, fənn materialları və sənədlər',
          icon: Archive,
        },
        {
          id: 'settings',
          label: 'Parametrlər',
          description: 'İstifadəçi profili, təhlükəsizlik, şifrə və platforma tənzimləmələri',
          icon: Settings,
        },
      ],
    },
  ];

  // 2. ŞAGİRD ÜÇÜN MENYU STRUKTURU
  const studentMenu: MainMenuItem[] = [
    {
      id: 'exams',
      label: 'Sınaqlar və İmtahanlar',
      subtitle: 'Testlərə Giriş',
      icon: BookOpen,
      accentColor: 'indigo',
      subItems: [
        {
          id: 'enter_test',
          label: 'Testə Daxil Ol',
          description: 'Müəllimin təqdim etdiyi paylaşım linki və ya PIN kodla imtahana başla',
          icon: PlusCircle,
        },
        {
          id: 'active_tests',
          label: 'Aktiv Sınaqlar',
          description: 'Cari olaraq təyin edilmiş və daxil ola biləcəyiniz testlər',
          icon: BookOpen,
        },
        {
          id: 'completed_tests',
          label: 'Tamamlanmış Sınaqlar',
          description: 'İştirak etdiyiniz imtahanların siyahısı və nəticələri',
          icon: CheckCircle2,
        },
      ],
    },
    {
      id: 'academic',
      label: 'Akademik Göstəricilər',
      subtitle: 'Nəticələr və Reytinq',
      icon: BarChart3,
      accentColor: 'emerald',
      subItems: [
        {
          id: 'results',
          label: 'Nəticələrim',
          description: 'İmtahan ballarınız, düzgün və səhv cavablar, fənn üzrə analitika',
          icon: BarChart3,
        },
        {
          id: 'regional_stats',
          label: 'Regional Reytinq',
          description: 'Naxçıvan Muxtar Respublikası üzrə məktəblilərin nəticələri və reytinqi',
          icon: Award,
          badge: 'NMR',
          badgeColor: 'bg-emerald-500 text-white',
        },
      ],
    },
    {
      id: 'account',
      label: 'Hesab və Məlumat',
      subtitle: 'Profil və Bələdçi',
      icon: Settings,
      accentColor: 'slate',
      subItems: [
        {
          id: 'profile',
          label: 'Şəxsi Məlumatlar',
          description: 'Şagird profili, təhsil aldığı məktəb və sinif məlumatları',
          icon: UserCheck,
        },
        {
          id: 'about',
          label: 'Haqqında',
          description: 'ATROQ Education təhsil platforması və imkanları haqqında',
          icon: Cpu,
          badge: 'ATROQ',
          badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200',
        },
      ],
    },
  ];

  // 3. ADMİNİSTRATOR ÜÇÜN MENYU STRUKTURU
  const adminMenu: MainMenuItem[] = [
    {
      id: 'users',
      label: 'İstifadəçilər və İcazələr',
      subtitle: 'Müəllimlər və Şagirdlər',
      icon: Users2,
      accentColor: 'indigo',
      subItems: [
        {
          id: 'users',
          label: 'İstifadəçilərin İdarəsi',
          description: 'Müəllim, şagird və administrator hesablarının tam idarə olunması',
          icon: Users2,
        },
        {
          id: 'audit',
          label: 'Audit Jurnalı',
          description: 'Sistem təhlükəsizlik qeydləri və fəaliyyət tarixçəsi',
          icon: Shield,
        },
      ],
    },
    {
      id: 'subscriptions',
      label: 'Abunəlik və PRO',
      subtitle: 'Lisenziyalar və Ödənişlər',
      icon: Key,
      accentColor: 'amber',
      subItems: [
        {
          id: 'activation_codes',
          label: 'Aktivasiya Kodları (PRO)',
          description: 'Müəllimlər üçün 16 rəqəmli PRO lisenziya kodlarının generasiyası',
          icon: Key,
          badge: 'PRO',
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'packages',
          label: 'Paketlər və Qiymətlər',
          description: 'Aylıq və illik xidmət paketlərinin tənzimlənməsi',
          icon: CreditCard,
        },
        {
          id: 'subscriptions',
          label: 'Abunəliklər',
          description: 'Aktiv abunələr və ödəniş statusları',
          icon: History,
        },
      ],
    },
    {
      id: 'stats',
      label: 'Hesabat və Reytinq',
      subtitle: 'Statistika və Tənzimləmələr',
      icon: TrendingUp,
      accentColor: 'emerald',
      subItems: [
        {
          id: 'stats',
          label: 'İstifadə Statistikası',
          description: 'Platformanın ümumi statistik göstəriciləri və qrafiklər',
          icon: TrendingUp,
        },
        {
          id: 'regional_stats',
          label: 'Regional Reytinq (NMR)',
          description: 'Naxçıvan rayon və məktəblərinin ümumi təhsil monitorinqi',
          icon: Award,
          badge: 'NMR',
          badgeColor: 'bg-emerald-500 text-white',
        },
        {
          id: 'about',
          label: 'Haqqında',
          description: 'ATROQ Education təqdimatı və video bələdçi',
          icon: Cpu,
          badge: 'ATROQ',
          badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200',
        },
        {
          id: 'settings',
          label: 'Sistem Parametrləri',
          description: 'Qlobal platforma konfiqurasiyası',
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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeCategory =
    currentMenu.find((cat) => cat.id === hoveredCategoryId) || currentMenu[0];

  const handleItemClick = (tabId: string) => {
    onNavigateTab(tabId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Yumşaq fon qaraldılması (Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Yuxarıdan açılan Əsas və Alt Menyu Qutusu */}
      <div
        ref={menuRef}
        className="absolute top-16 left-3 sm:left-6 max-w-[calc(100vw-24px)] sm:max-w-none bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/90 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-top-3 duration-200 z-50"
        style={{ maxHeight: 'calc(100vh - 84px)' }}
      >
        {/* ================================================================= */}
        {/* SOL SÜTUN: ƏSAS MENYULAR SİYAHISI                                 */}
        {/* ================================================================= */}
        <div className="w-full md:w-72 bg-slate-50/90 border-b md:border-b-0 md:border-r border-slate-200/80 p-3 sm:p-3.5 flex flex-col overflow-y-auto shrink-0 select-none">
          <div className="px-3 py-1.5 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Əsas Bölmələr
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {currentMenu.length} Bölmə
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
                    // Əgər tək alt menyusu varsa birbaşa keç
                    if (cat.subItems.length === 1 && cat.id === 'core') {
                      handleItemClick(cat.subItems[0].id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl sm:rounded-2xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-white text-indigo-950 font-black shadow-md shadow-slate-200/60 border border-slate-200/80 ring-1 ring-indigo-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 border border-transparent font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : hasActiveChild
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black truncate">{cat.label}</span>
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
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-indigo-600 translate-x-0.5'
                        : 'text-slate-300 group-hover:text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SAĞ SÜTUN: SEÇİLMİŞ ƏSAS MENYUYA AİD ALT MENYULAR                 */}
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
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    {activeCategory.subtitle} — Seçimlər
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {activeCategory.subItems.length} Funksiya
              </span>
            </div>

            {/* Alt Menyu Bəndləri (Hover və Klik ilə keçid) */}
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
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs'
                        : 'bg-white hover:bg-slate-50/90 border-slate-200/70 hover:border-indigo-200 hover:shadow-sm text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 mt-0.5 ${
                          isItemActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700'
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-[13px] font-black group-hover:text-indigo-600 transition-colors">
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
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100/70 px-1.5 py-0.2 rounded-full">
                              Cari Səhifə
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-all">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menyu Alt Məlumat Zolağı */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold">ATROQ Education • İmtahan Sistemi</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bağla (Esc)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
