// src/components/Navbar.tsx
// ATROQ Education - Compact, Premium SaaS Management Header
// Sol: 1. ATROQ Education loqosu, 2. İdarəetmə paneli düyməsi
// Sağ: 1. Yer kürəsi (🌐) dil seçimi, 2. Qaranlıq / İşıqlı rejim düyməsi + Rol & Profil

import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import {
  Crown,
  Shield,
  GraduationCap,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Sparkles,
  Settings,
  User as UserIcon
} from 'lucide-react';
import { NavigationMegaMenu } from './NavigationMegaMenu';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

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

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab = 'dashboard',
  onSwitchRole,
  onOpenProModal,
  onOpenAdminAuth,
  onOpenAuthModal,
  onLogout,
  onNavigateTab,
}) => {
  const { language, setLanguage, t, theme, toggleTheme } = useThemeLanguage();

  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<boolean>(false);
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);

  // Secret 10-click logo trigger for admin prompt
  const handleLogoClick = () => {
    const nextCount = logoClicks + 1;
    setLogoClicks(nextCount);
    if (nextCount >= 10) {
      setLogoClicks(0);
      onOpenAdminAuth();
    }
  };

  return (
    <header className="h-16 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-2xs gap-3 select-none">
      {/* ================================================================= */}
      {/* SOL TƏRƏF:                                                       */}
      {/* 1. ATROQ Education loqosu                                         */}
      {/* 2. İdarəetmə paneli düyməsi (Loqonun dərhal sağında)              */}
      {/* ================================================================= */}
      <div className="flex items-center gap-3 sm:gap-4.5 min-w-0">
        {/* 1. ATROQ EDUCATION LOQOSU (Solda birinci) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          title="ATROQ Education"
        >
          <div className="h-10 sm:h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/assets/atroq-logo.png"
              alt="ATROQ Education"
              className="h-8 sm:h-9 w-auto object-contain dark:brightness-125 dark:contrast-125 dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
            />
          </div>
        </div>

        {/* 2. İDARƏETMƏ PANELİ DÜYMƏSİ (Loqonun dərhal sağında sabit düymə) */}
        <button
          ref={triggerBtnRef}
          type="button"
          onClick={() => setMegaMenuOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs shrink-0 border ${
            megaMenuOpen
              ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/40 border-indigo-700 ring-2 ring-indigo-400/40'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700 shadow-xs hover:shadow-sm'
          }`}
          title={t.controlPanel}
        >
          <LayoutDashboard className={`w-4 h-4 shrink-0 ${megaMenuOpen ? 'text-white' : 'text-indigo-600 dark:text-indigo-300'}`} />
          <span className="whitespace-nowrap">{t.controlPanel}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              megaMenuOpen ? 'rotate-180 text-white' : 'text-indigo-500 dark:text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* ================================================================= */}
      {/* SAĞ TƏRƏF:                                                       */}
      {/* 1. Yer kürəsi (🌐) dil seçimi (hover və kliklə açılan menyu)      */}
      {/* 2. Qaranlıq rejim / İşıqlı rejim düyməsi (Ay / Günəş)             */}
      {/* + Rol Keçidi, PRO Status və Profil menyusu                        */}
      {/* ================================================================= */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* 1. DİL SEÇİMİ – YER KÜRƏSİ (🌐) İKONU VƏ AÇILAN MENYU */}
        <div
          className="relative"
          onMouseEnter={() => setShowLangMenu(true)}
          onMouseLeave={() => setShowLangMenu(false)}
        >
          <button
            type="button"
            onClick={() => setShowLangMenu((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
            title={
              language === 'az'
                ? 'Azərbaycan dili (Dili dəyiş)'
                : language === 'en'
                ? 'English (Change language)'
                : 'Русский (Сменить язык)'
            }
            aria-label="Language"
          >
            <Globe className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                {language === 'az' ? 'Dil seçimi' : language === 'en' ? 'Select language' : 'Выбор языка'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setLanguage('az');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  language === 'az'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Azərbaycan dili</span>
                {language === 'az' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  language === 'en'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>English</span>
                {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('ru');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                  language === 'ru'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Русский</span>
                {language === 'ru' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>}
              </button>
            </div>
          )}
        </div>

        {/* 2. QARANLIQ REJİM / İŞIQLI REJİM SEÇİMİ */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0"
          title={theme === 'dark' ? t.lightMode : t.darkMode}
          aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          )}
        </button>

        {/* Rol Keçidi Segmented Control (Müəllim / Şagird / Admin) */}
        <div className="hidden sm:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => onSwitchRole('teacher')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
              currentUser.role === 'teacher'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs font-black'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.roleTeacher}
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('student')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
              currentUser.role === 'student'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.roleStudent}
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
            className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px] sm:text-xs ${
              currentUser.role === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs font-black dark:bg-slate-700'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Administrator Girişi"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">{t.roleAdmin}</span>
          </button>
        </div>

        {/* PRO Abunəlik Düyməsi */}
        {currentUser.is_pro ? (
          <button
            type="button"
            onClick={onOpenProModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 rounded-xl text-xs font-black hover:shadow-xs transition-all cursor-pointer"
            title="PRO Abunəlik"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>PRO</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenProModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:opacity-95 text-white rounded-xl text-xs font-black shadow-xs shadow-indigo-100 transition-all cursor-pointer"
            title="PRO Abunəlik Əldə Et"
          >
            <Crown className="w-3.5 h-3.5 fill-white" />
            <span>{t.proUpgrade}</span>
          </button>
        )}

        {/* Qonaq üçün Daxil Ol / Qeydiyyat */}
        {onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-300 dark:border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
            <span>{t.login}</span>
          </button>
        )}

        {/* İstifadəçi Profili və Çıxış */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left leading-none">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {currentUser.full_name || 'İstifadəçi'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                {currentUser.role === 'admin'
                  ? t.roleAdmin
                  : currentUser.role === 'teacher'
                  ? t.roleTeacher
                  : t.roleStudent}
              </span>
            </div>
          </div>

          {/* Profil Açılan Menyu (Dropdown) */}
          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-2 z-50 text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {currentUser.full_name}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {currentUser.email || currentUser.phone || 'istifadeci@atroq.az'}
                </span>
                <span className="inline-block mt-1 text-[9.5px] uppercase font-black px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {currentUser.role === 'admin'
                    ? t.roleAdmin
                    : currentUser.role === 'teacher'
                    ? t.roleTeacher
                    : t.roleStudent}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {currentUser.role === 'teacher' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onNavigateTab) onNavigateTab('classes');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.classesTitle}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onNavigateTab) onNavigateTab('settings');
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.settingsTitle}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer font-bold border-t border-slate-100 dark:border-slate-800 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Yuxarıdan Açılan 2-Sütunlu Kaskad İdarəetmə Paneli Menyu Qutusu */}
      <NavigationMegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        currentUser={currentUser}
        activeTab={activeTab}
        triggerRef={triggerBtnRef}
        onNavigateTab={(tab) => {
          setMegaMenuOpen(false);
          if (onNavigateTab) onNavigateTab(tab);
        }}
      />
    </header>
  );
};
