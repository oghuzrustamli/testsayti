// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import {
  Crown,
  Shield,
  GraduationCap,
  UserCheck,
  LogOut,
  Lock,
  Bell,
  Menu,
  ChevronDown,
  BookOpen,
  Layers,
  Award,
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export interface MainMenuCategory {
  id: string;
  label: string;
  badge: string;
  icon: any;
  items: { id: string; title: string; desc: string }[];
}

export const MAIN_MENU_CATEGORIES: MainMenuCategory[] = [
  {
    id: 'blok',
    label: 'Blok',
    badge: 'I - IV Qrup',
    icon: Layers,
    items: [
      { id: 'blok-1-ri', title: 'I Qrup (Rİ)', desc: 'Riyaziyyat • İnformatika • Fizika' },
      { id: 'blok-1-rk', title: 'I Qrup (RK)', desc: 'Riyaziyyat • Kimya • Fizika' },
      { id: 'blok-2', title: 'II Qrup', desc: 'Riyaziyyat • Coğrafiya • Tarix' },
      { id: 'blok-3', title: 'III Qrup', desc: 'Azərbaycan dili • Ədəbiyyat • Tarix' },
      { id: 'blok-4', title: 'IV Qrup', desc: 'Biologiya • Kimya • Fizika' },
    ]
  },
  {
    id: 'buraxilis',
    label: 'Buraxılış',
    badge: 'DİM 9 & 11',
    icon: Award,
    items: [
      { id: 'buraxilis-9', title: '9-cu sinif Buraxılış İmtahanı', desc: 'Azərbaycan dili • Riyaziyyat • Xarici dil' },
      { id: 'buraxilis-11', title: '11-ci sinif Buraxılış İmtahanı', desc: 'Dövlət İmtahan Mərkəzi (DİM) standartı' },
      { id: 'buraxilis-movzu', title: 'Mövzu Sınaq İmtahanı (MSİ)', desc: 'Bölmələr üzrə mərhələli sınaqlar' },
      { id: 'buraxilis-umumi', title: 'Ümumi Sınaq İmtahanı (ÜSİ)', desc: 'Tam formatlı imtahan simulyasiyası' },
    ]
  },
  {
    id: 'mektebdaxili',
    label: 'Məktəbdaxili',
    badge: 'KSQ / BSQ',
    icon: BookOpen,
    items: [
      { id: 'ksq', title: 'KSQ (Kiçik Summativ)', desc: 'Bütün fənlər üzrə 1–11-ci siniflər' },
      { id: 'bsq', title: 'BSQ (Böyük Summativ)', desc: 'Yarımillik yekun qiymətləndirmə testləri' },
      { id: 'monitoring', title: 'Monitorinq & Diaqnostik', desc: 'Məktəb səviyyəli qiymətləndirmə' },
      { id: 'ibtidai', title: 'İbtidai Sinif Sınaqları', desc: '1-ci, 2-ci, 3-cü, 4-cü sinif fənn testləri' },
    ]
  },
  {
    id: 'liseyler',
    label: 'Liseylər',
    badge: 'Qəbul Sınaqları',
    icon: Compass,
    items: [
      { id: 'frtl', title: 'Fizika-Riyaziyyat Liseyi (FRTL)', desc: 'Dəqiq elmlər qəbul sınaqları' },
      { id: 'kbtl', title: 'Kimya-Biologiya Liseyi (KBTL)', desc: 'Təbiət fənləri üzrə xüsusi sınaqlar' },
      { id: 'herbi', title: 'Hərbi Liseylər', desc: 'C.Naxçıvanski və H.Əliyev adına hərbi lisey' },
      { id: 'lisey-5-8', title: '5-8-ci sinif Lisey Qəbul', desc: 'İstedadlı şagirdlərin qəbul imtahanı' },
    ]
  }
];

interface NavbarProps {
  currentUser: User;
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
  onSwitchRole,
  onOpenProModal,
  onOpenAdminAuth,
  onOpenAuthModal,
  onToggleSidebar,
  onLogout,
  onSelectCategory,
  onNavigateTab,
}) => {
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Secret 10-click logo trigger for admin prompt (Section XV)
  const handleLogoClick = () => {
    const nextCount = logoClicks + 1;
    setLogoClicks(nextCount);
    if (nextCount >= 10) {
      setLogoClicks(0);
      onOpenAdminAuth();
    }
  };

  const handleDropdownSelect = (catId: string, itemId: string) => {
    setActiveDropdown(null);
    if (onSelectCategory) {
      onSelectCategory(catId, itemId);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-50 px-3 sm:px-6 flex items-center justify-between shadow-xs gap-3">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            title="Menyunu aç"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="EDUNEX Quiz Creator"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tight leading-none font-sans">
                EDUNEX
              </span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 leading-none">
                Quiz Creator
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              Peşəkar Təhsil Platforması
            </p>
          </div>
        </div>
      </div>

      {/* ==============================================================
          ƏSAS MENYU: AI İLƏ TEST YARAT + SINAQ İMTAHANLARI + 4 ƏSAS İMTAHAN MODELİ
          ============================================================== */}
      <nav ref={dropdownRef} className="hidden xl:flex items-center gap-2 relative">
        {/* AI ilə test yarat Direct Button */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab('ai_test');
            }
          }}
          className="px-3 py-2 rounded-xl text-[13px] font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-indigo-100 border border-violet-500"
          title="Süni İntellektlə Avtomatik Test Hazırla"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>AI ilə test yarat</span>
        </button>

        {/* Sınaq İmtahanları Direct Button */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) {
              onNavigateTab('exams_hub');
            } else if (onSelectCategory) {
              onSelectCategory('all', 'all');
            }
          }}
          className="px-3.5 py-2 rounded-xl text-[13px] font-black tracking-tight text-slate-900 hover:text-black hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-1.5 transition-all cursor-pointer border border-transparent hover:border-indigo-200"
          title="Fənlər və Siniflər üzrə Sınaq İmtahanları"
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Sınaq İmtahanları</span>
        </button>

        {MAIN_MENU_CATEGORIES.map((cat) => {
          const isOpen = activeDropdown === cat.id;
          const IconComponent = cat.icon;

          return (
            <div key={cat.id} className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(isOpen ? null : cat.id)}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-black tracking-tight flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOpen
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200/90 text-slate-900 hover:text-black'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-indigo-600'}`} />
                <span>{cat.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
              </button>

              {/* Açılan Dropdown Panel */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center gap-1.5">
                      <IconComponent className="w-3.5 h-3.5 text-indigo-600" />
                      {cat.label} Bölməsi
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {cat.badge}
                    </span>
                  </div>

                  <div className="flex flex-col py-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleDropdownSelect(cat.id, item.id)}
                        className="w-full px-3.5 py-2 text-left hover:bg-indigo-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-600 mt-1.5 shrink-0 transition-colors" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Right: Role Switcher, PRO Badge, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role Switcher Pill */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => onSwitchRole('teacher')}
            className={`px-3 py-1 rounded-lg transition-all ${
              currentUser.role === 'teacher'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Müəllim
          </button>
          <button
            onClick={() => onSwitchRole('student')}
            className={`px-3 py-1 rounded-lg transition-all ${
              currentUser.role === 'student'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Şagird
          </button>
          <button
            onClick={() => {
              if (currentUser.role === 'admin') {
                onSwitchRole('admin');
              } else {
                onOpenAdminAuth();
              }
            }}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
              currentUser.role === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            <Shield className="w-3 h-3" />
            Admin
          </button>
        </div>

        {/* Futuristic Auth Button */}
        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
            title="Daxil Ol və ya Qeydiyyat"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Daxil Ol / Qeydiyyat</span>
          </button>
        )}

        {/* PRO Badge / Upgrade Button */}
        {currentUser.is_pro ? (
          <button
            onClick={onOpenProModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-500/20 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold hover:shadow-xs transition-all"
            title="PRO Abunəlik məlumatı"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>PRO Aktivdir</span>
          </button>
        ) : (
          <button
            onClick={onOpenProModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-all"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>PRO-ya Keç</span>
          </button>
        )}

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
            {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              {currentUser.full_name}
            </span>
            <span className="text-[10px] text-slate-400 capitalize block leading-tight">
              {currentUser.role === 'admin' ? 'Baş Administrator' : currentUser.role === 'teacher' ? 'Müəllim' : 'Şagird'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            title="Çıxış"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
