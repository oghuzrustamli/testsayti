// src/components/AboutVideoShowcase.tsx
// EDUNEX – Süni İntellekt Tanıtım Videosu və İnteraktiv Video Pleyer
// Professional səsli təqdimat, fon musiqisi, real interfeys görüntüləri və idarəetmə elementləri
import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Sparkles,
  Award,
  Layers,
  GraduationCap,
  School,
  FileCheck,
  CheckCircle2,
  Brain,
  Cpu,
  MonitorPlay,
  FileQuestion,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface AboutVideoShowcaseProps {
  onClose?: () => void;
  isModal?: boolean;
}

interface VideoScene {
  id: number;
  startSec: number;
  endSec: number;
  title: string;
  badge: string;
  speechText: string;
  subtitle: string;
}

const VIDEO_SCENES: VideoScene[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 10,
    title: 'EDUNEX — Təhsilin Rəqəmsal İnkişaf Platforması',
    badge: 'GİRİŞ VƏ MİSSİYA',
    speechText: 'Xoş gəlmisiniz! EDUNEX — təhsil prosesinin rəqəmsallaşdırılması və qiymətləndirmənin yeni mərhələyə çatdırılması üçün yaradılmış innovativ milli platformadır.',
    subtitle: 'EDUNEX — Müasir məktəblər, müəllimlər və şagirdlər üçün rəqəmsal təhsil ekosistemi.'
  },
  {
    id: 2,
    startSec: 10,
    endSec: 22,
    title: 'Süni İntellektlə İmtahan və Test Hazırlığı',
    badge: 'AI TEST CREATOR',
    speechText: 'Platformanın süni intellekt mühərriki rəsmi dərslik proqramlarına tam uyğun olaraq saniyələr içində fənlər üzrə testlər, situasiya və açıq tipli suallar formalaşdırır.',
    subtitle: 'Dərslik mövzuları əsasında I-XI siniflər üzrə avtomatlaşdırılmış AI sual bazası.'
  },
  {
    id: 3,
    startSec: 22,
    endSec: 34,
    title: 'İnteraktiv İmtahan və OMR Optik Cavab Kartları',
    badge: 'OMR VƏ ONLAYN İMTAHAN',
    speechText: 'Müəllimlər həm onlayn interaktiv testlər apara, həm də A4 formatında çap olunan OMR cavab kartları ilə saniyələr içində optik qiymətləndirmə həyata keçirə bilər.',
    subtitle: 'İnteraktiv test keçirilməsi və saniyələr içində optik cavab kartlarının yoxlanması.'
  },
  {
    id: 4,
    startSec: 34,
    endSec: 46,
    title: '3 Mərhələli Akademik Reytinq və Regional Statistika',
    badge: 'AKADEMİK ANALİTİKA',
    speechText: 'Üç mərhələli analitik sistem: məktəb daxilində şagird reytinqi, məktəblərarası müqayisə və Naxçıvan Muxtar Respublikasının 8 rayonu üzrə akademik reytinq diaqramları.',
    subtitle: 'Şagird, məktəb və rayon səviyyəsində faktiki imtahan nəticələrinə əsaslanan canlı statistika.'
  },
  {
    id: 5,
    startSec: 46,
    endSec: 56,
    title: 'Müəllif və Gələcəyə Baxış',
    badge: 'MÜƏLLİF: RƏŞAD KİRMANOĞLU',
    speechText: 'EDUNEX — ideya müəllifi, tərtibatçısı və dizayneri Rəşad Kirmanoğlu tərəfindən təhsilin gələcəyi üçün hazırlanmış milli rəqəmsal platformadır.',
    subtitle: 'İdeya Müəllifi, Tərtibatçısı və Dizayneri: Rəşad Kirmanoğlu. Gələcəyin təhsili bu gündən başlayır.'
  }
];

const TOTAL_DURATION = 56; // 56 saniyəlik tanıtım videosu

export const AboutVideoShowcase: React.FC<AboutVideoShowcaseProps> = ({ onClose, isModal = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio Context Ref for synthetic ambient background music
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);
  const lastSpokenSceneRef = useRef<number>(-1);

  // Current Scene helper
  const currentScene = VIDEO_SCENES.find(
    (s) => currentTime >= s.startSec && currentTime < s.endSec
  ) || VIDEO_SCENES[0];

  // Initialize Web Audio Ambient Synth for futuristic background track
  const startBackgroundAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (synthNodesRef.current) return;

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Warm ambient pads (chord: F - A - C - E)
      const freqs = [174.61, 220.0, 261.63, 329.63];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      synthNodesRef.current = { gain: masterGain, oscs };
    } catch (e) {
      console.warn('Web Audio Ambient synthesis not supported:', e);
    }
  };

  const stopBackgroundAudio = () => {
    try {
      if (synthNodesRef.current) {
        synthNodesRef.current.oscs.forEach((o) => {
          try { o.stop(); o.disconnect(); } catch {}
        });
        synthNodesRef.current = null;
      }
    } catch (e) {
      console.warn('Stop audio fallback:', e);
    }
  };

  // Azerbaijani Voiceover synthesis
  const speakSceneNarration = (text: string) => {
    if (isMuted) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'az-AZ';
      utterance.rate = 1.0;
      utterance.pitch = 1.02;

      // Try to find an Azerbaijani or Turkish voice for natural speech
      const voices = window.speechSynthesis.getVoices();
      const azVoice = voices.find(v => v.lang.startsWith('az') || v.lang.startsWith('tr'));
      if (azVoice) {
        utterance.voice = azVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis fallback:', err);
    }
  };

  // Video playback timer
  useEffect(() => {
    let interval: any = null;

    if (isPlaying) {
      startBackgroundAudio();

      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            stopBackgroundAudio();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            return 0;
          }
          return Number((prev + 0.25).toFixed(2));
        });
      }, 250);
    } else {
      stopBackgroundAudio();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Handle scene voice narration when moving into a new scene
  useEffect(() => {
    if (isPlaying && currentScene && lastSpokenSceneRef.current !== currentScene.id) {
      lastSpokenSceneRef.current = currentScene.id;
      speakSceneNarration(currentScene.speechText);
    }
  }, [isPlaying, currentScene]);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (synthNodesRef.current && audioCtxRef.current) {
      synthNodesRef.current.gain.gain.setValueAtTime(nextMuted ? 0 : 0.08, audioCtxRef.current.currentTime);
    }
    if (nextMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    } else if (!nextMuted && isPlaying && currentScene) {
      speakSceneNarration(currentScene.speechText);
    }
  };

  // Replay
  const handleReplay = () => {
    setCurrentTime(0);
    lastSpokenSceneRef.current = -1;
    setIsPlaying(true);
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Seek time
  const handleSeek = (sec: number) => {
    setCurrentTime(sec);
    lastSpokenSceneRef.current = -1;
    if (isPlaying) {
      const targetScene = VIDEO_SCENES.find((s) => sec >= s.startSec && sec < s.endSec);
      if (targetScene) {
        speakSceneNarration(targetScene.speechText);
      }
    }
  };

  const progressPct = Math.min(100, (currentTime / TOTAL_DURATION) * 100);

  // Format time mm:ss
  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col relative select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Video Screen Top Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs tracking-wider text-white">EDUNEX AI SHOWCASE</span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                OFFICIAL TANITIM
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-medium">Süni İntellektlə Hazırlanmış Video Təqdimat</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-bold">
            {formatSec(currentTime)} / {formatSec(TOTAL_DURATION)}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==============================================================
          VIDEO DISPLAY SCREEN (5 DİNAMİK VİZUAL SƏHNƏ)
          ============================================================== */}
      <div className="relative w-full aspect-video min-h-[300px] sm:min-h-[420px] max-h-[580px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 overflow-hidden flex items-center justify-center p-6 sm:p-12">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Glow Radial Spots */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ==================== SƏHNƏ 1: GİRİŞ ==================== */}
        {currentScene.id === 1 && (
          <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/20 animate-pulse">
              <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 tracking-widest inline-block mb-2">
                RƏQƏMSAL TƏHSİL PLATFORMASI
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                EDUNEX
              </h2>
              <p className="text-cyan-200/90 text-sm sm:text-base font-bold mt-1">
                Təhsilin Rəqəmsal İnkişaf Platforması
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300">
                Süni İntellekt
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300">
                OMR Optik Yoxlama
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-bold text-slate-300">
                Regional Reytinq
              </span>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 2: AI TEST CREATOR ==================== */}
        {currentScene.id === 2 && (
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400 animate-bounce" />
              <span className="text-xs font-black uppercase text-cyan-300 tracking-wider">
                Süni İntellektlə Ani Sual Və Test Tərtibi
              </span>
            </div>

            {/* Simulated UI Window */}
            <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Test Generatoru • I-XI Sinif Dərslik Proqramları
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Aktiv Mühərrik
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Fənn</span>
                  <span className="text-xs font-black text-indigo-300 mt-0.5 block">Riyaziyyat & Cəbr</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Sinif</span>
                  <span className="text-xs font-black text-cyan-300 mt-0.5 block">IX sinif</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Sual Sayı</span>
                  <span className="text-xs font-black text-emerald-300 mt-0.5 block">25 Sual (DİM Formatı)</span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 text-left">
                <span className="text-[11px] font-bold text-indigo-200 block">
                  Sual 1. Kvadrat tənliyin köklərinin tapılması və Viyet teoreminin tətbiqi...
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">A) x = 3, y = -2</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">B) x = 1, y = 5</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">C) x = 0, y = 4</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 3: OMR VƏ ONLAYN İMTAHAN ==================== */}
        {currentScene.id === 3 && (
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                OMR Optik Cavab Kartları & İnteraktiv İmtahan Modulu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {/* OMR Preview Card */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 shadow-xl text-left">
                <span className="text-[10px] font-black uppercase text-amber-400 block mb-1">
                  A4 OMR Çap Kartı & Skaner
                </span>
                <h4 className="text-xs font-black text-white">Avtomatlaşdırılmış Cavab Vərəqi</h4>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center text-[9px] font-bold">1</div>
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700" />
                  <div className="w-4 h-4 rounded-full bg-emerald-500 border border-emerald-400" />
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Kamera və ya skanerlə dərhal nəticələrin hesablanması.
                </p>
              </div>

              {/* Interactive Exam Preview */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 shadow-xl text-left">
                <span className="text-[10px] font-black uppercase text-cyan-400 block mb-1">
                  Canlı Onlayn İmtahan
                </span>
                <h4 className="text-xs font-black text-white">Şagird İmtahan Paneli</h4>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Qalan vaxt: 34:12</span>
                  <span className="text-emerald-400 font-bold">Tamamlandı: 75%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 4: REGİONAL STATİSTİKA VƏ REYTİNQ ==================== */}
        {currentScene.id === 4 && (
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                3 Mərhələli Reytinq: Şagird • Məktəb • Rayon
              </span>
            </div>

            <div className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">
                  Naxçıvan MR Rayonlararası Müqayisə Diaqramı
                </span>
                <span className="text-[10px] font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  8 İnzibati Ərazi
                </span>
              </div>

              {/* Bar charts preview */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end pt-4 min-h-[90px]">
                {[
                  { name: 'Naxçıvan', val: 86 },
                  { name: 'Babək', val: 78 },
                  { name: 'Şərur', val: 82 },
                  { name: 'Ordubad', val: 80 },
                  { name: 'Culfa', val: 75 },
                  { name: 'Kəngərli', val: 72 },
                  { name: 'Şahbuz', val: 74 },
                  { name: 'Sədərək', val: 70 },
                ].map((item, idx) => (
                  <div key={item.name} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                        idx === 0 ? 'bg-gradient-to-t from-amber-500 to-amber-300' : 'bg-indigo-600/70'
                      }`}
                      style={{ height: `${item.val * 0.8}px` }}
                    />
                    <span className="text-[9px] font-bold text-slate-400 truncate max-w-full">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 5: MÜƏLLİF VƏ YEKUN ==================== */}
        {currentScene.id === 5 && (
          <div className="relative z-10 flex flex-col items-center text-center gap-3 max-w-xl animate-in fade-in zoom-in-95 duration-500">
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 tracking-widest">
              LAYİHƏNİN MÜƏLLİFİ VƏ TƏRTİBATÇISI
            </span>

            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Rəşad Kirmanoğlu
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md">
              EDUNEX təhsil prosesinə qabaqcıl rəqəmsal yanaşma gətirmək, müəllim və şagirdlərin imkanlarını genişləndirmək məqsədilə yaradılmışdır.
            </p>

            {/* Signature effect */}
            <div className="mt-1 px-5 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-lg">
              <span className="font-serif italic text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                Rəşad Kirmanoğlu
              </span>
              <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                Müəllif Hüquqları Qorunur • EDUNEX 2026
              </span>
            </div>
          </div>
        )}

        {/* Big Center Play Button when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:scale-105 transition-all cursor-pointer backdrop-blur-xs ring-4 ring-white/20"
            title="Videonu başlat"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
          </button>
        )}

        {/* Synced Subtitle / Caption Bar */}
        <div className="absolute bottom-16 left-4 right-4 z-20 text-center pointer-events-none">
          <div className="inline-block px-4 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold text-cyan-200 shadow-xl max-w-2xl leading-snug">
            {currentScene.subtitle}
          </div>
        </div>
      </div>

      {/* ==============================================================
          VIDEO CONTROLS & TIMELINE BAR
          ============================================================== */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 flex flex-col gap-2.5 z-30">
        {/* Progress Timeline Scrubber */}
        <div className="relative w-full flex items-center group cursor-pointer">
          <input
            type="range"
            min={0}
            max={TOTAL_DURATION}
            step={0.5}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover:h-2 transition-all"
          />
        </div>

        {/* Səhnə Markerləri */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold px-1">
          {VIDEO_SCENES.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => handleSeek(scene.startSec)}
              className={`hover:text-cyan-300 transition-colors cursor-pointer ${
                currentScene.id === scene.id ? 'text-cyan-400 font-black' : ''
              }`}
            >
              {scene.id}. {scene.badge.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
              title={isPlaying ? 'Fasilə' : 'Başlat'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>

            {/* Replay */}
            <button
              type="button"
              onClick={handleReplay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Yenidən izlə"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isMuted ? 'bg-rose-950/60 text-rose-400 border border-rose-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isMuted ? 'Səsi aç' : 'Səsi bağla'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Time Indicator */}
            <span className="text-xs font-mono font-bold text-slate-300 ml-1">
              {formatSec(currentTime)} <span className="text-slate-500">/ {formatSec(TOTAL_DURATION)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Kiçilt' : 'Tam ekran'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
