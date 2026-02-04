'use client';

import { useState, useEffect } from 'react';
import { GeneratedIdea, IdeaGenerationResponse, GenerationRequest } from '@/lib/types/idea';
import { TrendPost, TrendSourceKind } from '@/lib/types/trends';
import {
  saveGeneratedIdea,
  saveGenerationRequest,
  updateGenerationRequest,
  getUserConfig,
  checkIdeaUniqueness,
} from '@/lib/utils/storage';
import { decryptApiKey } from '@/lib/utils/encryption';
import { fetchQuotaInfo, QuotaInfo } from '@/lib/auth/sessionClient';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Shuffle, Trash2, Settings, History, Newspaper, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PaperOutput from './PaperOutput';
import PrintButton from './PrintButton';
import TrendInterface from './TrendInterface';
import ErrorMessage from '../common/ErrorMessage';
import TrialProgressBanner from './TrialProgressBanner';
import TrialUpgradePrompt from '../common/TrialUpgradePrompt';
import { printerBodyVariants, prefersReducedMotion } from './animations';
import { soundManager, playSound } from '@/lib/utils/soundEffects';


async function fetchTrialStatus(): Promise<{ ideasGenerated: number; remainingIdeas: number; hasExceededLimit: boolean; isTrialActive: boolean }> {
  try {
    const res = await fetch('/api/trial-status');
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  return { ideasGenerated: 0, remainingIdeas: 3, hasExceededLimit: false, isTrialActive: true };
}

const CATEGORIES = [
  'Productivity',
  'Health & Fitness',
  'Education',
  'Finance',
  'Travel',
  'Social',
  'Entertainment',
  'Utilities',
  'Lifestyle',
  'Business',
];

type GenerationMode = 'random' | 'trend';

export default function PrinterInterface() {
  const [idea, setIdea] = useState<GeneratedIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [userApiKey, setUserApiKey] = useState<string | undefined>();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [trialStatus, setTrialStatus] = useState({ ideasGenerated: 0, remainingIdeas: 3 });

  // Trend Mode State
  const [mode, setMode] = useState<GenerationMode>('random');
  const [selectedTrendPost, setSelectedTrendPost] = useState<TrendPost | null>(null);
  const [preferredSource, setPreferredSource] = useState<TrendSourceKind>('hackernews');

  useEffect(() => {
    // Check for reduced motion preference
    setReducedMotion(prefersReducedMotion());

    // Check for mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);

    // Resume audio context on first user interaction (browser autoplay policy)
    const resumeAudio = () => {
      soundManager.resume();
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);

    // Load trial status from server
    fetchTrialStatus().then(s => {
      setTrialStatus({ ideasGenerated: s.ideasGenerated, remainingIdeas: s.remainingIdeas });
    });

    // Load user API key and fetch quota info on mount
    loadUserConfig();

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', handleChange);
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserConfig = async () => {
    const userConfig = getUserConfig();

    if (userConfig?.preferredSource) {
      setPreferredSource(userConfig.preferredSource);
    }

    if (userConfig?.encryptedGeminiApiKey) {
      try {
        const decryptedKey = await decryptApiKey(userConfig.encryptedGeminiApiKey);
        setUserApiKey(decryptedKey);
        loadQuotaInfo(decryptedKey);
      } catch (decryptError) {
        console.error('Failed to decrypt API key:', decryptError);
        loadQuotaInfo();
      }
    } else {
      loadQuotaInfo();
    }
  };

  const loadQuotaInfo = async (apiKey?: string) => {
    const info = await fetchQuotaInfo(apiKey);
    if (info) {
      setQuotaInfo(info);
    }
  };

  const handleShuffle = () => {
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setSelectedCategory(randomCategory);
    setIdea(null);
    setError(null);

    // Play shuffle sound
    playSound('paperFeed', 0.4);
  };

  const handleTrash = () => {
    setIdea(null);
    setError(null);
    setSelectedCategory(undefined);

    // Play trash sound
    playSound('paperFeed', 0.3);
  };

  const handleGenerateIdea = async () => {
    setIsLoading(true);
    setError(null);
    setIdea(null);

    // Play paper feed sound when starting to print
    playSound('paperFeed', 0.5);

    // Check trial quota from server before generating
    const currentTrialStatus = await fetchTrialStatus();
    
    // Get user configuration (API key, preferred model, categories)
    let currentApiKey: string | undefined = userApiKey;
    let preferredModel: string | undefined;
    const userConfig = getUserConfig();

    // Only fetch API key if not already loaded
    if (!currentApiKey && userConfig?.encryptedGeminiApiKey) {
      try {
        currentApiKey = await decryptApiKey(userConfig.encryptedGeminiApiKey);
      } catch (decryptError) {
        console.error('Failed to decrypt API key:', decryptError);
        // Continue with default key
      }
    }

    // If no user API key and trial is exceeded, show upgrade prompt
    if (!currentApiKey && currentTrialStatus.hasExceededLimit) {
      setIsLoading(false);
      setShowUpgradePrompt(true);
      setError('Trial limit reached. Please create an account to continue.');
      return;
    }

    if (userConfig?.preferredModel) {
      preferredModel = userConfig.preferredModel;
    }

    // Create generation request record
    const requestId = uuidv4();
    const generationRequest: GenerationRequest = {
      id: requestId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      apiKeySource: currentApiKey ? 'user_provided' : 'default',
    };

    // Save request to sessionStorage
    saveGenerationRequest(generationRequest);

    // Start printing sound after paper feed
    setTimeout(() => {
      if (isLoading) {
        playSound('printing', 0.3);
      }
    }, 300);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      interface RequestBody {
        preferredCategory?: string;
        userApiKey?: string;
        modelName?: string;
        trendContext?: {
          content: string;
          source: string;
          author?: string;
        };
      }

      const requestBody: RequestBody = {
        preferredCategory: selectedCategory, // Pass selected category if any
        userApiKey: currentApiKey, // Pass user's API key if available
        modelName: preferredModel, // Pass preferred model if configured
      };

      // Add trend context if in trend mode and post is selected
      if (mode === 'trend' && selectedTrendPost) {
        requestBody.trendContext = {
          content: selectedTrendPost.excerpt,
          source: selectedTrendPost.sourceKind || 'unknown',
          author: selectedTrendPost.author ?? undefined,
        };
      }

      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();

        // Handle rate limit errors specially
        if (response.status === 429) {
          const retrySeconds = errorData.retryAfter || 60;
          const retryMinutes = Math.ceil(retrySeconds / 60);
          const timeUnit =
            retrySeconds < 120 ? `${retrySeconds} seconds` : `${retryMinutes} minutes`;

          throw new Error(
            errorData.error ||
              errorData.message ||
              `Rate limit exceeded. Please try again in ${timeUnit}.`
          );
        }

        throw new Error(errorData.error || 'Failed to generate idea');
      }

      const apiResponse: IdeaGenerationResponse = await response.json();

      // Create GeneratedIdea object for localStorage
      const generatedIdea: GeneratedIdea = {
        id: apiResponse.id,
        uniqueId: uuidv4(), // Generate unique ID for deduplication
        appName: apiResponse.appName,
        category: apiResponse.category,
        concept: apiResponse.concept,
        theGap: apiResponse.theGap,
        theFix: apiResponse.theFix,
        generatedAt: apiResponse.generatedAt,
        provenance:
          mode === 'trend' && selectedTrendPost
            ? {
                sourceKind: selectedTrendPost.sourceKind || 'hackernews',
                platform: selectedTrendPost.platform,
                sourceUrl: selectedTrendPost.sourceUrl,
                author: selectedTrendPost.author,
                postedAt: selectedTrendPost.postedAt,
                excerpt: selectedTrendPost.excerpt,
              }
            : undefined,
      };

      // Check uniqueness before saving
      const uniquenessCheck = checkIdeaUniqueness({
        appName: generatedIdea.appName,
        concept: generatedIdea.concept,
      });

      if (!uniquenessCheck.isUnique) {
        console.warn('Similar idea already exists:', uniquenessCheck.similarIdea);
        // Still save it, but notify the user
        setError(
          `Note: A similar idea "${uniquenessCheck.similarIdea?.appName}" already exists in your history.`
        );
      }

      // Save to localStorage
      const saved = saveGeneratedIdea(generatedIdea);
      if (!saved) {
        console.warn('Failed to save idea to localStorage');
      }

      // Refresh trial status from server (cookie was updated by the API)
      if (!currentApiKey) {
        fetchTrialStatus().then(updatedTrialStatus => {
          setTrialStatus({
            ideasGenerated: updatedTrialStatus.ideasGenerated,
            remainingIdeas: updatedTrialStatus.remainingIdeas,
          });
          if (updatedTrialStatus.hasExceededLimit) {
            setTimeout(() => setShowUpgradePrompt(true), 2000);
          }
        });
      }

      // Update generation request to success
      updateGenerationRequest(requestId, {
        status: 'success',
        completedAt: new Date().toISOString(),
        durationMs: apiResponse.durationMs,
        generatedIdeaId: generatedIdea.id,
        apiKeySource: apiResponse.apiKeySource,
      });

      setIdea(generatedIdea);

      // Reload quota info to get updated count
      loadQuotaInfo(currentApiKey);

      // Play completion sound
      playSound('complete', 0.6);
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out after 60 seconds. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }

      // Update generation request to failed
      updateGenerationRequest(requestId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorMessage: errorMessage,
      });

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trial Progress Banner - only show if using trial (no user API key) */}
      {!userApiKey && trialStatus.ideasGenerated > 0 && (
        <TrialProgressBanner
          ideasGenerated={trialStatus.ideasGenerated}
          remainingIdeas={trialStatus.remainingIdeas}
        />
      )}
      
      {/* Trial Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <TrialUpgradePrompt
          isOpen={showUpgradePrompt}
          ideasGenerated={trialStatus.ideasGenerated}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
      
      <div className="min-h-screen flex flex-col items-center p-4 md:p-8 pt-24 md:pt-32 bg-[#e0dcd5] relative">
      {/* Quota Info - Top Left */}
      <div className="absolute md:fixed top-20 md:top-24 left-4 md:left-8 bg-white rounded-lg shadow-lg p-4 z-40 max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">API Key:</span>
            <span className="text-sm font-semibold text-gray-700">
              {quotaInfo?.keyMode === 'shared' ? 'Shared' : 'Your Key'}
            </span>
          </div>
          {quotaInfo?.keyMode === 'shared' ? (
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Daily remaining:</span>
                <span className="font-semibold">
                  {quotaInfo.remainingDaily !== undefined
                    ? `${quotaInfo.remainingDaily}/30`
                    : '...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-green-600">
              <span>No quota restrictions</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Navigation (Settings and History) */}
      <div className="absolute md:fixed top-4 md:top-8 right-4 md:right-8 flex gap-4 z-50">
        {/* Logo Branding - Compact */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg mr-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/brand/ideaprinter-logo.svg"
            alt="IdeaPrinter"
            width={20}
            height={20}
            className="object-contain"
          />
          <span className="font-bold text-sm text-gray-800 tracking-tight">
            ideaprinter
          </span>
          <a
            href="https://rytix.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
          >
            by rytix
          </a>
        </div>
        
        <Link
          href="/"
          className="p-4 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all hover:shadow-xl group"
          aria-label="Home"
        >
          <svg className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <Link
          href="/history"
          className="p-4 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all hover:shadow-xl group"
          aria-label="History"
        >
          <History className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
        </Link>
        <Link
          href="/config"
          className="p-4 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all hover:shadow-xl group"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
        </Link>
      </div>

      {/* Printer Body */}
      <motion.div
        className="bg-[#E63946] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-4xl w-full border-b-[12px] border-r-[12px] border-[#9D1722] relative my-auto"
        variants={reducedMotion || isMobile ? undefined : printerBodyVariants}
        animate={
          reducedMotion || isMobile
            ? undefined
            : isLoading
              ? 'printing'
              : idea
                ? 'complete'
                : 'idle'
        }
        transition={reducedMotion ? { duration: 0.01 } : undefined}
      >
        {/* Printer Brand/Header */}
        <div className="flex justify-center items-center mb-8">
          <div className="bg-[#1F2937] px-6 py-2 rounded-full shadow-lg flex items-center gap-2 border border-[#374151]">
            <div
              className={`w-3 h-3 rounded-full ${isLoading ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`}
            ></div>
            <span className="text-gray-200 font-mono text-sm tracking-widest font-bold">
              MEMO-RITE
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-6" role="group" aria-label="Generation Mode">
          <button
            onClick={() => setMode('random')}
            aria-pressed={mode === 'random'}
            className={`px-4 py-2 min-h-[44px] rounded-full font-mono text-sm font-bold transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#E63946] focus:ring-white ${
              mode === 'random'
                ? 'bg-[#1F2937] text-green-400 shadow-lg border border-green-500/30'
                : 'bg-[#9D1722] text-red-200 hover:bg-[#8a141e]'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
            RANDOM
          </button>
          <button
            onClick={() => setMode('trend')}
            aria-pressed={mode === 'trend'}
            className={`px-4 py-2 min-h-[44px] rounded-full font-mono text-sm font-bold transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#E63946] focus:ring-white ${
              mode === 'trend'
                ? 'bg-[#1F2937] text-green-400 shadow-lg border border-green-500/30'
                : 'bg-[#9D1722] text-red-200 hover:bg-[#8a141e]'
            }`}
          >
            <Newspaper className="w-4 h-4 mr-2" aria-hidden="true" />
            TRENDS
          </button>
        </div>

        {/* LCD Display Area */}
        <div
          className={`bg-[#111827] rounded-[20px] p-8 mb-8 flex justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative overflow-hidden border-b-4 border-[#374151] transition-all duration-300 ${mode === 'trend' ? 'min-h-[400px] items-start' : 'min-h-[120px] items-center'}`}
        >
          {/* Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20"></div>

          <div className="z-20 w-full relative">
            {mode === 'trend' ? (
              <TrendInterface
                preferredSource={preferredSource}
                selectedPostId={selectedTrendPost?.id || null}
                onSelectPost={setSelectedTrendPost}
                isLoading={isLoading}
              />
            ) : (
              <div className="text-center w-full">
                {isLoading && (
                  <p className="text-green-500/80 font-mono text-lg animate-pulse tracking-widest">
                    PRINTING...
                  </p>
                )}
                {!isLoading && !idea && !error && (
                  <div className="space-y-2">
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">
                      READY TO PRINT...
                    </p>
                    {selectedCategory && (
                      <p className="text-green-500 font-mono text-xl tracking-wider animate-pulse">
                        &gt; {selectedCategory} &lt;
                      </p>
                    )}
                  </div>
                )}
                {!isLoading && idea && (
                  <p className="text-green-500 font-mono text-lg tracking-widest">
                    DONE. ID: {idea.uniqueId}
                  </p>
                )}
                {!isLoading && error && (
                  <p className="text-red-500 font-mono text-sm tracking-widest">
                    ERROR: {error.toUpperCase()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex justify-center items-center gap-6 mb-8">
          {/* Shuffle Button */}
          <motion.button
            whileHover={reducedMotion || mode === 'trend' ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion || mode === 'trend' ? undefined : { scale: 0.95 }}
            onClick={handleShuffle}
            disabled={isLoading || mode === 'trend'}
            className="w-20 h-20 bg-[#1F2937] rounded-[24px] flex items-center justify-center shadow-[0_4px_0_#000000] active:shadow-none active:translate-y-1 border-t border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Shuffle Category"
          >
            <Shuffle className="w-8 h-8 text-gray-400" />
          </motion.button>

          {/* Trash Button */}
          <motion.button
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={handleTrash}
            disabled={isLoading}
            className="w-20 h-20 bg-[#1F2937] rounded-[24px] flex items-center justify-center shadow-[0_4px_0_#000000] active:shadow-none active:translate-y-1 border-t border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear"
          >
            <Trash2 className="w-8 h-8 text-gray-400" />
          </motion.button>

          {/* Print Button (Large) */}
          <div className="flex-1 max-w-[280px]">
            <PrintButton
              onClick={handleGenerateIdea}
              disabled={isLoading || (mode === 'trend' && !selectedTrendPost)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Paper Output Tray */}
        <div className="relative z-0">
          {/* Paper Slot Shadow */}
          <div className="absolute top-0 left-4 right-4 h-2 bg-black/20 rounded-full blur-sm z-20"></div>

          <div className="relative z-10 min-h-[100px]">
            {error && !isLoading && (
              <div className="bg-white p-4 rounded shadow-lg max-w-md mx-auto mt-4 transform rotate-1">
                <ErrorMessage message={error} onRetry={handleGenerateIdea} />
              </div>
            )}

            <PaperOutput
              idea={idea}
              isPrinting={isLoading}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
            />
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-600 text-xs font-mono tracking-widest">
        <p>MEMO-RITE CORP. // MODEL 8392-XJ</p>
      </div>
    </div>
    </>
  );
}
