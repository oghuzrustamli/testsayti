// src/components/DocSnippetModal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import {
  Scissors,
  X,
  FileText,
  Upload,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Layers,
  Crop,
  Copy,
  Sparkles,
  MousePointer,
  RefreshCw
} from 'lucide-react';

interface DocSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (target: string, content: string, type: 'text' | 'image') => void;
  initialTarget?: string; // 'question' | 'situation' | 'opt-A' | 'opt-B' | 'opt-C' | 'opt-D' | 'opt-E'
  defaultDocUrl?: string | null;
  allowSituation?: boolean;
}

interface CropRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  canvasIdx: number;
}

export const DocSnippetModal: React.FC<DocSnippetModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialTarget = 'question',
  defaultDocUrl = '/sample_exam.pdf',
  allowSituation = false,
}) => {
  const [target, setTarget] = useState<string>(initialTarget);
  const [docUrl, setDocUrl] = useState<string>(defaultDocUrl || '/sample_exam.pdf');
  const [docType, setDocType] = useState<'pdf' | 'docx'>('pdf');
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [wordHtml, setWordHtml] = useState<string>('');
  const [scale, setScale] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<'crop' | 'select'>('crop');

  // Cropping State
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [previewSnippetUrl, setPreviewSnippetUrl] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pageCanvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    setTarget(initialTarget);
  }, [initialTarget]);

  // Load Document
  const loadDocument = useCallback(async (url: string) => {
    setLoading(true);
    const isDocx = url.toLowerCase().endsWith('.docx') || url.toLowerCase().endsWith('.doc');

    if (isDocx) {
      setDocType('docx');
      try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setWordHtml(result.value);
      } catch (err) {
        console.warn('Could not load Word file, fallback to PDF', err);
        setDocType('pdf');
        const doc = await pdfjsLib.getDocument('/sample_exam.pdf').promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } finally {
        setLoading(false);
      }
    } else {
      setDocType('pdf');
      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        console.warn('Could not load PDF, trying fallback', err);
        try {
          const fallback = await pdfjsLib.getDocument('/sample_exam.pdf').promise;
          setPdfDoc(fallback);
          setTotalPages(fallback.numPages);
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDocument(docUrl);
      setPreviewSnippetUrl(null);
      setCropRect(null);
    }
  }, [isOpen, docUrl, loadDocument]);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setDocUrl(fileUrl);
  };

  // Render Page to Canvas
  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc || !canvas) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, [pdfDoc, scale]);

  // Start Crop
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>, pageNum: number) => {
    if (activeTool !== 'crop') return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsMouseDown(true);
    setCropRect({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      canvasIdx: pageNum,
    });
    setPreviewSnippetUrl(null);
  };

  // Move Crop
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>, pageNum: number) => {
    if (!isMouseDown || !cropRect || cropRect.canvasIdx !== pageNum) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setCropRect(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  // End Crop & Extract
  const handleCanvasMouseUp = (pageNum: number) => {
    if (!isMouseDown || !cropRect || cropRect.canvasIdx !== pageNum) return;
    setIsMouseDown(false);

    const canvas = pageCanvasRefs.current[pageNum];
    if (!canvas) return;

    const width = Math.abs(cropRect.currentX - cropRect.startX);
    const height = Math.abs(cropRect.currentY - cropRect.startY);

    if (width < 10 || height < 10) {
      setCropRect(null);
      return;
    }

    // Scale calculation based on canvas scale vs client width
    const clientRect = canvas.getBoundingClientRect();
    const scaleFactorX = canvas.width / clientRect.width;
    const scaleFactorY = canvas.height / clientRect.height;

    const sourceX = Math.min(cropRect.startX, cropRect.currentX) * scaleFactorX;
    const sourceY = Math.min(cropRect.startY, cropRect.currentY) * scaleFactorY;
    const sourceW = width * scaleFactorX;
    const sourceH = height * scaleFactorY;

    // Create snippet canvas
    const snippetCanvas = document.createElement('canvas');
    snippetCanvas.width = sourceW;
    snippetCanvas.height = sourceH;
    const ctx = snippetCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(canvas, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
    const dataUrl = snippetCanvas.toDataURL('image/png');
    setPreviewSnippetUrl(dataUrl);
  };

  // Insert Action
  const handleConfirmInsert = (type: 'image' | 'text', customVal?: string) => {
    const val = customVal || (type === 'image' ? previewSnippetUrl : manualText);
    if (!val) return;

    onInsert(target, val, type);
    setActionSuccess(`Kəsilmiş hissə ${getTargetLabel(target)} sahəsinə əlavə edildi!`);
    setTimeout(() => {
      setActionSuccess('');
      onClose();
    }, 600);
  };

  const getTargetLabel = (t: string) => {
    if (t === 'question') return 'Sual Mətni';
    if (t === 'situation') return 'Situasiya Mətni';
    if (t.startsWith('opt-')) return `Variant ${t.replace('opt-', '')}`;
    return t;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                PDF / Word Sənədindən Kəs və Əlavə Et
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Sənəddən istənilən sual, düstur və ya variantı seçib birbaşa daxil edin
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Selector Toolbar */}
        <div className="px-5 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 shrink-0">Hədəf sahə:</span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setTarget('question')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  target === 'question'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📝 Sual Mətni
              </button>

              {allowSituation && (
                <button
                  type="button"
                  onClick={() => setTarget('situation')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    target === 'situation'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📖 Situasiya
                </button>
              )}

              {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTarget(`opt-${opt}`)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                    target === `opt-${opt}`
                      ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`${opt} variantını hədəf seç`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Current Target Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
              Seçilmiş Hədəf: <strong>{getTargetLabel(target)}</strong>
            </span>
          </div>
        </div>

        {/* Tools and Zoom Bar */}
        <div className="px-5 py-2 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTool('crop')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'crop'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>✂️ Sahəni Kəs (Snippet)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('select')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTool === 'select'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>✋ Normal Sürüşdür</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-slate-500" />
              <span>Başqa Sənəd Seç</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(s => Math.max(0.8, s - 0.15))}
              className="p-1 border border-slate-200 rounded hover:bg-slate-100"
              title="Uzaqlaşdır"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-[11px] w-9 text-center text-slate-700">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(2.2, s + 0.15))}
              className="p-1 border border-slate-200 rounded hover:bg-slate-100"
              title="Yaxınlaşdır"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionSuccess && (
          <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Floating Snippet Insertion Card if crop made */}
        {previewSnippetUrl && (
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 px-4 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-2 z-20">
            <div className="flex items-center gap-3">
              <img
                src={previewSnippetUrl}
                alt="Kəsilmiş Şəkil"
                className="h-10 max-w-[120px] rounded border border-slate-700 object-contain bg-white"
              />
              <div>
                <span className="text-xs font-bold block">
                  Kəsilmiş Sahə Hazırdır!
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Hədəf: <strong>{getTargetLabel(target)}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewSnippetUrl(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                İmtina
              </button>
              <button
                type="button"
                onClick={() => handleConfirmInsert('image')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{getTargetLabel(target)} Sahəsinə Əlavə Et</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Document Scroll Viewport (Davamlı Multi-Page Sürüşdürmə) */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-200/90 flex flex-col items-center select-none relative">
          {loading ? (
            <div className="m-auto text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Sənəd yüklənir...
            </div>
          ) : docType === 'docx' && wordHtml ? (
            <div className="bg-white shadow-xl rounded-xl p-8 max-w-3xl w-full border border-slate-200 font-serif leading-relaxed text-slate-800 prose prose-slate">
              <div dangerouslySetInnerHTML={{ __html: wordHtml }} />
            </div>
          ) : pdfDoc ? (
            <div className="flex flex-col items-center w-full max-w-full pb-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <div key={pageNum} className="flex flex-col items-center my-3 relative group w-full">
                  <div className="w-full max-w-fit self-center flex items-center justify-between px-3 py-0.5 mb-1.5 rounded-full bg-white/90 border border-slate-300 text-[10.5px] font-bold text-slate-700 shadow-2xs">
                    <span>Səhifə {pageNum} / {totalPages}</span>
                  </div>

                  <div className="relative inline-block">
                    <canvas
                      ref={(el) => {
                        pageCanvasRefs.current[pageNum] = el;
                        if (el) renderPage(pageNum, el);
                      }}
                      onMouseDown={(e) => handleCanvasMouseDown(e, pageNum)}
                      onMouseMove={(e) => handleCanvasMouseMove(e, pageNum)}
                      onMouseUp={() => handleCanvasMouseUp(pageNum)}
                      className={`shadow-xl border border-slate-300 rounded bg-white max-w-full ${
                        activeTool === 'crop' ? 'cursor-crosshair' : 'cursor-default'
                      }`}
                    />

                    {/* Active Drag Crop Rectangle Overlay */}
                    {isMouseDown && cropRect && cropRect.canvasIdx === pageNum && (
                      <div
                        className="absolute border-2 border-indigo-600 bg-indigo-500/25 pointer-events-none rounded-xs shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{
                          left: Math.min(cropRect.startX, cropRect.currentX),
                          top: Math.min(cropRect.startY, cropRect.currentY),
                          width: Math.abs(cropRect.currentX - cropRect.startX),
                          height: Math.abs(cropRect.currentY - cropRect.startY),
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="m-auto text-center p-6 bg-white rounded-2xl border border-slate-200 max-w-sm">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-bold">Sənəd tapılmadı</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                Fayl Seç
              </button>
            </div>
          )}
        </div>

        {/* Footer Quick Text Extractor */}
        <div className="p-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex-1 flex items-center gap-2 min-w-[280px]">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Və ya sənəddən kopyaladığınız mətni bura yapışdırıb hədəfə əlavə edin..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
            <button
              type="button"
              disabled={!manualText.trim()}
              onClick={() => handleConfirmInsert('text')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
            >
              Mətni Əlavə Et
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
