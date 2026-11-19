// src/components/MathRenderer.tsx
import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', block = false }) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    // Əgər kontent birbaşa şəkildirsə (Base64 data URL)
    if (content.trim().startsWith('data:image/')) {
      return `<img src="${content.trim()}" alt="Kəsilmiş Şəkil" class="max-h-56 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain block my-1 text-left" />`;
    }

    // If block is explicitly true and content doesn't have $, treat whole as math
    if (block && !content.includes('$')) {
      try {
        return katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        return escapeAndFormat(content);
      }
    }

    // Split text by display math $$...$$ and inline math $...$
    // Regex matches $$...$$ or $...$
    const parts: string[] = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        // Plain text segment (Markdown şəkilləri və sətir qırılmaları dəstəklənir)
        parts.push(escapeAndFormat(content.substring(lastIndex, match.index)));
      }

      const mathExpression = match[0];
      const isDisplay = mathExpression.startsWith('$$');
      const rawMath = isDisplay
        ? mathExpression.slice(2, -2)
        : mathExpression.slice(1, -1);

      try {
        const html = katex.renderToString(rawMath.trim(), {
          displayMode: isDisplay,
          throwOnError: false,
        });
        parts.push(html);
      } catch (err) {
        parts.push(`<span class="text-rose-500 font-mono text-xs">${escapeAndFormat(mathExpression)}</span>`);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(escapeAndFormat(content.substring(lastIndex)));
    }

    return parts.join('');
  }, [content, block]);

  return (
    <span
      className={`inline-math-container leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

function escapeAndFormat(text: string): string {
  // Əvvəlcə Markdown şəkillərini placeholder ilə qoruyaq: ![alt](url)
  const images: string[] = [];
  const withImagePlaceholders = text.replace(/!\[([^\]]*)\]\((data:image\/[^)]+|https?:\/\/[^)]+|\/[^)]+)\)/g, (_, alt, url) => {
    const idx = images.length;
    images.push(`<img src="${url}" alt="${alt || 'Şəkil'}" class="max-h-56 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain block my-1 text-left" />`);
    return `###IMG_PLACEHOLDER_${idx}###`;
  });

  let escaped = withImagePlaceholders
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');

  // Şəkilləri bərpa edək
  images.forEach((imgHtml, idx) => {
    escaped = escaped.replace(`###IMG_PLACEHOLDER_${idx}###`, imgHtml);
  });

  return escaped;
}
