import React from 'react';
import { cn } from '@/lib/utils';

export function FormattedText({ text, className }: { text: string; className?: string }) {
  if (!text) {
    return null;
  }

  const paragraphs = text.split('\n\n');

  return (
    <div className={cn(className)}>
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="mb-2 last:mb-0">
          {paragraph.split('\n').map((line, lIndex, lineArr) => {
            const parts = line.split(/(\*\*.*?\*\*|_.*?_)/g);
            const lineContent = parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex} className="text-card-foreground">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('_') && part.endsWith('_')) {
                return <em key={partIndex}>{part.slice(1, -1)}</em>;
              }
              return part;
            });

            if (lIndex < lineArr.length - 1) {
              return <React.Fragment key={lIndex}>{lineContent}<br/></React.Fragment>;
            }
            return lineContent;
          })}
        </p>
      ))}
    </div>
  );
}
