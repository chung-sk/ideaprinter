'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import IdeaPrintout from '@/components/printer/IdeaPrintout';
import { GeneratedIdea } from '@/lib/types/idea';
import Link from 'next/link';

function ShareContent() {
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState<GeneratedIdea | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setIdea({
          id: decoded.id,
          uniqueId: decoded.id,
          appName: decoded.name,
          category: decoded.cat,
          concept: decoded.con,
          theGap: decoded.gap,
          theFix: decoded.fix,
          generatedAt: decoded.gen
        });
      } catch (e) {
        console.error('Failed to parse idea data', e);
      }
    }
  }, [searchParams]);

  if (!idea) {
    return (
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Idea...</h1>
        <Link href="/" className="underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-2xl mb-8">
        <IdeaPrintout idea={idea} />
      </div>
      
      <Link 
        href="/"
        className="bg-[#1f2937] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors border-2 border-[#1f2937] hover:border-white"
      >
        Generate Your Own Idea
      </Link>
    </div>
  );
}

export default function SharePage() {
  return (
    <div className="min-h-screen bg-[#e63946] py-12 px-4 flex flex-col items-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ShareContent />
      </Suspense>
    </div>
  );
}
