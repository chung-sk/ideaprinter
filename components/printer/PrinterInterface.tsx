'use client';

import { useState, useEffect } from 'react';
import { GeneratedIdea, IdeaGenerationResponse, GenerationRequest } from '@/lib/types/idea';
import { saveGeneratedIdea, saveGenerationRequest, updateGenerationRequest, getUserConfig, checkIdeaUniqueness } from '@/lib/utils/storage';
import { decryptApiKey } from '@/lib/utils/encryption';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Shuffle, Trash2, Settings, History } from 'lucide-react';
import Link from 'next/link';
import PaperOutput from './PaperOutput';
import PrintButton from './PrintButton';
import ErrorMessage from '../common/ErrorMessage';
import { printerBodyVariants, prefersReducedMotion } from './animations';
import { soundManager, playSound } from '@/lib/utils/soundEffects';

const CATEGORIES = [
  'Productivity', 'Health & Fitness', 'Education', 'Finance', 'Travel', 
  'Social', 'Entertainment', 'Utilities', 'Lifestyle', 'Business'
];

export default function PrinterInterface() {
  const [idea, setIdea] = useState<GeneratedIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', handleChange);
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

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
    setSelectedCategory(null);
    
    // Play trash sound
    playSound('paperFeed', 0.3);
  };

  const handleGenerateIdea = async () => {
    setIsLoading(true);
    setError(null);
    setIdea(null);

    // Play paper feed sound when starting to print
    playSound('paperFeed', 0.5);

    // Get user configuration (API key, preferred model, categories)
    let userApiKey: string | undefined;
    let preferredModel: string | undefined;
    const userConfig = getUserConfig();
    if (userConfig?.encryptedGeminiApiKey) {
      try {
        userApiKey = await decryptApiKey(userConfig.encryptedGeminiApiKey);
      } catch (decryptError) {
        console.error('Failed to decrypt API key:', decryptError);
        // Continue with default key
      }
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
      apiKeySource: userApiKey ? 'user_provided' : 'default',
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

      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredCategory: selectedCategory, // Pass selected category if any
          userApiKey: userApiKey, // Pass user's API key if available
          modelName: preferredModel, // Pass preferred model if configured
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate idea');
      }

      const apiResponse: IdeaGenerationResponse = await response.json();
      
      // Create GeneratedIdea object for localStorage
      const generatedIdea: GeneratedIdea = {
        id: apiResponse.id,
        appName: apiResponse.appName,
        category: apiResponse.category,
        concept: apiResponse.concept,
        theGap: apiResponse.theGap,
        theFix: apiResponse.theFix,
        generatedAt: apiResponse.generatedAt,
        uniqueId: apiResponse.uniqueId,
      };

      // Check uniqueness before saving
      const uniquenessCheck = checkIdeaUniqueness({
        appName: generatedIdea.appName,
        concept: generatedIdea.concept,
      });

      if (!uniquenessCheck.isUnique) {
        console.warn('Similar idea already exists:', uniquenessCheck.similarIdea);
        // Still save it, but notify the user
        setError(`Note: A similar idea "${uniquenessCheck.similarIdea?.appName}" already exists in your history.`);
      }

      // Save to localStorage
      const saved = saveGeneratedIdea(generatedIdea);
      if (!saved) {
        console.warn('Failed to save idea to localStorage');
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#e0dcd5]">
      {/* Top Navigation (Settings and History) */}
      <div className="fixed top-8 right-8 flex gap-4 z-50">
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
        className="bg-[#E63946] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-4xl w-full border-b-[12px] border-r-[12px] border-[#9D1722] relative"
        variants={reducedMotion || isMobile ? undefined : printerBodyVariants}
        animate={reducedMotion || isMobile ? undefined : (isLoading ? "printing" : idea ? "complete" : "idle")}
        transition={reducedMotion ? { duration: 0.01 } : undefined}
      >
        {/* Printer Brand/Header */}
        <div className="flex justify-center items-center mb-8">
          <div className="bg-[#1F2937] px-6 py-2 rounded-full shadow-lg flex items-center gap-2 border border-[#374151]">
            <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-gray-200 font-mono text-sm tracking-widest font-bold">MEMO-RITE</span>
          </div>
        </div>

        {/* LCD Display Area */}
        <div className="bg-[#111827] rounded-[20px] p-8 mb-8 min-h-[120px] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative overflow-hidden border-b-4 border-[#374151]">
          {/* Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20"></div>
          
          <div className="z-20 text-center w-full">
            {isLoading && (
              <p className="text-green-500/80 font-mono text-lg animate-pulse tracking-widest">
                PRINTING...
              </p>
            )}
            {!isLoading && !idea && !error && (
              <div className="space-y-2">
                <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">READY TO PRINT...</p>
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
        </div>

        {/* Control Panel */}
        <div className="flex justify-center items-center gap-6 mb-8">
          {/* Shuffle Button */}
          <motion.button
            whileHover={reducedMotion ? undefined : { scale: 1.05 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={handleShuffle}
            disabled={isLoading}
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
              disabled={isLoading}
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

            <PaperOutput idea={idea} isPrinting={isLoading} reducedMotion={reducedMotion} isMobile={isMobile} />
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-400 text-xs font-mono tracking-widest opacity-60">
        <p>MEMO-RITE CORP. // MODEL 8392-XJ</p>
      </div>
    </div>
  );
}
