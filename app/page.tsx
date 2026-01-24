import PrinterInterface from '@/components/printer/PrinterInterface';
import { Header } from '@/components/common/Header';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PrinterInterface />
      </main>
    </>
  );
}
