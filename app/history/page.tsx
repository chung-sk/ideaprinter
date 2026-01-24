import { Metadata } from 'next';
import IdeaHistory from '@/components/history/IdeaHistory';
import { Header } from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'Idea History - Idea Printer',
  description: 'View your generated app ideas history, search, filter, and export your favorite ideas.',
};

export default function HistoryPage() {
  return (
    <>
      <Header />
      <IdeaHistory />
    </>
  );
}
