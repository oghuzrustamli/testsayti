// src/components/AboutVideoShowcase.tsx
// ATROQ Education – Virtual Qadın Aparıcılı Peşəkar Televiziya Tele-Təqdimat Videosu
// 48 saniyəlik dinamik 16:9 Full HD studiya təqdimatı, dodaq hərəkətləri (lip-sync),
// canlı ATROQ Education proqram görüntüləri, Azərbaycan dilində qadın səsi və tam idarəetmə elementləri
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
  Printer,
  Radio,
  Tv,
  Check,
  Activity
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
  newsTicker: string;
  speechText: string;
  subtitle: string;
}

const VIDEO_SCENES: VideoScene[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 9.0,
    title: 'Giriş və ATROQ Education Rəqəmsal Ekosistemi',
    badge: 'CANLI XƏBƏRLƏR',
    newsTicker: '► ATROQ EDUCATION: TƏHSİLDƏ RƏQƏMSAL İNKİŞAF VƏ YENİ YANAŞMA ► MİLLİ KURİKULUM STANDARTLARI',
    speechText: 'Xoş gəlmisiniz! Bu gün sizə ölkəmizin ən müasir rəqəmsal təhsil platforması olan ATROQ Education-ı təqdim edirik. ATROQ Education tədris və qiymətləndirmə prosesini tamamilə avtomatlaşdırır.',
    subtitle: 'Xoş gəlmisiniz! ATROQ Education tədris və qiymətləndirmə prosesini tamamilə rəqəmsallaşdırır.'
  },
  {
    id: 2,
    startSec: 9.0,
    endSec: 19.0,
    title: 'Süni İntellektlə İmtahan və Test Hazırlığı',
    badge: 'AI MÜHƏRRİK',
    newsTicker: '► I-XI SİNİFLƏR ÜZRƏ DƏRSLİK BAZASI ► SÜNİ İNTELLEKTLƏ SANİYƏLƏR İÇİNDƏ SUAL GENERASİYASI',
    speechText: 'Platformanın süni intellekt mühərriki dərslik proqramları əsasında I-dən XI sinfə qədər bütün fənlər üzrə saniyələr içində testlər, situasiya və açıq tipli suallar formalaşdırır.',
    subtitle: 'Süni intellekt I-XI siniflər üzrə dərslik mövzularına uyğun saniyələr içində testlər hazırlayır.'
  },
  {
    id: 3,
    startSec: 19.0,
    endSec: 29.0,
    title: 'İnteraktiv İmtahan və A4 OMR Optik Kartlar',
    badge: 'OMR VƏ ONLAYN',
    newsTicker: '► CANLI ONLAYN TAYMERLİ İMTAHAN ► A4 FORMATLI OMR BLANKLARININ OPTİK SKAN EDİLMƏSİ',
    speechText: 'Şagirdlər həm real vaxt rejimində interaktiv onlayn imtahanlarda iştirak edə bilər, həm də çap olunan A4 OMR optik cavab kartları saniyələr içində skan olunaraq qiymətləndirilir.',
    subtitle: 'İnteraktiv onlayn imtahanlar və A4 OMR optik kartların dərhal avtomatik skan olunması.'
  },
  {
    id: 4,
    startSec: 29.0,
    endSec: 39.0,
    title: 'PDF Hazırlığı və 3 Pilləli Regional Reytinq',
    badge: 'NMR ANALİTİKA',
    newsTicker: '► BEYNƏLXALQ A4 PDF ÇAP ÇIXARIŞI ► NAXÇIVAN MR-İN 8 RAYONU ÜZRƏ CANLI AKADEMİK REYTİNQ',
    speechText: 'Sistem saniyələr içində PDF sual kitabçaları hazırlayır, nəticələri avtomatik hesablayır və Naxçıvan Muxtar Respublikasının səkkiz rayonu üzrə üç pilləli akademik reytinq cədvəllərini tərtib edir.',
    subtitle: 'PDF sual kitabçaları, ani nəticələr və Naxçıvan MR-in 8 rayonu üzrə canlı akademik statistika.'
  },
  {
    id: 5,
    startSec: 39.0,
    endSec: 48.0,
    title: 'Müəllif və Gələcəyə Baxış',
    badge: 'LAYİHƏ MÜƏLLİFİ',
    newsTicker: '► İDEYA MÜƏLLİFİ, TƏRTİBATÇISI VƏ DİZAYNERİ: RƏŞAD KİRMANOĞLU ► ATROQ EDUCATION 2026',
    speechText: 'ATROQ Education — təhsildə rəqəmsal imkanlar və yeni yanaşma. Bu platformanın ideya müəllifi, tərtibatçısı və dizayneri Rəşad Kirmanoğludur.',
    subtitle: 'ATROQ Education — təhsildə rəqəmsal imkanlar və yeni yanaşma. İdeya müəllifi, tərtibatçısı və dizayneri Rəşad Kirmanoğludur.'
  }
];

const TOTAL_DURATION = 48.0; // 48 saniyəlik peşəkar televiziya tele-təqdimatı

export const AboutVideoShowcase: React.FC<AboutVideoShowcaseProps> = ({ onClose, isModal = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Virtual Presenter Realism States (Lip-Sync, Blinking, Head Motion)
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [mouthOpenPhase, setMouthOpenPhase] = useState<number>(0); // 0: closed, 1: half, 2: wide, 3: round
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);
  const lastSpokenSceneRef = useRef<number>(-1);

  // Current Scene
  const currentScene = VIDEO_SCENES.find(
    (s) => currentTime >= s.startSec && currentTime < s.endSec
  ) || VIDEO_SCENES[0];

  // Presenter Blinking Cycle (every 3.2 - 4.2 seconds)
  useEffect(() => {
    let blinkTimeout: any;
    let blinkEndTimeout: any;

    const triggerBlink = () => {
      setIsBlinking(true);
      blinkEndTimeout = setTimeout(() => {
        setIsBlinking(false);
        const nextInterval = 3200 + Math.random() * 1200;
        blinkTimeout = setTimeout(triggerBlink, nextInterval);
      }, 160);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(blinkEndTimeout);
    };
  }, []);

  // Lip-Sync Viseme Modulation when speaking
  useEffect(() => {
    let lipSyncInterval: any = null;

    if (isPlaying && !isMuted) {
      setIsSpeaking(true);
      lipSyncInterval = setInterval(() => {
        // Natural speech mouth cycle
        setMouthOpenPhase((prev) => (prev + 1) % 4);
      }, 110);
    } else {
      setIsSpeaking(false);
      setMouthOpenPhase(0);
    }

    return () => {
      if (lipSyncInterval) clearInterval(lipSyncInterval);
    };
  }, [isPlaying, isMuted, currentScene.id]);

  // Background TV Studio ambient music pad
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
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.04, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Futuristic clean chords (broadcast news pad)
      const freqs = [196.00, 246.94, 293.66, 392.00]; // G chord pad
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.18, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      synthNodesRef.current = { gain: masterGain, oscs };
    } catch (e) {
      console.warn('Web Audio synthesis not supported:', e);
    }
  };

  const stopBackgroundAudio = () => {
    try {
      if (synthNodesRef.current) {
        synthNodesRef.current.oscs.forEach((o) => {
          try { o.stop(); o.disconnect(); } catch { }
        });
        synthNodesRef.current = null;
      }
    } catch (e) {
      console.warn('Stop audio fallback:', e);
    }
  };

  // Azerbaijani Female Voice Synthesis
  const speakSceneNarration = (text: string) => {
    if (isMuted) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'az-AZ';
      utterance.rate = 1.05;
      utterance.pitch = 1.14; // İncə və aydın peşəkar televiziya aparıcısı qadın səsi

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        const isLang = lang.startsWith('az') || lang.startsWith('tr');
        const isFem = name.includes('female') || name.includes('kadın') || name.includes('qadın') ||
          name.includes('dilara') || name.includes('yelda') || name.includes('filiz') ||
          name.includes('seda') || name.includes('zira') || name.includes('aylin');
        return isLang && isFem;
      }) || voices.find(v => {
        const lang = v.lang.toLowerCase();
        return lang.startsWith('az') || lang.startsWith('tr');
      }) || voices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('female') || name.includes('zira') || name.includes('samantha');
      });

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setMouthOpenPhase(0);
      };

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
            setIsSpeaking(false);
            setMouthOpenPhase(0);
            return 0;
          }
          return Number((prev + 0.25).toFixed(2));
        });
      }, 250);
    } else {
      stopBackgroundAudio();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setMouthOpenPhase(0);
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

  // Start Play instantly with zero initial delay
  const handleStartPlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
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
      synthNodesRef.current.gain.gain.setValueAtTime(nextMuted ? 0 : 0.04, audioCtxRef.current.currentTime);
    }
    if (nextMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setMouthOpenPhase(0);
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
      containerRef.current.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
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

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      data-video-player="true"
      className={`w-full overflow-hidden bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl flex flex-col relative select-none ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
        }`}
    >
      {/* ==============================================================
          STUDIO TOP BROADCAST HEADER (TV Live Stream)
          ============================================================== */}
      <div className="absolute top-0 left-0 right-0 z-30 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-2">
          {/* Live Studio Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shadow-md shadow-red-600/30">
            <Radio className="w-3 h-3 text-white" />
            <span>CANLI YAYIM</span>
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            <span className="font-black text-[11px] tracking-wider text-white">ATROQ TV STUDİO</span>
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              FULL HD 1080p
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Waveform equalizer indicator */}
          <div className="hidden sm:flex items-center gap-0.5 h-3 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700">
            <span className={`w-0.5 rounded-full bg-cyan-400 transition-all ${isSpeaking ? 'h-2.5 animate-pulse' : 'h-1'}`} />
            <span className={`w-0.5 rounded-full bg-cyan-300 transition-all ${isSpeaking ? 'h-3 animate-pulse' : 'h-1.5'}`} />
            <span className={`w-0.5 rounded-full bg-emerald-400 transition-all ${isSpeaking ? 'h-2 animate-pulse' : 'h-1'}`} />
            <span className={`w-0.5 rounded-full bg-emerald-300 transition-all ${isSpeaking ? 'h-2.5 animate-pulse' : 'h-1.5'}`} />
          </div>

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
          MAIN 16:9 BROADCAST STAGE:
          Left: Virtual Presenter with Real-time Lip-Sync & Micro-motions
          Right: Dynamic Synchronized EDUNEX UI Screens
          ============================================================== */}
      <div className="relative w-full aspect-video min-h-[250px] sm:min-h-[340px] max-h-[460px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 overflow-hidden flex items-stretch">

        {/* Background Virtual Studio Ambient Lights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(14,165,233,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

        {/* ==========================================================
            LEFT COLUMN: VİRTUAL QADIN APARICI (Realistik Dodaq Sinxronu və Jestlər)
            ========================================================== */}
        <div className="relative w-[38%] sm:w-[42%] shrink-0 h-full overflow-hidden flex items-end justify-center select-none border-r border-slate-800/80">
          {/* High-Definition Photorealistic Presenter Portrait */}
          <div
            className={`relative w-full h-full flex items-end justify-center transition-transform duration-500 ${isSpeaking ? 'scale-[1.012] -translate-y-0.5' : 'scale-100'
              }`}
          >
            <img
              src="/images/edunex_presenter.jpg"
              alt="ATROQ Virtual Aparıcı"
              className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.04]"
              onError={(e) => {
                // Fallback in case of asset path
                (e.currentTarget as any).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Studio Rim & Key Lighting Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/90 pointer-events-none" />

            {/* ======================================================
                ANATOMİK DODAQ SİNXRONU (LIP-SYNC DİNAMİK VİZEM ŞƏBƏKƏSİ)
                Aparıcının danışığı zamanı dodaqların realistik açılıb-bağlanması
                ====================================================== */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: '55.2%',
                left: '50.1%',
                transform: 'translate(-50%, -50%)',
                width: '18%',
                height: '7%'
              }}
            >
              {/* Talking Lip-Sync Viseme Morphing */}
              {isSpeaking && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Viseme Phase 1: Slight Vowel Open */}
                  {mouthOpenPhase === 1 && (
                    <div className="w-[78%] h-[55%] rounded-full bg-[#521319]/90 border-t border-b border-[#c25e68] shadow-inner flex items-center justify-center animate-in fade-in duration-75">
                      <div className="w-[60%] h-[25%] bg-white/90 rounded-sm" />
                    </div>
                  )}

                  {/* Viseme Phase 2: Open Ah/Eh */}
                  {mouthOpenPhase === 2 && (
                    <div className="w-[84%] h-[75%] rounded-[45%] bg-[#420f14] border-t border-b border-[#d8707c] shadow-inner flex flex-col items-center justify-between py-0.5 animate-in fade-in duration-75">
                      <div className="w-[65%] h-[20%] bg-white/95 rounded-sm" />
                      <div className="w-[45%] h-[25%] bg-[#b83d4e] rounded-full" />
                    </div>
                  )}

                  {/* Viseme Phase 3: Round Oh/Oo */}
                  {mouthOpenPhase === 3 && (
                    <div className="w-[68%] h-[68%] rounded-full bg-[#461016] border border-[#d8707c] shadow-inner flex items-center justify-center animate-in fade-in duration-75">
                      <div className="w-[40%] h-[30%] bg-white/80 rounded-full" />
                    </div>
                  )}

                  {/* Viseme Phase 0: Natural Closed Resting Smile */}
                  {mouthOpenPhase === 0 && (
                    <div className="w-[75%] h-[35%] rounded-full border-b border-[#a84c56] opacity-80" />
                  )}
                </div>
              )}
            </div>

            {/* ======================================================
                TƏBİİ GÖZ QIRPMA (EYE BLINKING)
                ====================================================== */}
            {isBlinking && (
              <div
                className="absolute pointer-events-none flex items-center justify-between"
                style={{
                  top: '38.8%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '26%',
                  height: '4%'
                }}
              >
                <div className="w-[40%] h-[75%] rounded-full bg-[#c89886] border-b border-[#5c3e34] shadow-xs" />
                <div className="w-[40%] h-[75%] rounded-full bg-[#c89886] border-b border-[#5c3e34] shadow-xs" />
              </div>
            )}

            {/* Presenter Name Badge (TV Lower-Corner) */}
            <div className="absolute bottom-10 left-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black tracking-wide text-white">Aygün M.</span>
              <span className="text-[8px] text-sky-300 font-mono">ATROQ Anchor</span>
            </div>
          </div>
        </div>

        {/* ==========================================================
            RIGHT COLUMN: REAL ATROQ EDUCATION PROQRAM GÖRÜNTÜLƏRİ VƏ ANİMASİYALAR
            Aparıcı izah etdikcə müvafiq proqram görüntüləri canlanır
            ========================================================== */}
        <div className="flex-1 h-full p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden bg-slate-950/70">
          {/* Cyber Grid background in display window */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:18px_18px]" />

          {/* Top Holographic Screen Header */}
          <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                {currentScene.badge}
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
              SƏHNƏ 0{currentScene.id} / 05
            </span>
          </div>

          {/* ==================== SƏHNƏ 1: ATROQ EDUCATION GİRİŞ VƏ LOQO ==================== */}
          {currentScene.id === 1 && (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-white/20 animate-pulse mb-1.5">
                <Cpu className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-300">
                ATROQ Education
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-sky-300 mt-0.5 max-w-xs">
                Təhsilin Rəqəmsal İnkişaf Platforması
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-300">
                  Milli Kurikulum
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-300">
                  AI Generator
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-300">
                  OMR Skan
                </span>
              </div>
            </div>
          )}

          {/* ==================== SƏHNƏ 2: SÜNİ İNTELLEKTLƏ TEST YARAT ==================== */}
          {currentScene.id === 2 && (
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 p-1 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 shadow-xl">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    AI Test Mühərriki • Dərslik Proqramları
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                    Saniyələr İçində
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
                  <div className="p-1 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-400 block font-bold">Fənn</span>
                    <span className="text-[10px] font-black text-indigo-300 truncate block">Riyaziyyat</span>
                  </div>
                  <div className="p-1 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-400 block font-bold">Sinif</span>
                    <span className="text-[10px] font-black text-cyan-300 block">IX Sinif</span>
                  </div>
                  <div className="p-1 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[8px] text-slate-400 block font-bold">Mövzu</span>
                    <span className="text-[10px] font-black text-emerald-300 truncate block">Kvadrat tənlik</span>
                  </div>
                </div>

                <div className="mt-2 p-1.5 bg-indigo-950/50 rounded-lg border border-indigo-800/40 text-left">
                  <span className="text-[9px] font-bold text-indigo-200 block truncate">
                    Sual 1. Kvadrat tənliyin köklərinin tapılması və tətbiqi...
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">A) x = 3, y = -2</span>
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">B) x = 1, y = 5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SƏHNƏ 3: İNTERAKTİV İMTAHAN & OMR ==================== */}
          {currentScene.id === 3 && (
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-1.5 p-1 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="grid grid-cols-2 gap-2">
                {/* OMR Card Simulation */}
                <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2 shadow-lg text-left">
                  <span className="text-[8px] font-black uppercase text-amber-400 block mb-0.5">
                    A4 OMR Optik Kart
                  </span>
                  <h5 className="text-[10px] font-bold text-white">Avtomatik Blank</h5>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center text-[7px] font-bold">1</div>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-400" />
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 leading-tight">
                    Optik skan vasitəsilə dərhal nəticə.
                  </p>
                </div>

                {/* Online Test Simulation */}
                <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2 shadow-lg text-left">
                  <span className="text-[8px] font-black uppercase text-cyan-400 block mb-0.5">
                    Onlayn İmtahan
                  </span>
                  <h5 className="text-[10px] font-bold text-white">Canlı Taymer</h5>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-4/5 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-slate-400 mt-1 font-mono">
                    <span>Qalan: 32:45</span>
                    <span className="text-emerald-400 font-bold">80%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SƏHNƏ 4: PDF & 8 RAYON REYTİNQ ==================== */}
          {currentScene.id === 4 && (
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-1.5 p-1 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2 shadow-xl">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-[9px] font-bold text-slate-200">
                    NMR 8 Rayon Akademik Göstəriciləri
                  </span>
                  <span className="text-[8px] font-black text-amber-300 bg-amber-950 px-1 rounded">
                    Reytinq
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1 items-end pt-2 min-h-[55px]">
                  {[
                    { name: 'Nax.', val: 86 },
                    { name: 'Babək', val: 78 },
                    { name: 'Şərur', val: 82 },
                    { name: 'Ord.', val: 80 },
                    { name: 'Culfa', val: 75 },
                    { name: 'Kəng.', val: 72 },
                    { name: 'Şah.', val: 74 },
                    { name: 'Səd.', val: 70 },
                  ].map((item, idx) => (
                    <div key={item.name} className="flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full max-w-[16px] rounded-t ${idx === 0 ? 'bg-gradient-to-t from-amber-500 to-amber-300' : 'bg-indigo-600/80'
                          }`}
                        style={{ height: `${item.val * 0.48}px` }}
                      />
                      <span className="text-[7px] font-bold text-slate-400 truncate max-w-full">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== SƏHNƏ 5: MÜƏLLİF VƏ YEKUN ==================== */}
          {currentScene.id === 5 && (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-2 animate-in fade-in zoom-in-95 duration-300">
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 tracking-wider">
                İDEYA MÜƏLLİFİ, TƏRTİBATÇISI VƏ DİZAYNERİ
              </span>

              <h4 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-200 to-white mt-1">
                Rəşad Kirmanoğlu
              </h4>

              <p className="text-[10px] text-slate-300 mt-0.5 max-w-xs leading-tight font-serif italic">
                “ATROQ Education — təhsildə rəqəmsal imkanlar və yeni yanaşma.”
              </p>

              <div className="mt-1.5 flex items-center gap-1 text-[8px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
                <span>Rəsmi Təsdiq Edilmiş Müəlliflik Hüququ • 2026</span>
              </div>
            </div>
          )}

          {/* Subtitle / Teleprompter Live Caption Bar */}
          <div className="relative z-10 pt-1">
            <div className="w-full px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-semibold text-cyan-200 leading-tight truncate">
              {currentScene.subtitle}
            </div>
          </div>
        </div>

        {/* Center Big Play Button when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={handleStartPlay}
            className="absolute inset-0 z-40 m-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600/95 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/60 hover:scale-105 transition-all cursor-pointer backdrop-blur-xs ring-4 ring-white/30"
            title="Videonu başlat"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5 fill-white" />
          </button>
        )}
      </div>

      {/* ==============================================================
          LOWER-THIRD NEWS TICKER TAPE (TV Xəbər Lenti)
          ============================================================== */}
      <div className="bg-slate-900 border-t border-slate-800/90 px-3 py-1 flex items-center gap-2 overflow-hidden z-30">
        <span className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white font-mono">
          XƏBƏR LENTİ
        </span>
        <div className="text-[9px] font-semibold text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">
          {currentScene.newsTicker}
        </div>
      </div>

      {/* ==============================================================
          VIDEO CONTROLS & TIMELINE BAR
          ============================================================== */}
      <div className="bg-slate-950 border-t border-slate-800 px-3 py-2 flex flex-col gap-1.5 z-30">
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
        <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-500 font-bold px-0.5">
          {VIDEO_SCENES.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => handleSeek(scene.startSec)}
              className={`hover:text-cyan-300 transition-colors cursor-pointer ${currentScene.id === scene.id ? 'text-cyan-400 font-black' : ''
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
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isMuted ? 'bg-rose-950/60 text-rose-400 border border-rose-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
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
