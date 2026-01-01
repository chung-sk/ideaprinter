import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0dcd5] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>

        <p className="text-gray-600 mb-8">
          The printer can't find this page. It might have been moved, deleted, or never existed.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Printer
        </Link>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
            ERROR 404 // PAGE NOT FOUND
          </p>
        </div>
      </div>
    </div>
  );
}
