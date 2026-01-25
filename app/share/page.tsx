'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import IdeaPrintout from '@/components/printer/IdeaPrintout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { GeneratedIdea } from '@/lib/types/idea';
import { decodeSharePayload } from '@/lib/share/sharePayload';
import Link from 'next/link';

function ShareContent() {
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState<GeneratedIdea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = searchParams.get('data');
    const ideaId = searchParams.get('ideaId');

    // Check for unsupported query params
    if (ideaId) {
      setError(
        'This share link format is not supported. Share links must include the idea data in the URL.'
      );
      setIsLoading(false);
      return;
    }

    if (!data) {
      setError('No idea data found in the share link.');
      setIsLoading(false);
      return;
    }

    try {
      // Decode using new share utilities (supports versioned + legacy)
      const decoded = decodeSharePayload(data);

      setIdea({
        id: decoded.id,
        uniqueId: decoded.id,
        appName: decoded.name,
        category: decoded.category,
        concept: decoded.concept,
        theGap: decoded.gap,
        theFix: decoded.fix,
        generatedAt: decoded.generatedAt,
        provenance: decoded.provenance,
      });
      setIsLoading(false);
    } catch (e) {
      console.error('Failed to parse idea data', e);
      setError(
        'This share link appears to be invalid or corrupted. Please check the URL and try again.'
      );
      setIsLoading(false);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
        <p className="text-white mt-4 font-mono animate-pulse">LOADING SHARED IDEA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Unable to Load Idea</h1>
        <p className="mb-6 text-gray-200">{error}</p>
        <Link
          href="/"
          className="inline-block bg-white text-[#e63946] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
        >
          Generate Your Own Idea
        </Link>
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-2xl mb-8">
        <IdeaPrintout idea={idea} />
      </div>

      <Link
        href="/"
        className="bg-[#1f2937] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors border-2 border-[#1f2937] hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
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
