import CredentialsForm from '@/components/config/CredentialsForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Configuration - Idea Printer',
  description: 'Configure your API keys and preferences for Idea Printer',
};

export default function ConfigPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#e0dcd5]">
      {/* Back Button */}
      <Link
        href="/printer"
        className="fixed top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-md transition-colors text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">Back to Printer</span>
      </Link>

      {/* Configuration Form */}
      <CredentialsForm />

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-xs font-mono tracking-widest opacity-60">
        <p>SECURE CONFIGURATION // ENCRYPTED STORAGE</p>
      </div>
    </div>
  );
}
