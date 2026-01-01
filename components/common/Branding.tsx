import Link from 'next/link';

interface BrandingProps {
  className?: string;
  variant?: 'header' | 'footer';
}

export default function Branding({ className = '', variant = 'header' }: BrandingProps) {
  const isFooter = variant === 'footer';
  const size = isFooter ? 24 : 32;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/brand/ideaprinter-logo.svg"
          alt="IdeaPrinter Logo"
          width={size}
          height={size}
          className="object-contain"
        />
        <span
          className={`font-bold tracking-tight text-gray-800 ${isFooter ? 'text-lg' : 'text-xl'}`}
        >
          ideaprinter
        </span>
      </Link>
      <a
        href="https://rytix.tech"
        target="_blank"
        rel="noopener noreferrer"
        className={`uppercase tracking-widest text-gray-500 hover:text-gray-700 mt-1 ${isFooter ? 'text-[8px]' : 'text-[10px]'}`}
      >
        powered by rytix.tech
      </a>
    </div>
  );
}
