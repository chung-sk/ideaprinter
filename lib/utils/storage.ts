/**
 * Local storage utilities for persisting user preferences and generated ideas
 * Provides type-safe storage operations with error handling
 */

import type { GeneratedIdea, UserConfiguration, GenerationRequest } from '@/lib/types/idea';

const STORAGE_KEYS = {
  API_KEY: 'ideaprinter_api_key',
  PREFERRED_CATEGORY: 'ideaprinter_preferred_category',
  GENERATION_HISTORY: 'ideaprinter_history',
  GENERATED_IDEAS: 'ideaPrinter_generatedIdeas',
  USER_CONFIG: 'ideaPrinter_userConfig',
  CURRENT_REQUESTS: 'ideaPrinter_currentRequests',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Safely get an item from localStorage
 * Returns null if the item doesn't exist or if localStorage is unavailable
 */
export function getStorageItem(key: StorageKey): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * Returns true if successful, false otherwise
 */
export function setStorageItem(key: StorageKey, value: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEYS[key], value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * Returns true if successful, false otherwise
 */
export function removeStorageItem(key: StorageKey): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Get a JSON object from localStorage
 * Returns null if the item doesn't exist, is invalid JSON, or if localStorage is unavailable
 */
export function getStorageJSON<T>(key: StorageKey): T | null {
  const item = getStorageItem(key);
  if (!item) {
    return null;
  }

  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Set a JSON object in localStorage
 * Returns true if successful, false otherwise
 */
export function setStorageJSON<T>(key: StorageKey, value: T): boolean {
  try {
    const jsonString = JSON.stringify(value);
    return setStorageItem(key, jsonString);
  } catch (error) {
    console.error(`Error stringifying JSON for localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Clear all ideaprinter-related items from localStorage
 * Returns true if successful, false otherwise
 */
export function clearAllStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify localStorage read/write operations
 * Tests basic functionality and returns detailed status
 */
export function verifyStorageOperations(): {
  available: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  quota?: number;
  usage?: number;
  errors: string[];
} {
  const result: {
    available: boolean;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    quota?: number;
    usage?: number;
    errors: string[];
  } = {
    available: false,
    canRead: false,
    canWrite: false,
    canDelete: false,
    errors: [] as string[],
  };

  // Check if localStorage is available
  if (!isStorageAvailable()) {
    result.errors.push('localStorage is not available');
    return result;
  }

  result.available = true;

  // Test write operation
  const testKey = '__ideaprinter_verify_test__';
  const testValue = JSON.stringify({ test: true, timestamp: Date.now() });

  try {
    localStorage.setItem(testKey, testValue);
    result.canWrite = true;
  } catch (error) {
    result.errors.push(`Write failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test read operation
  try {
    const retrieved = localStorage.getItem(testKey);
    if (retrieved === testValue) {
      result.canRead = true;
    } else {
      result.errors.push('Read operation returned incorrect value');
    }
  } catch (error) {
    result.errors.push(`Read failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test delete operation
  try {
    localStorage.removeItem(testKey);
    const deleted = localStorage.getItem(testKey);
    if (deleted === null) {
      result.canDelete = true;
    } else {
      result.errors.push('Delete operation did not remove item');
    }
  } catch (error) {
    result.errors.push(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Get storage quota info (if available)
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then((estimate) => {
      if (estimate.quota && estimate.usage) {
        result.quota = estimate.quota;
        result.usage = estimate.usage;
      }
    }).catch(() => {
      // Quota estimation not critical, ignore errors
    });
  }

  return result;
}

// ============================================================================
// Data Model Storage Helpers (per data-model.md)
// ============================================================================

/**
 * Get all generated ideas from localStorage
 */
export function getGeneratedIdeas(): GeneratedIdea[] {
  const data = localStorage.getItem(STORAGE_KEYS.GENERATED_IDEAS);
  if (!data) return [];
  
  try {
    const ideas = JSON.parse(data) as GeneratedIdea[];
    // Filter out soft-deleted ideas by default
    return ideas.filter(idea => !idea.deletedAt);
  } catch (error) {
    console.error('Error parsing generated ideas:', error);
    return [];
  }
}

/**
 * Save a new generated idea to localStorage
 */
export function saveGeneratedIdea(idea: GeneratedIdea): boolean {
  try {
    const ideas = getAllGeneratedIdeas(); // Include deleted ones
    ideas.push(idea);
    localStorage.setItem(STORAGE_KEYS.GENERATED_IDEAS, JSON.stringify(ideas));
    return true;
  } catch (error) {
    console.error('Error saving generated idea:', error);
    return false;
  }
}

/**
 * Get all ideas including soft-deleted ones
 */
export function getAllGeneratedIdeas(): GeneratedIdea[] {
  const data = localStorage.getItem(STORAGE_KEYS.GENERATED_IDEAS);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as GeneratedIdea[];
  } catch (error) {
    console.error('Error parsing all generated ideas:', error);
    return [];
  }
}

/**
 * Soft delete an idea by ID
 */
export function deleteGeneratedIdea(ideaId: string): boolean {
  try {
    const ideas = getAllGeneratedIdeas();
    const updated = ideas.map(idea => 
      idea.id === ideaId ? { ...idea, deletedAt: new Date().toISOString() } : idea
    );
    localStorage.setItem(STORAGE_KEYS.GENERATED_IDEAS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error deleting generated idea:', error);
    return false;
  }
}

/**
 * Get user configuration from localStorage
 */
export function getUserConfig(): UserConfiguration | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER_CONFIG);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as UserConfiguration;
  } catch (error) {
    console.error('Error parsing user config:', error);
    return null;
  }
}

/**
 * Save user configuration to localStorage
 */
export function saveUserConfig(config: UserConfiguration): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_CONFIG, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving user config:', error);
    return false;
  }
}

/**
 * Get current generation requests from sessionStorage
 */
export function getGenerationRequests(): GenerationRequest[] {
  if (typeof window === 'undefined') return [];
  
  const data = sessionStorage.getItem(STORAGE_KEYS.CURRENT_REQUESTS);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as GenerationRequest[];
  } catch (error) {
    console.error('Error parsing generation requests:', error);
    return [];
  }
}

/**
 * Save a generation request to sessionStorage
 */
export function saveGenerationRequest(request: GenerationRequest): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const requests = getGenerationRequests();
    requests.push(request);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_REQUESTS, JSON.stringify(requests));
    return true;
  } catch (error) {
    console.error('Error saving generation request:', error);
    return false;
  }
}

/**
 * Update an existing generation request in sessionStorage
 */
export function updateGenerationRequest(requestId: string, updates: Partial<GenerationRequest>): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const requests = getGenerationRequests();
    const updated = requests.map(req => 
      req.id === requestId ? { ...req, ...updates } : req
    );
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_REQUESTS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error updating generation request:', error);
    return false;
  }
}

// ============================================================================
// History and Search Helpers
// ============================================================================

/**
 * Get idea by ID
 */
export function getIdeaById(ideaId: string): GeneratedIdea | null {
  try {
    const ideas = getGeneratedIdeas();
    return ideas.find(idea => idea.id === ideaId) || null;
  } catch (error) {
    console.error('Error getting idea by ID:', error);
    return null;
  }
}

/**
 * Get all ideas (non-deleted)
 */
export function getAllIdeas(): GeneratedIdea[] {
  return getGeneratedIdeas();
}

/**
 * Get paginated ideas with filtering and sorting
 */
export function getPaginatedIdeas(options: {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'generatedAt' | 'appName' | 'category';
  sortOrder?: 'asc' | 'desc';
}): {
  ideas: GeneratedIdea[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const {
    page = 1,
    limit = 10,
    category,
    sortBy = 'generatedAt',
    sortOrder = 'desc',
  } = options;

  try {
    let ideas = getGeneratedIdeas();

    // Filter by category
    if (category) {
      ideas = ideas.filter(idea => idea.category === category);
    }

    // Sort ideas
    ideas.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'generatedAt') {
        comparison = new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
      } else if (sortBy === 'appName') {
        comparison = a.appName.localeCompare(b.appName);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = ideas.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIdeas = ideas.slice(startIndex, endIndex);

    return {
      ideas: paginatedIdeas,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('Error getting paginated ideas:', error);
    return {
      ideas: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

/**
 * Check if an idea with similar content already exists (prevent duplicates)
 */
export function checkIdeaUniqueness(newIdea: {
  appName: string;
  concept: string;
}): { isUnique: boolean; similarIdea?: GeneratedIdea } {
  try {
    const ideas = getGeneratedIdeas();
    
    // Check for exact app name match
    const exactMatch = ideas.find(
      idea => idea.appName.toLowerCase() === newIdea.appName.toLowerCase()
    );

    if (exactMatch) {
      return { isUnique: false, similarIdea: exactMatch };
    }

    // Check for very similar concepts (simple string similarity)
    const conceptLower = newIdea.concept.toLowerCase();
    const similarConcept = ideas.find(idea => {
      const existingConceptLower = idea.concept.toLowerCase();
      // Simple similarity check: if concepts share >70% of words
      const newWords = new Set(conceptLower.split(/\s+/));
      const existingWords = new Set(existingConceptLower.split(/\s+/));
      const intersection = new Set([...newWords].filter(word => existingWords.has(word)));
      const similarity = intersection.size / Math.min(newWords.size, existingWords.size);
      return similarity > 0.7;
    });

    if (similarConcept) {
      return { isUnique: false, similarIdea: similarConcept };
    }

    return { isUnique: true };
  } catch (error) {
    console.error('Error checking idea uniqueness:', error);
    // On error, assume unique to not block generation
    return { isUnique: true };
  }
}

/**
 * Search ideas by text query (searches in appName, concept, theGap, theFix)
 */
export function searchIdeas(query: string): GeneratedIdea[] {
  try {
    const ideas = getGeneratedIdeas();
    const queryLower = query.toLowerCase().trim();

    if (!queryLower) {
      return ideas;
    }

    return ideas.filter(idea => {
      return (
        idea.appName.toLowerCase().includes(queryLower) ||
        idea.concept.toLowerCase().includes(queryLower) ||
        idea.theGap.toLowerCase().includes(queryLower) ||
        idea.theFix.toLowerCase().includes(queryLower) ||
        idea.category.toLowerCase().includes(queryLower)
      );
    });
  } catch (error) {
    console.error('Error searching ideas:', error);
    return [];
  }
}

/**
 * Get statistics about generated ideas
 */
export function getIdeaStatistics(): {
  total: number;
  byCategory: Record<string, number>;
  mostRecent?: GeneratedIdea;
  oldest?: GeneratedIdea;
} {
  try {
    const ideas = getGeneratedIdeas();
    
    const byCategory: Record<string, number> = {};
    ideas.forEach(idea => {
      byCategory[idea.category] = (byCategory[idea.category] || 0) + 1;
    });

    const sorted = [...ideas].sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    return {
      total: ideas.length,
      byCategory,
      mostRecent: sorted[0],
      oldest: sorted[sorted.length - 1],
    };
  } catch (error) {
    console.error('Error getting idea statistics:', error);
    return {
      total: 0,
      byCategory: {},
    };
  }
}

/**
 * Delete an idea permanently (not soft delete)
 */
export function deleteIdeaPermanently(ideaId: string): boolean {
  try {
    const ideas = getAllGeneratedIdeas();
    const filtered = ideas.filter(idea => idea.id !== ideaId);
    localStorage.setItem(STORAGE_KEYS.GENERATED_IDEAS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error permanently deleting idea:', error);
    return false;
  }
}
