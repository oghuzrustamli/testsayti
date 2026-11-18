// src/components/ShareTestModal.tsx
import React, { useState } from 'react';
import { Test } from '../types';
import { api } from '../lib/api';
import { X, Copy, Check, MessageSquare, ExternalLink, Power, AlertCircle, Share2 } from 'lucide-react';

interface ShareTestModalProps {
  test: Test;
  onClose: () => void;
  onEditTest?: (testId: string) => void;
  onToggleStatus?: (isActive: boolean) => void;
}

export const ShareTestModal: React.FC<ShareTestModalProps> = ({
  test,
  onClose,
  onEditTest,
  onToggleStatus,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(test.is_link_active ?? true);
  const [loading, setLoading] = useState<boolean>(false);

  const shareCode = test.share_code || 'EDX-DEMO-2026';
  const origin = window.location.origin;
  const shareUrl = `${origin}/?take=${shareCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Salam! ATROQ Education platformasında sizin üçün "${test.title}" imtahan testi hazırdır.\n\nİmtahana daxil olmaq üçün bu linkə keçid edin:\n${shareUrl}\n\nUğurlar arzulayırıq!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      const nextState = !isActive;
      await api.toggleShareLink(test.id, nextState);
      setIsActive(nextState);
      if (onToggleStatus) onToggleStatus(nextState);
    } catch (err) {
      alert('Link statusu dəyişdirilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Testi Paylaş</h3>
              <p className="text-xs text-slate-500">Şagirdlərin birbaşa imtahana qoşulması üçün unikal link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {/* Test Metadata Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-1.5">
            <h4 className="font-bold text-slate-900 text-sm">{test.title}</h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Fənn: <strong className="text-slate-700">{test.subject}</strong></span>
              <span>Sual sayı: <strong className="text-slate-700">{test.total_questions || (test.questions ? test.questions.length : 0)}</strong></span>
              <span>Rejim: <strong className="text-indigo-600">{test.test_mode === 'answered' ? 'Cavablı Test' : 'İnteraktiv Test'}</strong></span>
              <span>Müddət: <strong className="text-slate-700">{test.duration_minutes} dəq</strong></span>
            </div>
          </div>

          {/* Active status indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-bold text-slate-700">
                Link Statusu: {isActive ? 'Aktivdir (Şagirdlər daxil ola bilər)' : 'Deaktiv edilib (Giriş bağlıdır)'}
              </span>
            </div>
            <button
              onClick={handleToggleActive}
              disabled={loading}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isActive ? 'Linki Deaktiv Et' : 'Linki Aktivləşdir'}
            </button>
          </div>

          {/* Link Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Unikal İmtahan Linki:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </button>
            </div>
          </div>

          {/* Action Buttons: WhatsApp & Direct Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp ilə Paylaş
            </button>

            <a
              href={`/?take=${shareCode}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all text-center"
            >
              <ExternalLink className="w-4 h-4" />
              Şagird Ekranına Bax
            </a>
          </div>

          {onEditTest && (
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                onClick={() => { onClose(); onEditTest(test.id); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Bu testi Test Creator-da yenidən redaktə et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
