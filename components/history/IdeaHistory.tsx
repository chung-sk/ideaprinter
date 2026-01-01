'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import type { GeneratedIdea, IdeaCategory, Idea } from '@/lib/types/idea';
import {
  getPaginatedIdeas,
  searchIdeas,
  deleteGeneratedIdea,
  getIdeaStatistics,
} from '@/lib/utils/storage';
import { buildShareUrl } from '@/lib/share/shareUrl';

const CATEGORIES: IdeaCategory[] = [
  'Technology',
  'Travel',
  'Finance',
  'Health',
  'Education',
  'Entertainment',
  'Productivity',
  'Social',
  'E-commerce',
  'Other',
];

export default function IdeaHistory() {
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'generatedAt' | 'appName' | 'category'>('generatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<ReturnType<typeof getIdeaStatistics> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const limit = 12;

  // Load ideas with pagination and filtering
  const loadIdeas = () => {
    setIsLoading(true);

    try {
      // Apply search if query exists
      if (searchQuery.trim()) {
        const searchResults = searchIdeas(searchQuery);
        const filtered = selectedCategory
          ? searchResults.filter((idea) => idea.category === selectedCategory)
          : searchResults;

        // Manual pagination for search results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        setIdeas(filtered.slice(startIndex, endIndex));
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / limit));
      } else {
        // Regular paginated load
        const result = getPaginatedIdeas({
          page,
          limit,
          category: selectedCategory,
          sortBy,
          sortOrder,
        });

        setIdeas(result.ideas);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      }

      // Load statistics
      setStats(getIdeaStatistics());
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load ideas on mount and when filters change
  useEffect(() => {
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, sortBy, sortOrder, searchQuery]);

  // Handle delete
  const handleDelete = (ideaId: string) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      deleteGeneratedIdea(ideaId);
      loadIdeas();
    }
  };

  // Handle view
  const handleView = (idea: GeneratedIdea) => {
    try {
      // Convert to simpler Idea format for sharing
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

      const shareUrl = buildShareUrl(ideaForSharing);
      window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('Failed to open idea:', error);
      alert('Unable to open this idea. Please try again.');
    }
  };

  // Handle export
  const handleExport = (idea: GeneratedIdea) => {
    const dataStr = JSON.stringify(idea, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idea-${idea.uniqueId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    setSortBy('generatedAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Printer Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#E63946] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Printer</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-8 h-8 text-[#E63946]" />
            <h1 className="text-4xl font-bold text-[#1F2937]">Idea History</h1>
          </div>

          {stats && (
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                Total Ideas: <strong>{stats.total}</strong>
              </span>
              <span>
                Categories: <strong>{Object.keys(stats.byCategory).length}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Ideas
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, concept, or category..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || undefined);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'generatedAt' | 'appName' | 'category')
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                >
                  <option value="generatedAt">Date</option>
                  <option value="appName">Name</option>
                  <option value="category">Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button onClick={resetFilters} className="text-sm text-[#E63946] hover:underline">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946]"></div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No ideas found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery || selectedCategory
                ? 'Try adjusting your filters'
                : 'Start generating ideas!'}
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {ideas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-[#E63946] rounded-full">
                        {idea.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(idea.generatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-bold text-[#1F2937] mb-2 truncate"
                      title={idea.appName}
                    >
                      {idea.appName}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{idea.concept}</p>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs font-mono text-gray-400">{idea.uniqueId}</span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(idea)}
                          className="p-2 text-gray-600 hover:text-[#E63946] hover:bg-gray-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExport(idea)}
                          className="p-2 text-gray-600 hover:text-[#E63946] hover:bg-gray-50 rounded transition-colors"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(idea.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({total} total)
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
