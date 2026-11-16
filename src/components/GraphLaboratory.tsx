// src/components/GraphLaboratory.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GraphCurve, GraphData } from '../types';
import { Plus, Trash2, Eye, EyeOff, Check, X, Sliders, RefreshCw, Layers, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface GraphLaboratoryProps {
  initialData?: GraphData | null;
  onSaveToQuestion: (graphData: GraphData) => void;
  onClose?: () => void;
}

const DEFAULT_CURVES: GraphCurve[] = [
  {
    id: 'c-1',
    type: 'quadratic',
    a: 1,
    b: -4,
    c: 3,
    label: 'f(x) = x^2 - 4x + 3',
    color: '#4f46e5',
  }
];

export const GraphLaboratory: React.FC<GraphLaboratoryProps> = ({
  initialData,
  onSaveToQuestion,
  onClose,
}) => {
  const [curves, setCurves] = useState<GraphCurve[]>(initialData?.curves || DEFAULT_CURVES);
  const [xMin, setXMin] = useState<number>(initialData?.xMin ?? -6);
  const [xMax, setXMax] = useState<number>(initialData?.xMax ?? 6);
  const [yMin, setYMin] = useState<number>(initialData?.yMin ?? -6);
  const [yMax, setYMax] = useState<number>(initialData?.yMax ?? 6);
  const [showGrid, setShowGrid] = useState<boolean>(initialData?.showGrid ?? true);
  const [showRoots, setShowRoots] = useState<boolean>(initialData?.showRoots ?? true);
  const [showVertex, setShowVertex] = useState<boolean>(initialData?.showVertex ?? true);
  const [showIntersections, setShowIntersections] = useState<boolean>(initialData?.showIntersections ?? true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Curve color palette
  const colors = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Evaluate curve at x
  const evaluate = (curve: GraphCurve, x: number): number | null => {
    try {
      switch (curve.type) {
        case 'linear':
          return curve.a * x + curve.b;
        case 'quadratic':
          return curve.a * x * x + curve.b * x + curve.c;
        case 'modulus':
          return curve.a * Math.abs(x - curve.b) + curve.c;
        case 'rational':
          if (Math.abs(x) < 0.001) return null;
          return curve.a / x + curve.b;
        case 'exponential':
          return curve.a * Math.pow(Math.max(curve.b, 0.1), x) + curve.c;
        case 'logarithmic':
          if (x <= 0) return null;
          return curve.a * Math.log(x) + curve.b;
        case 'trigonometric':
          return curve.a * Math.sin(curve.b * x) + curve.c;
        case 'piecewise':
          // x < 0 -> a*x, x >= 0 -> b*x + c
          return x < 0 ? curve.a * x : curve.b * x + curve.c;
        default:
          return 0;
      }
    } catch {
      return null;
    }
  };

  // Find roots (f(x) = 0)
  const calculateRoots = (curve: GraphCurve): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    if (curve.type === 'linear') {
      if (curve.a !== 0) {
        const root = -curve.b / curve.a;
        if (root >= xMin && root <= xMax) points.push({ x: root, y: 0 });
      }
    } else if (curve.type === 'quadratic') {
      const a = curve.a;
      const b = curve.b;
      const c = curve.c;
      const d = b * b - 4 * a * c;
      if (d >= 0 && a !== 0) {
        const r1 = (-b + Math.sqrt(d)) / (2 * a);
        const r2 = (-b - Math.sqrt(d)) / (2 * a);
        if (r1 >= xMin && r1 <= xMax) points.push({ x: r1, y: 0 });
        if (d > 0 && r2 >= xMin && r2 <= xMax) points.push({ x: r2, y: 0 });
      }
    }
    return points;
  };

  // Calculate vertex (təpə nöqtəsi)
  const calculateVertex = (curve: GraphCurve): { x: number; y: number } | null => {
    if (curve.type === 'quadratic' && curve.a !== 0) {
      const vx = -curve.b / (2 * curve.a);
      const vy = evaluate(curve, vx);
      if (vy !== null && vx >= xMin && vx <= xMax && vy >= yMin && vy <= yMax) {
        return { x: vx, y: vy };
      }
    } else if (curve.type === 'modulus') {
      const vx = curve.b;
      const vy = curve.c;
      if (vx >= xMin && vx <= xMax && vy >= yMin && vy <= yMax) {
        return { x: vx, y: vy };
      }
    }
    return null;
  };

  // Render Canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate transforms
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 1. Grid
    if (showGrid) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;

      // Vertical grid lines
      const stepX = (xMax - xMin) > 15 ? 2 : 1;
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += stepX) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      const stepY = (yMax - yMin) > 15 ? 2 : 1;
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += stepY) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
      }
    }

    // 2. Axes X and Y
    const originX = toCanvasX(0);
    const originY = toCanvasY(0);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.75;

    // X Axis
    if (originY >= 0 && originY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();

      // Arrow
      ctx.beginPath();
      ctx.moveTo(width - 8, originY - 4);
      ctx.lineTo(width, originY);
      ctx.lineTo(width - 8, originY + 4);
      ctx.fillStyle = '#475569';
      ctx.fill();
    }

    // Y Axis
    if (originX >= 0 && originX <= width) {
      ctx.beginPath();
      ctx.moveTo(originX, height);
      ctx.lineTo(originX, 0);
      ctx.stroke();

      // Arrow
      ctx.beginPath();
      ctx.moveTo(originX - 4, 8);
      ctx.lineTo(originX, 0);
      ctx.lineTo(originX + 4, 8);
      ctx.fillStyle = '#475569';
      ctx.fill();
    }

    // Tick labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    const tickStep = (xMax - xMin) > 14 ? 2 : 1;
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += tickStep) {
      if (x === 0) continue;
      const cx = toCanvasX(x);
      const cy = Math.min(Math.max(originY, 15), height - 15);
      ctx.fillText(x.toString(), cx, cy + 14);
      // Small notch
      ctx.beginPath();
      ctx.moveTo(cx, cy - 3);
      ctx.lineTo(cx, cy + 3);
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
    }

    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += tickStep) {
      if (y === 0) continue;
      const cy = toCanvasY(y);
      const cx = Math.min(Math.max(originX, 20), width - 15);
      ctx.fillText(y.toString(), cx - 5, cy + 4);
      // Small notch
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
    }

    // Labels X and Y
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('x', width - 12, originY - 8);
    ctx.fillText('y', originX + 14, 14);
    ctx.fillText('0', originX - 8, originY + 14);

    // 3. Draw Curves & Shapes
    curves.forEach((curve) => {
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2.5;

      if (curve.type === 'circle') {
        const cx = toCanvasX(curve.a || 0);
        const cy = toCanvasY(curve.b || 0);
        const radiusPx = (curve.r || 3) * (width / (xMax - xMin));
        ctx.beginPath();
        ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
        ctx.stroke();

        // Center point
        ctx.fillStyle = curve.color;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`M(${curve.a || 0}; ${curve.b || 0})`, cx + 8, cy - 6);
        return;
      }

      if (curve.type === 'triangle' || curve.type === 'polygon') {
        if (curve.points && curve.points.length >= 3) {
          ctx.beginPath();
          curve.points.forEach((pt, pIdx) => {
            const px = toCanvasX(pt.x);
            const py = toCanvasY(pt.y);
            if (pIdx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.stroke();

          // Fill light transparent background
          ctx.fillStyle = curve.color + '15';
          ctx.fill();

          // Vertices & labels
          curve.points.forEach(pt => {
            const px = toCanvasX(pt.x);
            const py = toCanvasY(pt.y);
            ctx.fillStyle = curve.color;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            if (pt.label) {
              ctx.font = 'bold 11px sans-serif';
              ctx.fillText(`${pt.label}(${pt.x}; ${pt.y})`, px + 6, py - 6);
            }
          });
        }
        return;
      }

      if (curve.type === 'point') {
        const px = toCanvasX(curve.a || 0);
        const py = toCanvasY(curve.b || 0);
        ctx.fillStyle = curve.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(curve.label || `(${curve.a}; ${curve.b})`, px + 7, py - 7);
        return;
      }

      ctx.beginPath();

      let started = false;
      const steps = 400;
      const dx = (xMax - xMin) / steps;

      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        const y = evaluate(curve, x);

        if (y === null || isNaN(y) || y < yMin - 15 || y > yMax + 15) {
          started = false;
          continue;
        }

        const cx = toCanvasX(x);
        const cy = toCanvasY(y);

        if (!started) {
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();

      // 4. Roots
      if (showRoots) {
        const roots = calculateRoots(curve);
        roots.forEach((r) => {
          const cx = toCanvasX(r.x);
          const cy = toCanvasY(0);

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#b91c1c';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`(${r.x.toFixed(1)}; 0)`, cx, cy - 8);
        });
      }

      // 5. Vertex
      if (showVertex) {
        const vertex = calculateVertex(curve);
        if (vertex) {
          const cx = toCanvasX(vertex.x);
          const cy = toCanvasY(vertex.y);

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#047857';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`T(${vertex.x.toFixed(1)}; ${vertex.y.toFixed(1)})`, cx, cy - 10);
        }
      }
    });
  }, [curves, xMin, xMax, yMin, yMax, showGrid, showRoots, showVertex, showIntersections]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  const addCurve = (type: GraphCurve['type']) => {
    const nextColor = colors[curves.length % colors.length];
    let newCurve: GraphCurve;

    switch (type) {
      case 'linear':
        newCurve = { id: 'c-' + Date.now(), type, a: 1, b: 0, c: 0, color: nextColor, label: 'y = x' };
        break;
      case 'quadratic':
        newCurve = { id: 'c-' + Date.now(), type, a: 1, b: 0, c: 0, color: nextColor, label: 'y = x^2' };
        break;
      case 'modulus':
        newCurve = { id: 'c-' + Date.now(), type, a: 1, b: 0, c: 0, color: nextColor, label: 'y = |x|' };
        break;
      case 'rational':
        newCurve = { id: 'c-' + Date.now(), type, a: 2, b: 0, c: 0, color: nextColor, label: 'y = 2/x' };
        break;
      case 'trigonometric':
        newCurve = { id: 'c-' + Date.now(), type, a: 1, b: 1, c: 0, color: nextColor, label: 'y = sin(x)' };
        break;
      default:
        newCurve = { id: 'c-' + Date.now(), type, a: 1, b: 2, c: 0, color: nextColor, label: 'y = 2^x' };
    }

    if (type === 'circle') {
      newCurve = { id: 'c-' + Date.now(), type: 'circle', a: 0, b: 0, c: 0, r: 3, color: nextColor, label: 'x^2 + y^2 = 9' };
    } else if (type === 'triangle') {
      newCurve = {
        id: 'c-' + Date.now(),
        type: 'triangle',
        a: 0, b: 0, c: 0,
        points: [{ x: -3, y: -2, label: 'A' }, { x: 3, y: -2, label: 'B' }, { x: 0, y: 3, label: 'C' }],
        color: nextColor,
        label: 'Üçbucaq ABC'
      };
    } else if (type === 'polygon') {
      newCurve = {
        id: 'c-' + Date.now(),
        type: 'polygon',
        a: 0, b: 0, c: 0,
        points: [{ x: -3, y: -2, label: 'A' }, { x: 3, y: -2, label: 'B' }, { x: 3, y: 2, label: 'C' }, { x: -3, y: 2, label: 'D' }],
        color: nextColor,
        label: 'Dördbucaq ABCD'
      };
    } else if (type === 'point') {
      newCurve = {
        id: 'c-' + Date.now(),
        type: 'point',
        a: 2, b: 3, c: 0,
        color: nextColor,
        label: 'A(2; 3)'
      };
    }

    setCurves([...curves, newCurve]);
  };

  const updateCurve = (id: string, updates: Partial<GraphCurve>) => {
    setCurves(curves.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCurve = (id: string) => {
    if (curves.length <= 1) return;
    setCurves(curves.filter(c => c.id !== id));
  };

  const handleSaveToQuestion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSaveToQuestion({
      curves,
      xMin,
      xMax,
      yMin,
      yMax,
      showGrid,
      showRoots,
      showVertex,
      showIntersections,
      imageDataUrl: dataUrl,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 max-w-4xl w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Qrafik Laboratoriyası (Function Plotter)</h3>
            <p className="text-xs text-slate-500">Xətti, kvadratik, modul, tərs mütənasib və triqonometrik funksiyaların dəqiq qrafiki</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner w-full flex justify-center">
            <canvas
              ref={canvasRef}
              width={480}
              height={380}
              className="w-full max-w-[480px] h-auto object-contain cursor-crosshair"
            />
          </div>

          {/* Quick Axis Zoom & Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 w-full mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setXMin(x => x - 2); setXMax(x => x + 2); setYMin(y => y - 2); setYMax(y => y + 2); }}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                title="Böyüt (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setXMin(x => Math.min(x + 2, -2)); setXMax(x => Math.max(x - 2, 2)); setYMin(y => Math.min(y + 2, -2)); setYMax(y => Math.max(y - 2, 2)); }}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                title="Kiçilt (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setXMin(-6); setXMax(6); setYMin(-6); setYMax(6); }}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                title="Sıfırla"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoots}
                  onChange={(e) => setShowRoots(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium text-rose-600">Köklər (y=0)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVertex}
                  onChange={(e) => setShowVertex(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium text-emerald-600">Təpə nöqtəsi</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Tor</span>
              </label>
            </div>
          </div>
        </div>

        {/* Function Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Elementlər ({curves.length})</span>
            {/* Add curve / shape buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => addCurve('quadratic')}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-[11px] font-semibold transition-colors"
                title="Parabola"
              >
                + Parabola
              </button>
              <button
                type="button"
                onClick={() => addCurve('linear')}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-[11px] font-semibold transition-colors"
                title="Düz xətt"
              >
                + Xətt
              </button>
              <button
                type="button"
                onClick={() => addCurve('circle')}
                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[11px] font-semibold transition-colors"
                title="Dairə"
              >
                + Dairə
              </button>
              <button
                type="button"
                onClick={() => addCurve('triangle')}
                className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md text-[11px] font-semibold transition-colors"
                title="Üçbucaq"
              >
                + Üçbucaq
              </button>
              <button
                type="button"
                onClick={() => addCurve('point')}
                className="px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md text-[11px] font-semibold transition-colors"
                title="Nöqtə"
              >
                + Nöqtə
              </button>
            </div>
          </div>

          {/* Curves list */}
          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {curves.map((curve) => (
              <div
                key={curve.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition-all text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: curve.color }}
                    />
                    <select
                      value={curve.type}
                      onChange={(e) => updateCurve(curve.id, { type: e.target.value as any })}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="quadratic">Parabola: y = ax² + bx + c</option>
                      <option value="linear">Düz xətt: y = kx + b</option>
                      <option value="circle">Dairə: (x-a)² + (y-b)² = r²</option>
                      <option value="triangle">Üçbucaq ABC</option>
                      <option value="polygon">Dördbucaq ABCD</option>
                      <option value="point">Xüsusi Nöqtə A(x; y)</option>
                      <option value="modulus">Modul: y = a|x - b| + c</option>
                      <option value="rational">Tərs mütənasib: y = k/x + b</option>
                      <option value="exponential">Üstlü: y = a·b^x + c</option>
                      <option value="trigonometric">Triqonometrik: y = a·sin(bx) + c</option>
                    </select>
                  </div>

                  {curves.length > 1 && (
                    <button
                      onClick={() => removeCurve(curve.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Coefficients Controls */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      {curve.type === 'linear' ? 'k (meyl)' : curve.type === 'circle' ? 'Mərkəz X' : curve.type === 'point' ? 'X koordinat' : 'a əmsalı'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={curve.a}
                      onChange={(e) => updateCurve(curve.id, { a: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      {curve.type === 'linear' ? 'b (sərbəst)' : curve.type === 'circle' ? 'Mərkəz Y' : curve.type === 'point' ? 'Y koordinat' : 'b əmsalı'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={curve.b}
                      onChange={(e) => updateCurve(curve.id, { b: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                    />
                  </div>

                  {curve.type === 'circle' ? (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                        Radius (R)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={curve.r ?? 3}
                        onChange={(e) => updateCurve(curve.id, { r: Math.max(0.1, parseFloat(e.target.value) || 1) })}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                      />
                    </div>
                  ) : curve.type === 'point' ? (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                        Yazı / Ad
                      </label>
                      <input
                        type="text"
                        value={curve.label || ''}
                        onChange={(e) => updateCurve(curve.id, { label: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                        placeholder="Məs: A(2;3)"
                      />
                    </div>
                  ) : curve.type !== 'linear' ? (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                        c (sərbəst)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={curve.c}
                        onChange={(e) => updateCurve(curve.id, { c: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Action button: Save & Embed to Question */}
          <button
            type="button"
            onClick={handleSaveToQuestion}
            className="mt-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            Qrafiki Suala Əlavə Et
          </button>
        </div>
      </div>
    </div>
  );
};
