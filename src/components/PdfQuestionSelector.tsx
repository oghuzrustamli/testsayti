// src/components/PdfQuestionSelector.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfQuestionItem } from '../types';
import {
  FileText,
  Upload,
  Crop,
  Type,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Eye,
  Plus
} from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PdfQuestionSelectorProps {
  onAddQuestion: (question: PdfQuestionItem) => void;
  onClose: () => void;
  currentQuestionCount: number;
}

export const PdfQuestionSelector: React.FC<PdfQuestionSelectorProps> = ({
  onAddQuestion,
  onClose,
  currentQuestionCount,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5); // 1.5x for sharp crisp questions
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'crop' | 'text'>('crop');

  // Crop bounding box state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Text selection state
  const [extractedText, setExtractedText] = useState<string>('');
  const [parsedQuestionText, setParsedQuestionText] = useState<string>('');
  const [parsedOptions, setParsedOptions] = useState<{ id: string; text: string }[]>([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
    { id: 'E', text: '' },
  ]);

  const [toastMsg, setToastMsg] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load PDF from ArrayBuffer or URL
  const loadPdfData = async (data: ArrayBuffer | string, name: string) => {
    try {
      setLoading(true);
      setFileName(name);
      const loadingTask = pdfjsLib.getDocument(data);
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      alert('PDF yüklənərkən xəta baş verdi: ' + (err.message || 'Fayl oxunmadı'));
    } finally {
      setLoading(false);
    }
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      if (reader.result) {
        loadPdfData(reader.result as ArrayBuffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Load Sample Demo Exam PDF
  const handleLoadSamplePdf = () => {
    loadPdfData('/sample_exam.pdf', 'ATROQ_Numune_Sinaq.pdf');
  };

  // Render current PDF page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Overlay canvas matching dimensions
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = viewport.width;
        overlayCanvasRef.current.height = viewport.height;
      }

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Extract text content if in text mode
      if (mode === 'text') {
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(' ');
        setExtractedText(textItems);
      }
    } catch (err) {
      console.error('Error rendering page:', err);
    }
  }, [pdfDoc, currentPage, scale, mode]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Crop interaction: mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'crop') return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  // Crop interaction: mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || mode !== 'crop') return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setCurrentBox({ x, y, width, height });

    // Draw active rectangle on overlay canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dim background outside selection
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(x, y, width, height);

    // Draw selection stroke and accent corner guides
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  };

  // Crop interaction: mouse up
  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  // Capture and add cropped question to list
  const handleConfirmCrop = () => {
    if (!currentBox || currentBox.width < 30 || currentBox.height < 20) {
      alert('Zəhmət olmasa sualın ətrafında sahə seçin');
      return;
    }

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

    // Create a temporary canvas for the cropped question
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = currentBox.width;
    cropCanvas.height = currentBox.height;

    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Draw image from main canvas to crop canvas
    cropCtx.drawImage(
      mainCanvas,
      currentBox.x,
      currentBox.y,
      currentBox.width,
      currentBox.height,
      0,
      0,
      currentBox.width,
      currentBox.height
    );

    const croppedDataUrl = cropCanvas.toDataURL('image/png', 1.0);
    const nextOrder = currentQuestionCount + 1;

    onAddQuestion({
      id: 'pdf-q-' + Math.random().toString(36).substring(2, 9),
      orderNumber: nextOrder,
      type: 'crop',
      imageDataUrl: croppedDataUrl,
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
        { id: 'D', text: 'D' },
        { id: 'E', text: 'E' },
      ],
      points: 1,
    });

    // Clear overlay
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
    setCurrentBox(null);

    setToastMsg(`Sual №${nextOrder} test siyahısına əlavə edildi!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Text Mode: parse and add
  const handleConfirmTextQuestion = () => {
    if (!parsedQuestionText.trim()) {
      alert('Sualın mətni daxil edilməlidir');
      return;
    }

    const nextOrder = currentQuestionCount + 1;
    onAddQuestion({
      id: 'pdf-txt-' + Math.random().toString(36).substring(2, 9),
      orderNumber: nextOrder,
      type: 'text',
      questionText: parsedQuestionText.trim(),
      options: parsedOptions,
      points: 1,
    });

    setParsedQuestionText('');
    setToastMsg(`Mətn sualı №${nextOrder} əlavə edildi!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Parse extracted text into question and options
  const handleAutoParseExtracted = () => {
    if (!extractedText) return;
    // Simple heuristic parser for A), B), C), D), E)
    let qText = extractedText;
    const optRegex = /([A-E])[\.\)]\s*([^\n\rA-E\.\)]+)/g;
    let match;
    const opts: { id: string; text: string }[] = [];

    while ((match = optRegex.exec(extractedText)) !== null) {
      opts.push({ id: match[1], text: match[2].trim() });
    }

    if (opts.length >= 2) {
      const firstOptIndex = extractedText.search(/[A-E][\.\)]/);
      if (firstOptIndex > 0) {
        qText = extractedText.substring(0, firstOptIndex).trim();
      }
      setParsedQuestionText(qText);
      setParsedOptions(opts);
    } else {
      setParsedQuestionText(extractedText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex flex-col">
      {/* Top Navigation & Toolbar */}
      <header className="h-16 bg-slate-900 text-white px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base leading-tight">
              PDF-dən Sualların Seçilməsi
            </h2>
            <p className="text-[11px] text-slate-400">
              {fileName || 'PDF sənədini seçin və sualların ətrafında düzbucaqlı çəkərək kəsin'}
            </p>
          </div>
        </div>

        {/* Controls: Mode Switch, Zoom, Pages */}
        {pdfDoc && (
          <div className="flex items-center gap-3">
            {/* Mode Toggle (Sahə ilə kəsmə vs Mətn seçimi) */}
            <div className="hidden md:flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setMode('crop')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  mode === 'crop' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                Sahə ilə Kəsmək (Crop)
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  mode === 'text' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Mətn kimi Seçmək
              </button>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-xl text-xs font-mono font-bold text-slate-300">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-1 hover:text-white disabled:opacity-30 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{currentPage} / {numPages}</span>
              <button
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))}
                className="p-1 hover:text-white disabled:opacity-30 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-1.5 py-1 rounded-xl text-slate-300 text-xs">
              <button
                onClick={() => setScale(s => Math.max(s - 0.25, 0.75))}
                className="p-1 hover:text-white rounded"
                title="Kiçilt"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 font-bold">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(s => Math.min(s + 0.25, 2.5))}
                className="p-1 hover:text-white rounded"
                title="Böyüt"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Right close button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>Seçimi Bitir</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto bg-slate-950 flex flex-col items-center justify-start p-4 relative" ref={containerRef}>
        {/* Toast alert */}
        {toastMsg && (
          <div className="fixed top-20 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Check className="w-4 h-4" />
            {toastMsg}
          </div>
        )}

        {/* Initial Screen: Select PDF */}
        {!pdfDoc ? (
          <div className="my-auto max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black mb-2">Kompüterinizdən PDF Faylı Seçin</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              İstənilən sınaq, dərslik və ya test toplusu PDF-ini yükləyərək sualları birbaşa səhifə üzərindən seçib test vərəqinə əlavə edin.
            </p>

            <div className="flex flex-col gap-3">
              <label className="cursor-pointer w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all">
                <FileText className="w-4 h-4" />
                <span>PDF Faylını Seç (Kompüterdən)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSamplePdf}
                className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Nümunə Sınaq İmtahanı PDF-i ilə Başla</span>
              </button>
            </div>
          </div>
        ) : mode === 'crop' ? (
          /* CROP MODE: Canvas View */
          <div className="relative inline-block border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl bg-white select-none my-4">
            <canvas ref={canvasRef} className="block" />
            <canvas
              ref={overlayCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="absolute inset-0 cursor-crosshair z-10"
            />

            {/* Floating Action Button when a box is drawn */}
            {currentBox && currentBox.width > 40 && currentBox.height > 25 && (
              <div
                className="absolute z-20"
                style={{
                  left: Math.max(10, currentBox.x),
                  top: Math.max(10, currentBox.y + currentBox.height + 10)
                }}
              >
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 transition-all border border-emerald-400 animate-in fade-in zoom-in-95"
                >
                  <Check className="w-4 h-4" />
                  Bu Sahəni Sual Kimi Əlavə Et
                </button>
              </div>
            )}
          </div>
        ) : (
          /* TEXT MODE: Text Extractor View */
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-4 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Səhifə {currentPage} Mətn Çıxarışı
              </span>
              <button
                onClick={handleAutoParseExtracted}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
              >
                Sual və Variantları Ayır
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Sualın Mətni:</label>
              <textarea
                rows={3}
                value={parsedQuestionText}
                onChange={(e) => setParsedQuestionText(e.target.value)}
                placeholder="Sualın mətnini daxil edin..."
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parsedOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 font-bold text-xs flex items-center justify-center text-indigo-400 shrink-0">
                    {opt.id}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const next = [...parsedOptions];
                      next[idx].text = e.target.value;
                      setParsedOptions(next);
                    }}
                    placeholder={`${opt.id} variantı...`}
                    className="flex-1 px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleConfirmTextQuestion}
              className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              Mətn Sualını Siyahıya Əlavə Et
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Hint Bar */}
      {pdfDoc && (
        <footer className="h-12 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {mode === 'crop'
                ? 'İstədiyiniz sualın ətrafında mausun sol düyməsi ilə düzbucaqlı sahə çəkin və "Əlavə Et" düyməsinə basın.'
                : 'Mətn rejimindəsiniz: sual mətnini və variantlarını redaktə edib əlavə edin.'}
            </span>
          </div>

          <div className="font-bold text-white text-xs">
            Seçilmiş suallar: <span className="text-emerald-400 font-black">{currentQuestionCount}</span> ədəd
          </div>
        </footer>
      )}
    </div>
  );
};
