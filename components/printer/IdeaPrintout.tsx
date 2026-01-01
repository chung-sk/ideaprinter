'use client';

import { GeneratedIdea, Idea } from '@/lib/types/idea';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Copy, Download, FileText, Check, ExternalLink } from 'lucide-react';
import { typewriterVariants, typewriterCharVariants } from './animations';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { exportIdeaAsMarkdown, exportIdeaAsText } from '@/lib/share/ideaExport';
import { getSiteOrigin } from '@/lib/share/siteOrigin';

interface IdeaPrintoutProps {
  idea: GeneratedIdea;
  reducedMotion?: boolean;
}

const TypewriterText = ({
  text,
  className,
  reducedMotion = false,
}: {
  text: string;
  className?: string;
  reducedMotion?: boolean;
}) => {
  // Skip typewriter effect if reduced motion is preferred
  if (reducedMotion) {
    return <p className={className}>{text}</p>;
  }

  return (
    <motion.p
      className={className}
      variants={typewriterVariants}
      initial="hidden"
      animate="visible"
    >
      {text.split(' ').map((word, index) => (
        <motion.span key={index} variants={typewriterCharVariants} className="inline-block mr-1">
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default function IdeaPrintout({ idea, reducedMotion = false }: IdeaPrintoutProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const ideaForSharing: Idea = {
          id: idea.uniqueId,
          name: idea.appName,
          category: idea.category,
          generatedAt: idea.generatedAt,
          concept: idea.concept,
          gap: idea.theGap,
          fix: idea.theFix,
          provenance: idea.provenance,
        };

        const url = buildShareUrl(ideaForSharing);
        setShareUrl(url);
        setShareError(null);
      } catch (error) {
        console.error('Failed to generate share URL:', error);
        if (error instanceof Error && error.message.includes('too long')) {
          setShareError('Idea too large for QR sharing');
        }
      }
    }
  }, [idea]);

  const copyToClipboard = async () => {
    const sourceUrl = idea.provenance?.sourceUrl || 'Not available';
    const text = `${idea.appName} (${idea.category})

CONCEPT:
${idea.concept}

THE GAP:
${idea.theGap}

THE FIX:
${idea.theFix}

ID: ${idea.uniqueId}
Generated: ${new Date(idea.generatedAt).toLocaleString()}
Source URL: ${sourceUrl}
Share URL: ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAsMarkdown = () => {
    const ideaForExport: Idea = {
      id: idea.uniqueId,
      name: idea.appName,
      category: idea.category,
      generatedAt: idea.generatedAt,
      concept: idea.concept,
      gap: idea.theGap,
      fix: idea.theFix,
      provenance: idea.provenance,
    };
    const markdown = exportIdeaAsMarkdown(ideaForExport, shareUrl);
    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idea-${idea.uniqueId}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const ideaForExport: Idea = {
      id: idea.uniqueId,
      name: idea.appName,
      category: idea.category,
      generatedAt: idea.generatedAt,
      concept: idea.concept,
      gap: idea.theGap,
      fix: idea.theFix,
      provenance: idea.provenance,
    };
    const text = exportIdeaAsText(ideaForExport, shareUrl);
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idea-${idea.uniqueId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="paper-texture rounded-lg p-8 max-w-2xl mx-auto shadow-xl font-mono-retro bg-[#fdfbf7] relative">
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportAsMarkdown}
          className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
          title="Export as Markdown (.md)"
        >
          <FileText className="w-4 h-4 text-gray-600" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportAsText}
          className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
          title="Export as text (.txt)"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </motion.button>
      </div>

      {/* Printout Header */}
      <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-6">
        <motion.h2
          initial={reducedMotion ? undefined : { opacity: 0 }}
          animate={reducedMotion ? undefined : { opacity: 1 }}
          transition={reducedMotion ? undefined : { duration: 0.5 }}
          className="text-2xl font-bold text-gray-800 pr-24"
        >
          {idea.appName}
        </motion.h2>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600 uppercase tracking-wide">{idea.category}</p>
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            ID: {idea.uniqueId}
          </span>
        </div>
      </div>

      {/* Provenance Section */}
      {idea.provenance && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs font-mono">
          <p className="text-blue-500 uppercase mb-1 font-bold">INSPIRED BY TREND:</p>
          <p className="font-bold text-gray-700 mb-1 line-clamp-2">{idea.provenance.excerpt}</p>
          <div className="flex justify-between text-gray-500 mt-2">
            <span>
              {idea.provenance.sourceKind === 'hackernews'
                ? 'Hacker News'
                : idea.provenance.sourceKind === 'rss_bundle'
                  ? 'Tech News'
                  : idea.provenance.sourceKind}
            </span>
            {idea.provenance.sourceUrl && (
              <a
                href={idea.provenance.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600 flex items-center gap-1"
              >
                SOURCE <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Concept Section */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">CONCEPT</h3>
        <TypewriterText
          text={idea.concept}
          className="text-gray-800 leading-relaxed"
          reducedMotion={reducedMotion}
        />
      </div>

      {/* The Gap Section */}
      <div className="mb-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          THE GAP (PROBLEM)
        </h3>
        <TypewriterText
          text={idea.theGap}
          className="text-gray-800 leading-relaxed"
          reducedMotion={reducedMotion}
        />
      </div>

      {/* The Fix Section */}
      <div className="mb-6 bg-green-50 p-4 rounded border-l-4 border-green-500">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          THE FIX (SOLUTION)
        </h3>
        <TypewriterText
          text={idea.theFix}
          className="text-gray-800 leading-relaxed"
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Footer with QR Code */}
      <div className="border-t-2 border-dashed border-gray-400 pt-6 mt-6 flex justify-between items-end">
        <div className="text-xs text-gray-500">
          <p>Generated: {new Date(idea.generatedAt).toLocaleString()}</p>
          <p className="mt-1">{getSiteOrigin().replace(/^https?:\/\//, '') || 'ideaprinter.app'}</p>
        </div>

        {shareError ? (
          <div className="flex flex-col items-center max-w-[120px]">
            <div className="bg-yellow-50 border border-yellow-300 rounded p-2">
              <p className="text-[10px] text-yellow-700 text-center leading-tight">{shareError}</p>
            </div>
            <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">
              QR unavailable
            </span>
          </div>
        ) : shareUrl ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded border border-gray-200">
              <QRCodeCanvas
                value={shareUrl}
                size={256}
                level="L"
                includeMargin={true}
                data-testid="qr-code"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
              Scan to Share
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
