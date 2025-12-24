'use client';

import { GeneratedIdea } from '@/lib/types/idea';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { typewriterVariants, typewriterCharVariants } from './animations';

interface IdeaPrintoutProps {
  idea: GeneratedIdea;
  reducedMotion?: boolean;
}

const TypewriterText = ({ text, className, reducedMotion = false }: { text: string, className?: string, reducedMotion?: boolean }) => {
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
      {text.split(" ").map((word, index) => (
        <motion.span 
          key={index} 
          variants={typewriterCharVariants} 
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

export default function IdeaPrintout({ idea, reducedMotion = false }: IdeaPrintoutProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a shareable URL with encoded data
      // In a real app, this would point to a dedicated share page
      // For now, we'll point to the home page with a query param
      const data = encodeURIComponent(JSON.stringify({
        id: idea.uniqueId,
        name: idea.appName,
        cat: idea.category,
        con: idea.concept,
        gap: idea.theGap,
        fix: idea.theFix,
        gen: idea.generatedAt
      }));
      setShareUrl(`${window.location.origin}/share?data=${data}`);
    }
  }, [idea]);

  const copyToClipboard = async () => {
    const text = `${idea.appName} (${idea.category})

CONCEPT:
${idea.concept}

THE GAP:
${idea.theGap}

THE FIX:
${idea.theFix}

ID: ${idea.uniqueId}
Generated: ${new Date(idea.generatedAt).toLocaleString()}
${shareUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAsText = () => {
    const text = `${idea.appName}
${'='.repeat(idea.appName.length)}

Category: ${idea.category}
ID: ${idea.uniqueId}
Generated: ${new Date(idea.generatedAt).toLocaleString()}

CONCEPT
-------
${idea.concept}

THE GAP (PROBLEM)
-----------------
${idea.theGap}

THE FIX (SOLUTION)
------------------
${idea.theFix}

---
Share: ${shareUrl}
`;

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
          onClick={exportAsText}
          className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
          title="Export as text"
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

      {/* Concept Section */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          CONCEPT
        </h3>
        <TypewriterText text={idea.concept} className="text-gray-800 leading-relaxed" reducedMotion={reducedMotion} />
      </div>

      {/* The Gap Section */}
      <div className="mb-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          THE GAP (PROBLEM)
        </h3>
        <TypewriterText text={idea.theGap} className="text-gray-800 leading-relaxed" reducedMotion={reducedMotion} />
      </div>

      {/* The Fix Section */}
      <div className="mb-6 bg-green-50 p-4 rounded border-l-4 border-green-500">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
          THE FIX (SOLUTION)
        </h3>
        <TypewriterText text={idea.theFix} className="text-gray-800 leading-relaxed" reducedMotion={reducedMotion} />
      </div>

      {/* Footer with QR Code */}
      <div className="border-t-2 border-dashed border-gray-400 pt-6 mt-6 flex justify-between items-end">
        <div className="text-xs text-gray-500">
          <p>Generated: {new Date(idea.generatedAt).toLocaleString()}</p>
          <p className="mt-1">ideaprinter.app</p>
        </div>
        
        {shareUrl && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-2 rounded border border-gray-200">
              <QRCodeCanvas value={shareUrl} size={64} level="L" />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Scan to Share</span>
          </div>
        )}
      </div>
    </div>
  );
}
