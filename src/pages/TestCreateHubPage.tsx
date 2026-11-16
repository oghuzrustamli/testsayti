// src/pages/TestCreateHubPage.tsx
// Master Hub for "Test Yarat" - Allows teacher to choose between OMR Test and Interactive Test
import React, { useState, useEffect } from 'react';
import { User, Test } from '../types';
import { OmrTestCreatorPage } from './OmrTestCreatorPage';
import { TestCreatorPage } from './TestCreatorPage';
import { api } from '../lib/api';
import {
  FileCheck2,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  Calculator,
  Compass,
  CheckCircle2,
  UploadCloud,
  GraduationCap,
  HelpCircle,
  Clock,
  Printer,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface TestCreateHubPageProps {
  user: User;
  editTestId?: string | null;
  onBack?: () => void;
  onSaved?: (test: Test, shouldShare?: boolean) => void;
}

export const TestCreateHubPage: React.FC<TestCreateHubPageProps> = ({
  user,
  editTestId,
  onBack,
  onSaved,
}) => {
  // Mode: 'hub' | 'omr' | 'interactive'
  const [selectedMode, setSelectedMode] = useState<'hub' | 'omr' | 'interactive'>('hub');
  const [loadingEditTest, setLoadingEditTest] = useState<boolean>(false);

  // If editing an existing test, load its metadata to determine whether it's OMR or Interactive
  useEffect(() => {
    if (editTestId) {
      setLoadingEditTest(true);
      api.getTestById(editTestId)
        .then((t) => {
          if (t && t.test_mode === 'answered') {
            setSelectedMode('omr');
          } else {
            setSelectedMode('interactive');
          }
        })
        .catch(() => {
          setSelectedMode('interactive');
        })
        .finally(() => {
          setLoadingEditTest(false);
        });
    } else {
      setSelectedMode('hub');
    }
  }, [editTestId]);

  if (loadingEditTest) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600">Test məlumatları yüklənir...</p>
      </div>
    );
  }

  // 1. OMR TEST MODE
  if (selectedMode === 'omr') {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Navigation Bar to switch back to Hub */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs shrink-0 shadow-sm z-20">
          <button
            type="button"
            onClick={() => setSelectedMode('hub')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Test Yarat Seçiminə Qayıt</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Rejim:</span>
            <strong className="text-emerald-400 font-bold">OMR Test Yarat</strong>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <OmrTestCreatorPage
            user={user}
            onBack={() => setSelectedMode('hub')}
            onSaved={(savedTest) => {
              if (onSaved) onSaved(savedTest, false);
            }}
          />
        </div>
      </div>
    );
  }

  // 2. INTERACTIVE TEST MODE
  if (selectedMode === 'interactive') {
    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        {/* Navigation Bar to switch back to Hub */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs shrink-0 shadow-sm sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSelectedMode('hub')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Test Yarat Seçiminə Qayıt</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Rejim:</span>
            <strong className="text-indigo-400 font-bold">İnteraktiv Test Yarat</strong>
          </div>
        </div>

        <div className="flex-1 pb-16">
          <TestCreatorPage
            user={user}
            editTestId={editTestId}
            onBack={() => setSelectedMode('hub')}
            onSaved={onSaved || (() => {})}
          />
        </div>
      </div>
    );
  }

  // 3. MASTER HUB SELECTION SCREEN
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-8 flex flex-col justify-center items-center">
      <div className="max-w-5xl w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>EDUNEX İmtahan və Test Sistemi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Test Yaratmaq Üsulunu Seçin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
            Müasir təhsil standartlarına uyğun iki fərqli yanaşma: PDF/Word sənədi ilə sürətli OMR test və ya KaTeX düsturlu, qrafikli tam interaktiv imtahan hazırlayın.
          </p>
        </div>

        {/* 2 Big Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* ================================================================= */}
          {/* CARD 1: OMR TEST YARAT                                            */}
          {/* ================================================================= */}
          <div
            onClick={() => setSelectedMode('omr')}
            className="group relative bg-white rounded-3xl border-2 border-slate-200/90 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between p-6 sm:p-8"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:h-2.5 transition-all" />

            <div>
              {/* Badge & Icon Row */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Sənəd Əsaslı • Sürətli
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                OMR TEST YARAT
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                PDF və Word sənədlərindən istifadə etməklə hazır sual kitabçasını sistemə daxil edin və A, B, C, D, E variantları ilə cavab açarını təyin edin.
              </p>

              {/* Feature Points */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>PDF, DOC, DOCX sənədləri</strong> — Birbaşa fayl seçimi və Drag & Drop ilə yükləmə</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>13px kompakt cavab düymələri</strong> — A, B, C, D, E optik cavab cədvəli və ani yadda saxlama</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Şagirdə eyni sənədin nümayişi</strong> — Şagird ekranda PDF-i oxuyur, sağda OMR kartını doldurur</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>A4 Optik Form və Açar Çapı</strong> — Standart OMR cavab kartını PDF olaraq yükləmək və çap etmək</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 group-hover:underline">
                OMR Test İnterfeysinə Keç
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 2: İNTERAKTİV TEST YARAT                                    */}
          {/* ================================================================= */}
          <div
            onClick={() => setSelectedMode('interactive')}
            className="group relative bg-white rounded-3xl border-2 border-slate-200/90 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between p-6 sm:p-8"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 to-violet-500 group-hover:h-2.5 transition-all" />

            <div>
              {/* Badge & Icon Row */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Geniş Redaktor • KaTeX & Qrafik
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                İNTERAKTİV TEST YARAT
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Sualları sistem daxilində tam yaradın: riyazi düsturlar, funksiya qrafikləri, cədvəllər, şəkillər və fərqli imtahan modelləri.
              </p>

              {/* Feature Points */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>4 İmtahan Modeli</strong> — Buraxılış, Blok, Sinif (4, 9, 11) və Məktəbdaxili (1-11) imtahanlar</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>3 Sual Tipi</strong> — Qapalı (A-E), Açıq (ədədi/riyazi yazılı cavab) və Situasiya tipli qrup sualları</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Canlı KaTeX Düstur Redaktoru</strong> — Kəsrlər, köklər, qüvvətlər, inteqrallar, matrislər və klaviatura ilə LaTeX yazma</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Qrafik Laboratoriyası</strong> — X-Y koordinat oxları, parabolalar, çevrələr, üçbucaqlar və canlı önizləmə</span>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                İnteraktiv Redaktora Keç
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Hazırladığınız testlər avtomatik olaraq <strong>"Testlərim"</strong> bölməsində arxivlənir və istənilən vaxt redaktə edilə və ya şagirdlərlə paylaşıla bilər.
        </div>
      </div>
    </div>
  );
};
