// src/components/Navbar.tsx
// ATROQ Education - Compact, Premium SaaS Management Header

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  Crown,
  Shield,
  GraduationCap,
  LogOut,
  Menu,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Award,
  Users2,
  BarChart3,
  TrendingUp,
  Settings,
  Archive,
  Cpu,
  FileQuestion,
  Database,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenProModal: () => void;
  onOpenAdminAuth: () => void;
  onOpenAuthModal?: () => void;
  onToggleSidebar?: () => void;
  onLogout: () => void;
  onSelectCategory?: (categoryId: string, itemId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

// Friendly page titles and icons for live breadcrumbs
const TAB_METADATA: Record<string, { label: string; icon: any }> = {
  dashboard: { label: 'İdarəetmə Paneli', icon: LayoutDashboard },
  create_test: { label: 'İnteraktiv Test Yarat', icon: PlusCircle },
  ai_test: { label: 'AI ilə Test Yarat', icon: Sparkles },
  omr_test: { label: 'OMR / Cavablı Test', icon: BookOpen },
  exams_hub: { label: 'Sınaq İmtahanları Portalı', icon: BookOpen },
  exams_subjects: { label: 'Fənlər üzrə Sınaqlar', icon: BookOpen },
  exams_grades: { label: 'Siniflər üzrə Sınaqlar', icon: GraduationCap },
  my_tests: { label: 'Bütün Testlərim', icon: FileQuestion },
  question_bank: { label: 'Sual Bankı', icon: Database },
  classes: { label: 'Sinif və Şagirdlər', icon: Users2 },
  results: { label: 'İmtahan Nəticələri', icon: BarChart3 },
  statistics: { label: 'Akademik Statistika', icon: TrendingUp },
  regional_stats: { label: 'Naxçıvan MR Regional Statistika', icon: Award },
  about: { label: 'ATROQ Education Haqqında', icon: Cpu },
  archive: { label: 'Arxiv', icon: Archive },
  settings: { label: 'Sistem Parametrləri', icon: Settings },
  users: { label: 'İstifadəçilərin İdarəsi', icon: Users2 },
  activation_codes: { label: 'Aktivasiya Kodları (PRO)', icon: Shield },
  packages: { label: 'Paketlər və Qiymətlər', icon: Crown },
  subscriptions: { label: 'Abunəliklər və Ödənişlər', icon: Shield },
  stats: { label: 'İstifadə Statistikası', icon: TrendingUp },
  audit: { label: 'Audit Jurnalı', icon: FileQuestion },
  enter_test: { label: 'Testə Daxil Ol', icon: PlusCircle },
  active_tests: { label: 'Aktiv Sınaqlar', icon: BookOpen },
  completed_tests: { label: 'Tamamlanmış Sınaqlar', icon: Award },
  profile: { label: 'Şəxsi Məlumatlar', icon: Users2 },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab = 'dashboard',
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onSwitchRole,
  onOpenProModal,
  onOpenAdminAuth,
  onOpenAuthModal,
  onToggleSidebar,
  onLogout,
  onNavigateTab,
}) => {
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Secret 10-click logo trigger for admin prompt
  const handleLogoClick = () => {
    const nextCount = logoClicks + 1;
    setLogoClicks(nextCount);
    if (nextCount >= 10) {
      setLogoClicks(0);
      onOpenAdminAuth();
    }
  };

  const currentMeta = TAB_METADATA[activeTab] || { label: 'Təhsil Portalı', icon: LayoutDashboard };
  const TabIcon = currentMeta.icon;

  const roleNameAz =
    currentUser.role === 'admin'
      ? 'Baş Administrator'
      : currentUser.role === 'teacher'
      ? 'Müəllim Kabineti'
      : 'Şagird Portalı';

  return (
    <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-2xs gap-3 select-none">
      {/* Sol: Brand Emblem + Sidebar Toggle + Canlı Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors cursor-pointer"
            title="Yan menyunu aç"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Sidebar Collapse Toggle */}
        {onToggleSidebarCollapse && (
          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-100"
            title={isSidebarCollapsed ? 'Menyunu genişləndir' : 'Menyunu yığcamlaşdır'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Brand Logo & Name */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          title="ATROQ Education"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-base text-slate-900 tracking-tight font-sans">
                ATROQ
              </span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/70 leading-none">
                Education
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-semibold leading-none mt-1">
              Rəqəmsal Təhsil Platforması
            </p>
          </div>
        </div>

        {/* Canlı Breadcrumb (Aktiv Bölmə Göstəricisi) */}
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs truncate">
          <span className="text-slate-400 font-medium">{roleNameAz}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <div className="flex items-center gap-1.5 text-indigo-950 font-bold bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 truncate">
            <TabIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">{currentMeta.label}</span>
          </div>
        </div>
      </div>

      {/* Sağ: Rol Keçidi, PRO Status, Profil və Əməliyyatlar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Rol Keçidi Segmented Control (Müəllim / Şagird / Admin) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => onSwitchRole('teacher')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
              currentUser.role === 'teacher'
                ? 'bg-white text-indigo-700 shadow-xs font-black'
                : 'hover:text-slate-900'
            }`}
          >
            Müəllim
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('student')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
              currentUser.role === 'student'
                ? 'bg-white text-emerald-700 shadow-xs font-black'
                : 'hover:text-slate-900'
            }`}
          >
            Şagird
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentUser.role === 'admin') {
                onSwitchRole('admin');
              } else {
                onOpenAdminAuth();
              }
            }}
            className={`px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px] sm:text-xs ${
              currentUser.role === 'admin'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'hover:text-slate-900'
            }`}
            title="Administrator Girişi"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        {/* PRO Abunəlik Düyməsi / Nişanı */}
        {currentUser.is_pro ? (
          <button
            type="button"
            onClick={onOpenProModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-black hover:shadow-xs transition-all cursor-pointer"
            title="PRO Abunəlik Məlumatı"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>PRO</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenProModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:opacity-95 text-white rounded-xl text-xs font-black shadow-xs shadow-indigo-100 transition-all cursor-pointer"
            title="PRO Abunəlik Əldə Et"
          >
            <Crown className="w-3.5 h-3.5 fill-white" />
            <span>PRO-ya Keç</span>
          </button>
        )}

        {/* Qonaq üçün Daxil Ol / Qeydiyyat */}
        {onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Giriş</span>
          </button>
        )}

        {/* İstifadəçi Kartı və Çıxış */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left max-w-[140px]">
              <span className="text-xs font-bold text-slate-800 truncate block leading-tight">
                {currentUser.full_name}
              </span>
              <span className="text-[10px] text-slate-400 truncate block leading-tight mt-0.5">
                {currentUser.school || (currentUser.role === 'admin' ? 'Baş Administrator' : 'Naxçıvan Təhsil Portalı')}
              </span>
            </div>
          </div>

          {/* Profil Dropdown Paneli */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {currentUser.full_name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {currentUser.email}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black rounded-md bg-indigo-50 text-indigo-700">
                  {roleNameAz}
                </span>
              </div>

              <div className="py-1">
                {onNavigateTab && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigateTab('settings');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Parametrlər</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigateTab('about');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Cpu className="w-3.5 h-3.5 text-sky-500" />
                      <span>ATROQ Haqqında</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-bold border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sistemdən Çıxış</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
