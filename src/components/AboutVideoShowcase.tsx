// src/components/AboutVideoShowcase.tsx
// EDUNEX – Süni İntellekt Tanıtım Videosu və Yığcam İnteraktiv Video Pleyer
// Dəqiq montaj: Lazımsız boşluqlar kəsilib, fasiləsiz aydın qadın səsi, dinamik ritm və kompakt 16:9 pleyer
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
  FileCheck,
  CheckCircle2,
  Brain,
  Cpu,
  Printer
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

// Montaj edilmiş dinamik 34 saniyəlik ritmik video səhnələri
// Əvvəl və sondakı boşluqlar aradan qaldırılıb, hər səhnə ardıcıl və məzmunludur
const VIDEO_SCENES: VideoScene[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 6.5,
    title: 'EDUNEX — Təhsilin Rəqəmsal İnkişaf Platforması',
    badge: 'MİSSİYA',
    speechText: 'EDUNEX — təhsil prosesinin rəqəmsallaşdırılması və müasir qiymətləndirmə üçün yaradılmış milli innovativ platformadır.',
    subtitle: 'EDUNEX — Müasir məktəblər, müəllimlər və şagirdlər üçün rəqəmsal ekosistem.'
  },
  {
    id: 2,
    startSec: 6.5,
    endSec: 13.5,
    title: 'Süni İntellektlə İmtahan və Test Hazırlığı',
    badge: 'AI TEST',
    speechText: 'Süni intellekt mühərriki dərslik proqramları üzrə saniyələr içində fənlər, situasiya və çoxvariantlı testlər hazırlayır.',
    subtitle: 'Dərslik mövzuları əsasında I-XI siniflər üzrə avtomatlaşdırılmış AI sual bazası.'
  },
  {
    id: 3,
    startSec: 13.5,
    endSec: 20.5,
    title: 'İnteraktiv İmtahan və OMR Optik Cavab Kartları',
    badge: 'OMR & ONLAYN',
    speechText: 'İnteraktiv imtahanlar və A4 formatlı OMR optik kartları ilə saniyələr içində avtomatlaşdırılmış qiymətləndirmə aparılır.',
    subtitle: 'İnteraktiv testlər və saniyələr içində optik cavab kartlarının yoxlanması.'
  },
  {
    id: 4,
    startSec: 20.5,
    endSec: 27.5,
    title: '3 Mərhələli Akademik Reytinq və Regional Statistika',
    badge: 'ANALİTİKA',
    speechText: 'Üç pilləli akademik reytinq və Naxçıvan Muxtar Respublikasının səkkiz rayonu üzrə canlı təhsil analitikası təqdim edilir.',
    subtitle: 'Şagird, məktəb və regional səviyyədə canlı imtahan nəticələri.'
  },
  {
    id: 5,
    startSec: 27.5,
    endSec: 34.0,
    title: 'Müəllif və Gələcəyə Baxış',
    badge: 'RƏŞAD KİRMANOĞLU',
    speechText: 'İdeya müəllifi, tərtibatçısı və dizayneri Rəşad Kirmanoğlu olan EDUNEX — təhsilin gələcəyini bu gün reallığa çevirir.',
    subtitle: 'İdeya Müəllifi, Tərtibatçısı və Dizayneri: Rəşad Kirmanoğlu.'
  }
];

const TOTAL_DURATION = 34.0; // Dəqiq montaj edilmiş ümumi xronometraj: 34 saniyə

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
      // Yüngül, səsi boğmayan arxa fon musiqisi
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.05, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Warm ambient harmonic pads
      const freqs = [174.61, 220.0, 261.63, 329.63];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
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

  // Aydın, axıcı və fasiləsiz qadın səsi seçimi və səsləndirmə
  const speakSceneNarration = (text: string) => {
    if (isMuted) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'az-AZ';
      // Ritmik, təbii və canlı danışıq tempi
      utterance.rate = 1.06;
      // İncə və aydın qadın səsi tonu (pitch: 1.15)
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices();
      
      // Qadın səslərini öncəliklə axtarırıq (az/tr və ya female açar sözləri)
      const femaleVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        const isLangMatch = lang.startsWith('az') || lang.startsWith('tr');
        const isFemale = name.includes('female') || name.includes('kadın') || name.includes('qadın') ||
                         name.includes('dilara') || name.includes('yelda') || name.includes('filiz') ||
                         name.includes('seda') || name.includes('zira') || name.includes('aylin');
        return isLangMatch && isFemale;
      }) || voices.find(v => {
        const lang = v.lang.toLowerCase();
        return lang.startsWith('az') || lang.startsWith('tr');
      }) || voices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('karen');
      });

      if (femaleVoice) {
        utterance.voice = femaleVoice;
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
            return 0; // Sonda dərhal bitir, boş vaxt itirmir
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

  // Start Play instantly with zero delay
  const handleStartPlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Dərhal ilk səhnənin nitqini başlat (sıfır gözləmə)
      lastSpokenSceneRef.current = currentScene.id;
      speakSceneNarration(currentScene.speechText);
    } else {
      setIsPlaying(false);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (synthNodesRef.current && audioCtxRef.current) {
      synthNodesRef.current.gain.gain.setValueAtTime(nextMuted ? 0 : 0.05, audioCtxRef.current.currentTime);
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
    lastSpokenSceneRef.current = 1;
    setIsPlaying(true);
    speakSceneNarration(VIDEO_SCENES[0].speechText);
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
    const targetScene = VIDEO_SCENES.find((s) => sec >= s.startSec && sec < s.endSec) || VIDEO_SCENES[0];
    lastSpokenSceneRef.current = targetScene.id;
    if (isPlaying) {
      speakSceneNarration(targetScene.speechText);
    }
  };

  // Format time mm:ss
  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xl flex flex-col relative select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Video Screen Top Header - Yığcam və səliqəli */}
      <div className="absolute top-0 left-0 right-0 z-30 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-[11px] tracking-wider text-white">EDUNEX AI SHOWCASE</span>
            <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              RƏSMİ TANITIM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-bold">
            {formatSec(currentTime)} / {formatSec(TOTAL_DURATION)}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ==============================================================
          VIDEO DISPLAY SCREEN (16:9 Nisbəti Qorunan Yığcam Ekran)
          ============================================================== */}
      <div className="relative w-full aspect-video min-h-[220px] sm:min-h-[280px] max-h-[380px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* ==================== SƏHNƏ 1: GİRİŞ (0 - 6.5 san) ==================== */}
        {currentScene.id === 1 && (
          <div className="relative z-10 flex flex-col items-center text-center gap-2.5 max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20 animate-pulse">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 tracking-wider inline-block mb-1">
                RƏQƏMSAL TƏHSİL PLATFORMASI
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                EDUNEX
              </h2>
              <p className="text-cyan-200/90 text-xs sm:text-sm font-bold mt-0.5">
                Təhsilin Rəqəmsal İnkişaf Platforması
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] font-bold text-slate-300">
                Süni İntellekt
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] font-bold text-slate-300">
                OMR Optik Kart
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] font-bold text-slate-300">
                NMR Reytinq
              </span>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 2: AI TEST CREATOR (6.5 - 13.5 san) ==================== */}
        {currentScene.id === 2 && (
          <div className="relative z-10 flex flex-col items-center gap-2.5 max-w-lg w-full animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase text-cyan-300 tracking-wider">
                Süni İntellektlə Ani Sual Və Test Tərtibi
              </span>
            </div>

            <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  AI Test Generatoru • I-XI Sinif Dərslik Proqramları
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                  Aktiv
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
                <div className="p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Fənn</span>
                  <span className="text-[11px] font-black text-indigo-300 block">Riyaziyyat</span>
                </div>
                <div className="p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Sinif</span>
                  <span className="text-[11px] font-black text-cyan-300 block">IX sinif</span>
                </div>
                <div className="p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">Format</span>
                  <span className="text-[11px] font-black text-emerald-300 block">25 Sual DİM</span>
                </div>
              </div>

              <div className="mt-2 p-2 bg-indigo-950/40 rounded-lg border border-indigo-800/40 text-left">
                <span className="text-[10px] font-bold text-indigo-200 block truncate">
                  Sual 1. Kvadrat tənliyin köklərinin tapılması və Viyet teoreminin tətbiqi...
                </span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">A) x = 3, y = -2</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">B) x = 1, y = 5</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 3: OMR VƏ ONLAYN İMTAHAN (13.5 - 20.5 san) ==================== */}
        {currentScene.id === 3 && (
          <div className="relative z-10 flex flex-col items-center gap-2 max-w-lg w-full animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black uppercase text-emerald-300 tracking-wider">
                OMR Optik Kartlar & İnteraktiv İmtahan Modulu
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              {/* OMR Card */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 shadow-lg text-left">
                <span className="text-[9px] font-black uppercase text-amber-400 block mb-0.5">
                  A4 OMR Çap Kartı
                </span>
                <h4 className="text-[11px] font-bold text-white">Optik Cavab Vərəqi</h4>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center text-[8px] font-bold">1</div>
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">
                  Kamera və ya skanerlə ani qiymətləndirmə.
                </p>
              </div>

              {/* Online Exam Card */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 shadow-lg text-left">
                <span className="text-[9px] font-black uppercase text-cyan-400 block mb-0.5">
                  Canlı İmtahan
                </span>
                <h4 className="text-[11px] font-bold text-white">Şagird Paneli</h4>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1 font-mono">
                  <span>Vaxt: 34:12</span>
                  <span className="text-emerald-400 font-bold">75% Tamamlandı</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 4: REGİONAL STATİSTİKA (20.5 - 27.5 san) ==================== */}
        {currentScene.id === 4 && (
          <div className="relative z-10 flex flex-col items-center gap-2 max-w-lg w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
                3 Mərhələli Reytinq: Şagird • Məktəb • Rayon
              </span>
            </div>

            <div className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 shadow-xl">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-200">
                  Naxçıvan MR Rayonlararası Müqayisə Diaqramı
                </span>
                <span className="text-[9px] font-black text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800">
                  8 Rayon
                </span>
              </div>

              {/* Bar charts preview */}
              <div className="grid grid-cols-8 gap-1 items-end pt-2 min-h-[65px]">
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
                  <div key={item.name} className="flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full max-w-[20px] rounded-t transition-all ${
                        idx === 0 ? 'bg-gradient-to-t from-amber-500 to-amber-300' : 'bg-indigo-600/70'
                      }`}
                      style={{ height: `${item.val * 0.55}px` }}
                    />
                    <span className="text-[8px] font-bold text-slate-400 truncate max-w-full">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SƏHNƏ 5: MÜƏLLİF VƏ YEKUN (27.5 - 34.0 san) ==================== */}
        {currentScene.id === 5 && (
          <div className="relative z-10 flex flex-col items-center text-center gap-2 max-w-md animate-in fade-in zoom-in-95 duration-300">
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 tracking-wider">
              İDEYA MÜƏLLİFİ VƏ TƏRTİBATÇISI
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rəşad Kirmanoğlu
            </h3>

            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed max-w-sm">
              EDUNEX təhsil prosesinə qabaqcıl rəqəmsal yanaşma gətirmək, müəllim və şagirdlərin imkanlarını genişləndirmək məqsədilə yaradılmışdır.
            </p>

            <div className="mt-0.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow">
              <span className="font-serif italic text-sm sm:text-base font-bold bg-gradient-to-r from-amber-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
                Rəşad Kirmanoğlu
              </span>
              <span className="text-[8px] text-slate-400 block font-mono">
                Müəllif Hüquqları Qorunur • EDUNEX 2026
              </span>
            </div>
          </div>
        )}

        {/* Big Center Play Button when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={handleStartPlay}
            className="absolute z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600/95 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/50 hover:scale-105 transition-all cursor-pointer backdrop-blur-xs ring-4 ring-white/20"
            title="Videonu başlat"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5 fill-white" />
          </button>
        )}

        {/* Synced Subtitle / Caption Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-20 text-center pointer-events-none">
          <div className="inline-block px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-semibold text-cyan-200 shadow-lg max-w-xl leading-tight">
            {currentScene.subtitle}
          </div>
        </div>
      </div>

      {/* ==============================================================
          VIDEO CONTROLS & TIMELINE BAR - Yığcam İdarəetmə
          ============================================================== */}
      <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex flex-col gap-1.5 z-30">
        {/* Progress Timeline Scrubber */}
        <div className="relative w-full flex items-center group cursor-pointer">
          <input
            type="range"
            min={0}
            max={TOTAL_DURATION}
            step={0.25}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover:h-1.5 transition-all"
          />
        </div>

        {/* Səhnə Markerləri */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold px-0.5">
          {VIDEO_SCENES.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => handleSeek(scene.startSec)}
              className={`hover:text-cyan-300 transition-colors cursor-pointer ${
                currentScene.id === scene.id ? 'text-cyan-400 font-black' : ''
              }`}
            >
              {scene.id}. {scene.badge}
            </button>
          ))}
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={handleStartPlay}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
              title={isPlaying ? 'Fasilə' : 'Başlat'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />}
            </button>

            {/* Replay */}
            <button
              type="button"
              onClick={handleReplay}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Yenidən izlə"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isMuted ? 'bg-rose-950/60 text-rose-400 border border-rose-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isMuted ? 'Səsi aç' : 'Səsi bağla'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Time Indicator */}
            <span className="text-[10px] font-mono font-bold text-slate-300 ml-1">
              {formatSec(currentTime)} <span className="text-slate-500">/ {formatSec(TOTAL_DURATION)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Fullscreen */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Kiçilt' : 'Tam ekran'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
