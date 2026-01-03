'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, Check, ExternalLink } from 'lucide-react';
import type { TrendPost, IngestionStatus, TrendSourceKind } from '@/lib/types/trends';
import { getTrendPosts, saveTrendPosts, getUserConfig } from '@/lib/utils/storage';
import { decryptApiKey } from '@/lib/utils/encryption';
import { mergeAndDeduplicatePosts } from '@/lib/trends/dedupe';

interface TrendInterfaceProps {
  preferredSource: TrendSourceKind;
  selectedPostId: string | null;
  onSelectPost: (post: TrendPost) => void;
  isLoading?: boolean;
}

export default function TrendInterface({
  preferredSource,
  selectedPostId,
  onSelectPost,
  isLoading: parentLoading,
}: TrendInterfaceProps) {
  const [posts, setPosts] = useState<TrendPost[]>([]);
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing posts on mount
  useEffect(() => {
    const storedPosts = getTrendPosts();
    const filtered = storedPosts.filter(
      (p) => p.sourceKind === preferredSource || p.platform === preferredSource
    );
    setPosts(filtered);
  }, [preferredSource]);

  const startIngestion = async () => {
    try {
      setError(null);
      setIngestionStatus('pending');

      // Get user config for credentials
      const userConfig = getUserConfig();
      const requestBody: Record<string, unknown> = { sourceKind: preferredSource };

      // Add credentials for X/Twitter if needed
      if (
        preferredSource === 'x_twitter' &&
        userConfig?.xTwitterConfig?.hasToken &&
        userConfig.encryptedXBearerToken
      ) {
        try {
          const decryptedToken = await decryptApiKey(userConfig.encryptedXBearerToken);
          requestBody.xBearerToken = decryptedToken;
          if (userConfig.xTwitterConfig.defaultQuery) {
            requestBody.xQuery = userConfig.xTwitterConfig.defaultQuery;
          }
        } catch (decryptError) {
          console.error('Failed to decrypt X bearer token:', decryptError);
          throw new Error('Failed to decrypt X bearer token');
        }
      }

      const response = await fetch('/api/trends/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start ingestion');
      }

      const data = await response.json();
      setJobId(data.jobId);
      setIngestionStatus('running');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ingestion failed');
      setIngestionStatus('failed');
    }
  };

  // Poll for status
  useEffect(() => {
    if (!jobId || (ingestionStatus !== 'pending' && ingestionStatus !== 'running')) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/trends/ingest/${jobId}`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.status === 'completed') {
          setIngestionStatus('completed');

          // Save new posts
          if (data.posts && Array.isArray(data.posts)) {
            const newPosts = data.posts as TrendPost[];
            const existing = getTrendPosts();

            // Merge and deduplicate posts (prioritizes new content)
            const merged = mergeAndDeduplicatePosts(existing, newPosts);

            saveTrendPosts(merged);

            // Update display
            const filtered = merged.filter(
              (p) => p.sourceKind === preferredSource || p.platform === preferredSource
            );
            setPosts(filtered);
          }

          setJobId(null);
        } else if (data.status === 'failed') {
          setIngestionStatus('failed');
          setError(data.error || 'Ingestion failed');
          setJobId(null);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, ingestionStatus, preferredSource]);

  const isLoading = ingestionStatus === 'pending' || ingestionStatus === 'running' || parentLoading;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h3 className="font-mono text-sm font-bold text-green-500 uppercase tracking-wider">
          SOURCE:{' '}
          {preferredSource === 'hackernews'
            ? 'HACKER NEWS'
            : preferredSource === 'rss_bundle'
              ? 'TECH NEWS'
              : preferredSource}
        </h3>
        <button
          onClick={startIngestion}
          disabled={isLoading}
          aria-label={isLoading ? 'Syncing trends' : 'Refresh trends'}
          className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-green-400 rounded text-xs font-mono transition-colors disabled:opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isLoading ? 'SYNCING...' : 'REFRESH'}
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        {isLoading
          ? 'Syncing trends...'
          : error
            ? `Error: ${error}`
            : `Showing ${posts.length} trend posts`}
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-red-900/30 text-red-400 text-xs font-mono rounded flex items-center gap-2 border border-red-800"
          role="alert"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar"
        role="listbox"
        aria-label="Trend posts"
      >
        {posts.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-gray-500 font-mono text-sm">
            NO DATA FOUND.
            <br />
            PRESS REFRESH TO SYNC.
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              role="option"
              aria-selected={selectedPostId === post.id}
              tabIndex={0}
              onClick={() => onSelectPost(post)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPost(post);
                }
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-left p-3 rounded border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${
                selectedPostId === post.id
                  ? 'bg-green-900/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                  : 'bg-gray-800/50 border-gray-700 hover:border-green-500/50 hover:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h4
                  className={`font-mono text-xs md:text-sm mb-1 line-clamp-2 ${selectedPostId === post.id ? 'text-green-400 font-bold' : 'text-gray-300'}`}
                >
                  {selectedPostId === post.id ? '> ' : ''}
                  {post.excerpt || 'No content'}
                </h4>
                {selectedPostId === post.id && (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-gray-500 uppercase">
                <span>{post.author || 'UNKNOWN'}</span>
                <span>
                  {post.postedAt ? new Date(post.postedAt).toLocaleDateString() : 'DATE?'}
                </span>
              </div>

              {post.sourceUrl && (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline focus:outline-none focus:text-blue-200"
                  aria-label={`Read source for ${post.excerpt?.slice(0, 20)}...`}
                >
                  LINK <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
