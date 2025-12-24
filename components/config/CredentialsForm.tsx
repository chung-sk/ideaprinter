'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Save, Trash2, Check, X } from 'lucide-react';
import { encryptApiKey, decryptApiKey, validateGeminiApiKey } from '@/lib/utils/encryption';
import { getUserConfig, saveUserConfig } from '@/lib/utils/storage';
import type { UserConfiguration, IdeaCategory, GeminiModel } from '@/lib/types/idea';
import { GEMINI_MODELS } from '@/lib/types/idea';

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

const MODEL_DESCRIPTIONS: Record<GeminiModel, string> = {
  'gemini-2.5-flash': '⭐ Recommended - Best for free tier, 1M tokens (June 2025)',
  'gemini-flash-latest': '🔄 Auto-updated - Always points to latest Flash version',
  'gemini-2.0-flash': '✅ Stable - Proven Flash model, great for free tier',
  'gemini-2.5-flash-lite': '⚡ Fastest - Lighter version for simple tasks',
  'gemini-2.5-pro': '🔒 Pro tier - More capable but stricter rate limits',
  'gemini-3-flash-preview': '🧪 Preview - Cutting edge, experimental features',
};

interface CredentialsFormProps {
  onClose?: () => void;
  onSave?: (config: UserConfiguration) => void;
}

export default function CredentialsForm({ onClose, onSave }: CredentialsFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-flash');
  const [selectedCategories, setSelectedCategories] = useState<IdeaCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  // Load existing configuration on mount
  useEffect(() => {
    const config = getUserConfig();
    if (config) {
      setHasExistingKey(!!config.encryptedGeminiApiKey);
      setSelectedModel(config.preferredModel || 'gemini-2.5-flash');
      setSelectedCategories(config.preferredCategories || []);
      
      // Try to decrypt and display existing key (masked)
      if (config.encryptedGeminiApiKey) {
        decryptApiKey(config.encryptedGeminiApiKey)
          .then((key) => {
            // Show only first 10 and last 4 characters
            const masked = `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
            setApiKey(masked);
          })
          .catch(() => {
            // Decryption failed, key may be corrupted
            setHasExistingKey(false);
          });
      }
    }
  }, []);

  const toggleCategory = (category: IdeaCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else if (prev.length < 5) {
        return [...prev, category];
      }
      return prev; // Max 5 categories
    });
    setError(null);
  };

  const handleValidate = async () => {
    setError(null);

    // If user provided an API key, validate it
    if (apiKey && !apiKey.includes('...')) {
      // Not a masked key, validate format
      if (!validateGeminiApiKey(apiKey)) {
        setError('Invalid API key format. Gemini API keys start with "AIza" and are 39 characters long.');
        return false;
      }

      // Validate with backend
      try {
        const response = await fetch('/api/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            geminiApiKey: apiKey,
            preferredCategories: selectedCategories,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to validate configuration');
          return false;
        }

        return true;
      } catch {
        setError('Network error. Please check your connection and try again.');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validate configuration
    const isValid = await handleValidate();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      // Encrypt API key if provided and not masked
      let encryptedKey: string | undefined;
      if (apiKey && !apiKey.includes('...')) {
        encryptedKey = await encryptApiKey(apiKey);
      } else if (hasExistingKey) {
        // Keep existing encrypted key
        const existingConfig = getUserConfig();
        encryptedKey = existingConfig?.encryptedGeminiApiKey;
      }

      // Create configuration object
      const config: UserConfiguration = {
        id: getUserConfig()?.id || crypto.randomUUID(),
        encryptedGeminiApiKey: encryptedKey,
        preferredModel: selectedModel,
        preferredCategories: selectedCategories,
        generationCount: getUserConfig()?.generationCount || 0,
        createdAt: getUserConfig()?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const saved = saveUserConfig(config);
      if (!saved) {
        setError('Failed to save configuration to local storage');
        setIsLoading(false);
        return;
      }

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Callback to parent
      onSave?.(config);

      // Clear sensitive data from memory
      if (apiKey && !apiKey.includes('...')) {
        setApiKey('');
        setShowApiKey(false);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your custom API key? You will use the default key for future generations.')) {
      // Clear configuration
      const existingConfig = getUserConfig();
      const config: UserConfiguration = {
        id: existingConfig?.id || crypto.randomUUID(),
        encryptedGeminiApiKey: undefined,
        preferredModel: selectedModel,
        preferredCategories: selectedCategories,
        generationCount: existingConfig?.generationCount || 0,
        createdAt: existingConfig?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveUserConfig(config);
      setApiKey('');
      setHasExistingKey(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800"
        >
          <Check className="w-5 h-5" />
          <span>Configuration saved successfully!</span>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* API Key Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gemini API Key (Optional)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Provide your own Gemini API key for unlimited generations. Leave empty to use the shared default key.
        </p>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        {hasExistingKey && (
          <p className="text-xs text-gray-500 mt-2">
            You have a custom API key saved. It will be used for all generations.
          </p>
        )}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-red-600 hover:text-red-700 mt-2 inline-block"
        >
          Get a Gemini API key →
        </a>
      </div>

      {/* AI Model Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Choose which Gemini model to use for generating ideas. Different models offer different trade-offs between speed and quality.
        </p>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
        >
          {GEMINI_MODELS.map((model) => (
            <option key={model} value={model}>
              {model} - {MODEL_DESCRIPTIONS[model]}
            </option>
          ))}
        </select>
      </div>

      {/* Preferred Categories Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Categories (Optional, max 5)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Select categories you're most interested in. Ideas will prioritize these themes.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              disabled={isLoading || (!selectedCategories.includes(category) && selectedCategories.length >= 5)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                selectedCategories.includes(category)
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {selectedCategories.length}/5 categories selected
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </motion.button>

        {hasExistingKey && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClear}
            disabled={isLoading}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Clear Key
          </motion.button>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Privacy Note:</strong> Your API key is encrypted and stored locally in your browser.
        It never leaves your device and is only used to make requests to Gemini on your behalf.
      </div>
    </motion.div>
  );
}
